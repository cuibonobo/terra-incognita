import { Router } from 'itty-router';
import { apiRouter } from './routes';

const rootRouter = Router();

// Set relative routes
rootRouter.all('/api/*', apiRouter.handle);

// 404 for everything else
rootRouter.all('*', () => new Response('Not Found.', { status: 404 }));

const worker: ExportedHandler<Bindings> = {
  fetch: async (request: Request, env: Bindings) => {
    try {
      return rootRouter.handle(request, env);
    } catch (e) {
      return new Response(`${e}`);
    }
  }
};

export default worker;
