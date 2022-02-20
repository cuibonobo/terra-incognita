
import fetch, { BodyInit, HeadersInit, Response } from 'node-fetch';

const isResponseError = (response: Response) => {
  return response.status < 200 || response.status >= 400;
};

const throwOnResponseError = async (response: Response) => {
  if (isResponseError(response)) {
    throw new Error(`Error at '${response.url}': ${await response.text()}`);
  }
};

export const get = async (url: string, headers: HeadersInit = {}): Promise<string> => {
  const response = await fetch(url, {headers});
  await throwOnResponseError(response);
  return response.text();
};

export const post = async <OutputT>(url: string, body: BodyInit, headers: HeadersInit = {}): Promise<OutputT> => {
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
