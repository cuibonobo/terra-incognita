import { Meta, stringify } from '../../../shared';

const BASE_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://terra.cuibonobo.com'
    : 'http://localhost:8787';

const getUrl = (path: string): string => {
  return new URL(`/api${path}`, BASE_URL).href;
};

const isResponseError = (response: Response) => {
  return response.status < 200 || response.status >= 400;
};

const throwOnResponseError = async (response: Response) => {
  if (isResponseError(response)) {
    throw new Error(`Error at '${response.url}': ${await response.text()}`);
  }
};

const get = async <T>(path: string): Promise<T> => {
  const response = await fetch(getUrl(path));
  await throwOnResponseError(response);
  return response.json();
};
const httpDataMethod = async <InputT, OutputT>(method: string, path: string, data: InputT): Promise<OutputT> => {
  const response = await fetch(getUrl(path), {
    method,
    body: stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await throwOnResponseError(response);
  const result = response.json();
  return result;
};
const post = async <InputT, OutputT>(path: string, data: InputT): Promise<OutputT> => {
  return httpDataMethod('POST', path, data);
};
const put = async <InputT, OutputT>(path: string, data: InputT): Promise<OutputT> => {
  return httpDataMethod('PUT', path, data);
};

const api = {
  get,
  post,
  put
};

export const getMeta = async (): Promise<Meta> => {
  return await api.get<Meta>('/meta');
};

export const getImgSquareSize = async (): Promise<number> => {
  return api.get<number>('/imgSquareSize');
};

export const putImgSquareSize = async (imgSquareSize: number): Promise<number> => {
  return api.put<number, number>('/imgSquareSize', imgSquareSize);
};

export const getNumImagesSqrt = async (): Promise<number> => {
  return api.get<number>('/numImagesSqrt');
};

export const putNumImagesSqrt = async (numImagesSqrt: number): Promise<number> => {
  return api.put<number, number>('/numImagesSqrt', numImagesSqrt);
};

export const getTotalImages = async (): Promise<number> => {
  return api.get<number>('/totalImages');
};

export const getImgArray = async (): Promise<number[]> => {
  return api.get<number[]>('/imgArray');
};

export const postImgArray = async (imgIndex: number): Promise<number> => {
  return api.post<number, number>('/imgArray', imgIndex);
};

export default api;
