const BASE_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://terra-incognita.haverstack.workers.dev'
    : 'http://localhost:8787';

export interface Meta {
  imgHashtag: string,
  numImagesSqrt: number,
  imgSquareSize: number,
  imgWidth: number,
  imgHeight: number
}

const getUrl = (path: string): string => {
  return new URL(path, BASE_URL).href;
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

export default api;
