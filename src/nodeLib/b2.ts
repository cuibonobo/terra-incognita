import path from 'path';
import crypto from 'crypto';
import { escape } from 'querystring';
import fetch, { BodyInit, HeadersInit, Response } from 'node-fetch';
import { readFile, writeFile } from './fs';

const credentialsFile = 'credentials.json';

interface Credentials {
  absoluteMinimumPartSize: number,
  accountId: string,
  allowed: {
    bucketId: string,
    bucketName: string,
    capabilities: string[],
    namePrefix: string | null
  },
  apiUrl: string,
  authorizationToken: string,
  downloadUrl: string,
  minimumPartSize: number,
  recommendedPartSize: number,
  s3ApiUrl: string
}

interface Retention {
  defaultRetention: {
    mode: string,
    period: {
      duration: number | null,
      unit: string | null
    }
  },
  isFileLockEnabled: boolean
}

interface FileLockConfiguration {
  isClientAuthorizedToRead: boolean,
  value: Retention | null
}

interface UploadUrl {
  bucketId: string,
  uploadUrl: string,
  authorizationToken: string
}

interface UploadFile {
  accountId: string,
  action: string,
  bucketId: string,
  contentLength: 5,
  contentMd5: string,
  contentSha1: string,
  contentType: string,
  fileId: string,
  fileInfo: JSONValue,
  fileName: string,
  fileRetention: FileLockConfiguration,
  legalHold: FileLockConfiguration,
  serverSideEncryption?: { algorithm?: string | null, mode: string | null },
  uploadTimestamp: number
}

const isResponseError = (response: Response) => {
  return response.status < 200 || response.status >= 400;
};

const throwOnResponseError = async (response: Response) => {
  if (isResponseError(response)) {
    throw new Error(`Error at '${response.url}': ${await response.text()}`);
  }
};

const get = async <T>(url: string, headers: HeadersInit = {}): Promise<T> => {
  headers = {
    'Accept': 'application/json',
    ...headers
  };
  const response = await fetch(url, {headers});
  await throwOnResponseError(response);
  return response.json() as Promise<T>;
};
const post = async <OutputT>(url: string, body: BodyInit, headers: HeadersInit = {}): Promise<OutputT> => {
  headers = {
    'Content-Type': 'application/json',
    ...headers
  };
  const response = await fetch(url, {
    method: 'POST',
    body,
    headers,
  });
  await throwOnResponseError(response);
  return response.json() as Promise<OutputT>;
};

export const getCredentials = async (credentialsDir: string = './'): Promise<Credentials> => {
  return JSON.parse((await readFile(path.join(credentialsDir, credentialsFile))).toString());
};

export const setCredentials = async (credentials: Credentials, credentialsDir: string = './') => {
  await writeFile(path.join(credentialsDir, credentialsFile), JSON.stringify(credentials));
};

export const getAuthenticatedClient = async (credentialsDir: string = './'): Promise<B2Client> => {
  return new B2Client(await getCredentials(credentialsDir));
};

export const authenticate = async (appKeyId: string, appKey: string): Promise<Credentials> => {
  const encodedBase64 = Buffer.from(appKeyId + ':' + appKey).toString('base64');
  return post('https://api.backblazeb2.com/b2api/v1/b2_authorize_account', JSON.stringify({}), {'Authorization': `Basic ${encodedBase64}`});
};

export class B2Client {
  credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = credentials;
  }

  _uploadFile = async (uploadUrl: UploadUrl, uploadName: string, fileBuffer: Buffer): Promise<UploadFile> => {
    return post(uploadUrl.uploadUrl, fileBuffer, {
      'Authorization': uploadUrl.authorizationToken,
      'X-Bz-File-Name': uploadName,
      'Content-Type': 'b2/x-auto',
      'Content-Length': Buffer.byteLength(fileBuffer).toString(),
      'X-Bz-Content-Sha1': this.getSha1(fileBuffer)
    });
  };

  uploadFile = async (filePath: string | string[], destFolder: string = '', bucketId: string = this.credentials.allowed.bucketId): Promise<{uploads: UploadFile[], errors: string[]}> => {
    const filePaths: string[] = typeof filePath === 'string' ? [filePath] : filePath;
    const uploadUrl: UploadUrl = await this.getUploadUrl(bucketId);
    const uploads: UploadFile[] = [];
    const errors: string[] = [];
    for (const file of filePaths) {
      const absPath: string = path.resolve(file);
      try {
        const fileBuffer: Buffer = await readFile(absPath);
        const upload = await this._uploadFile(uploadUrl, this.getUploadName(absPath, destFolder), fileBuffer);
        uploads.push(upload);
      } catch(e) {
        errors.push(`Couldn't upload ${file}: ${e}`);
      }
    }
    return {uploads, errors};
  };

  getSha1 = (fileBuffer: Buffer): string => {
    return crypto.createHash('sha1').update(fileBuffer).digest('hex');
  };

  getUploadName = (filePath: string, destFolder: string = ''): string => {
    // remove start and end slashes
    destFolder = destFolder.split('/').filter(x => x).join('/');
    return destFolder ? escape(destFolder + '/' + path.basename(filePath)) : path.basename(filePath);
  };

  getUploadUrl = async (bucketId: string = this.credentials.allowed.bucketId): Promise<UploadUrl> => {
    return post(this.getOperationUrl('b2_get_upload_url'), JSON.stringify({bucketId}), this.getHeaders());
  };

  getOperationUrl = (operation: string): string => {
    return this.credentials.apiUrl + '/b2api/v1/' + operation;
  };

  getHeaders = (headers: HeadersInit = {}): HeadersInit => {
    return {
      'Authorization': this.credentials.authorizationToken,
      ...headers
    }
  };
}
