import itty from 'itty-router';
import { jsonifyResponse, optionsResponse, validationError, getKvData, putKvData } from '../lib/workers';
import { Meta, getRandomUniqueValue } from '../../../shared';

const apiRouter = itty.Router({ base: '/api' });

apiRouter.get('/healthy', async (request: Request, env: Bindings) => {
  return jsonifyResponse({healthy: true}, {headers: {'Cache-Control': 'no-cache'}});
});

apiRouter.get('/meta', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await getKvData('meta', env));
});

apiRouter.get('/numImagesSqrt', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await getKvData('numImagesSqrt', env));
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

apiRouter.options('/numImagesSqrt', (request: Request, env: Bindings) => {
  return optionsResponse('OPTIONS, GET, PUT');
});

apiRouter.get('/imgSquareSize', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await getKvData('imgSquareSize', env));
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

apiRouter.options('/imgSquareSize', (request: Request, env: Bindings) => {
  return optionsResponse('OPTIONS, GET, PUT');
});

apiRouter.get('/totalImages', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await getKvData('totalImages', env));
});

apiRouter.get('/imgArray', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await getKvData('imgArray', env));
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
  const newImage = getRandomUniqueValue(0, totalImages, imgArray);
  imgArray[arrayIdx] = newImage;
  await putKvData('imgArray', imgArray, env);
  return jsonifyResponse(imgArray);
});

apiRouter.options('/imgArray', (request: Request, env: Bindings) => {
  return optionsResponse('OPTIONS, GET, POST');
});

// 404 for everything else
apiRouter.all('*', () => jsonifyResponse({message: 'Not found'}, {status: 404}));

export default apiRouter;
