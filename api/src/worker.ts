import itty from 'itty-router';
import { handleErrors } from './lib/workers';
import { apiRouter, messagesRouter, siteRouter } from './routes';
import { Messenger, RateLimiter } from './durableObjects';

const rootRouter = itty.Router();

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

export { Messenger, RateLimiter };
