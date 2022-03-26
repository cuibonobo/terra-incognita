import { Meta, stringify } from '../../../shared';

const isResponseError = (response: Response) => {
  return response.status < 200 || response.status >= 400;
};

const throwOnResponseError = async (response: Response) => {
  if (isResponseError(response)) {
    throw new Error(`Error at '${response.url}': ${await response.text()}`);
  }
};

const apiFactory = () => {
  const hostname = (new URL(window.location.href).hostname);
  const baseUrl = process.env.NODE_ENV == 'production' ? 'https://terra.cuibonobo.com' : `http://${hostname}:8787`;

  const getUrl = (path: string): string => {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return new URL(`/api${path}`, baseUrl).href;
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

  return {
    getMeta: async (): Promise<Meta> => {
      return get<Meta>('/meta');
    },
    getImgSquareSize: async (): Promise<number> => {
      return get<number>('/imgSquareSize');
    },
    putImgSquareSize: async (imgSquareSize: number): Promise<number> => {
      return put<number, number>('/imgSquareSize', imgSquareSize);
    },
    getNumImagesSqrt: async (): Promise<number> => {
      return get<number>('/numImagesSqrt');
    },
    putNumImagesSqrt: async (numImagesSqrt: number): Promise<number> => {
      return put<number, number>('/numImagesSqrt', numImagesSqrt);
    },
    getTotalImages: async (): Promise<number> => {
      return get<number>('/totalImages');
    },
    getImgArray: async (): Promise<number[]> => {
      return get<number[]>('/imgArray');
    },
    postImgArray: async (imgIndex: number): Promise<number[]> => {
      return post<number, number[]>('/imgArray', imgIndex);
    }
  }
};

export default apiFactory;
