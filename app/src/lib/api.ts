const BASE_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://terra.cuibonobo.com'
    : 'http://localhost:8787';

export interface Meta {
  imgHashtag: string,
  imgWidth: number,
  imgHeight: number
}

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

const get = async (path: string): Promise<JSONValue> => {
  const response = await fetch(getUrl(path));
  await throwOnResponseError(response);
  return response.json();
};
const post = async (path: string, data: JSONValue): Promise<JSONValue> => {
  const response = await fetch(getUrl(path), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await throwOnResponseError(response);
  return response.json();
};

const api = {
  get,
  post,
};

export const getMeta = async (): Promise<Meta> => {
  const response: unknown = await api.get('/meta');
  return response as Meta;
};

export const getImgSquareSize = async (): Promise<number> => {
  const response: unknown = await api.get('/imgSquareSize');
  return response as number;
};

export const getNumImagesSqrt = async (): Promise<number> => {
  const response: unknown = await api.get('/numImagesSqrt');
  return response as number;
};

export const getTotalImages = async (): Promise<number> => {
  const response: unknown = await api.get('/totalImages');
  return response as number;
};

export const getImgArray = async (): Promise<number[]> => {
  const response: unknown = await api.get('/imgArray');
  return response as number[];
};

export default api;
