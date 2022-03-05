import { Router } from 'itty-router';
import { Meta, getRandomUniqueValue } from '../../../shared';

const apiRouter = Router({ base: '/api' });

apiRouter.get('/meta', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('meta'));
});

apiRouter.get('/numImagesSqrt', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('numImagesSqrt'));
});

apiRouter.put('/numImagesSqrt', async (request: Request, env: Bindings) => {
  const numImagesSqrt = await request.json<number>();
  const meta: Meta = await getKvData<Meta>('meta', env);
  if (numImagesSqrt < meta.minNumImagesSqrt || numImagesSqrt > meta.maxNumImagesSqrt) {
    return jsonifyResponse(
      {message: `Value out of bounds! Must be between ${meta.minNumImagesSqrt} and ${meta.maxNumImagesSqrt}`},
      {status: 422}
    );
  }
  await putKvData('numImagesSqrt', numImagesSqrt, env);
  return jsonifyResponse(numImagesSqrt);
});

apiRouter.get('/imgSquareSize', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('imgSquareSize'));
});

apiRouter.put('/imgSquareSize', async (request: Request, env: Bindings) => {
  const imgSquareSize = await request.json<number>();
  const meta: Meta = await getKvData<Meta>('meta', env);
  if (imgSquareSize < meta.minImgSquareSize || imgSquareSize > meta.maxImgSquareSize) {
    return validationError(`Value out of bounds! Must be between ${meta.minImgSquareSize} and ${meta.maxImgSquareSize}`);
  }
  await putKvData('imgSquareSize', imgSquareSize, env);
  return jsonifyResponse(imgSquareSize);
});

apiRouter.get('/totalImages', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('totalImages'));
});

apiRouter.get('/imgArray', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('imgArray'));
});

apiRouter.post('/imgArray', async (request: Request, env: Bindings) => {
  const arrayIdx = await request.json<number>();
  const meta: Meta = await getKvData<Meta>('meta', env);
  const maxNumImages = Math.pow(meta.maxNumImagesSqrt, 2);
  if (arrayIdx >= maxNumImages || arrayIdx < 0) {
    return validationError(`Value out of bounds! Must be between 0 and ${maxNumImages}`);
  }
  const totalImages: number = await getKvData<number>('totalImages', env);
  const imgArray: number[] = await getKvData<number[]>('imgArray', env);
  imgArray[arrayIdx] = getRandomUniqueValue(0, totalImages, imgArray);
  await putKvData('imgArray', imgArray, env);
  return jsonifyResponse(imgArray);
});

// 404 for everything else
apiRouter.all('*', () => jsonifyResponse({message: 'Not found'}, {status: 404}));

const getKvData = async <T>(key: string, env: Bindings): Promise<T> => {
  const result = await env.DATA.get(key);
  if (result === null) {
    throw new Error(`Key '${key}' does not exist in database!`);
  }
  return JSON.parse(result) as T;
};

const putKvData = async <T>(key: string, value: T, env: Bindings): Promise<void> => {
  return await env.DATA.put(key, JSON.stringify(value));
};

const jsonifyResponse = (value: any, opts: ResponseInit = {}): Response => {
  if (!opts.headers) {
    opts.headers = {};
  }
  opts.headers = {
    ...opts.headers,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  return new Response(typeof(value) === 'string' ? value : JSON.stringify(value), opts);
};

const validationError = (message: string): Response => {
  return jsonifyResponse({message}, {status: 422});
};

export default apiRouter;
