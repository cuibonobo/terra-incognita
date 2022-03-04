import { Router } from 'itty-router';
import { apiRouter, siteRouter } from './routes';

const rootRouter = Router();

// Set relative routes
rootRouter.all('/api/*', apiRouter.handle);
rootRouter.all('*', siteRouter.handle);

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
