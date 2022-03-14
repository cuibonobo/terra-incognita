import { Router } from 'itty-router';
import { handleErrors } from './lib/workers';
import { apiRouter, messagesRouter, siteRouter } from './routes';

const rootRouter = Router();

// Set relative routes
rootRouter.all('/api/*', apiRouter.handle);
rootRouter.all('/messages/*', messagesRouter.handle);
rootRouter.all('*', siteRouter.handle);

const worker: ExportedHandler<Bindings> = {
  fetch: async (request: Request, env: Bindings) => {
    return handleErrors(request, () => {
      return rootRouter.handle(request, env);
    });
  }
};

export default worker;
