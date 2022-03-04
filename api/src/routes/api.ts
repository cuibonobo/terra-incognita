import { Router } from 'itty-router';

const apiRouter = Router({ base: '/api' });

apiRouter.get('/meta', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('meta'));
});

apiRouter.get('/numImagesSqrt', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('numImagesSqrt'));
});

apiRouter.get('/imgSquareSize', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('imgSquareSize'));
});

apiRouter.get('/totalImages', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('totalImages'));
});

apiRouter.get('/imgArray', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get('imgArray'));
});

// 404 for everything else
apiRouter.all('*', () => jsonifyResponse({message: 'Not found'}, {status: 404}));

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

export default apiRouter;
