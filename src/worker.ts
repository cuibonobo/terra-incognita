import { Router } from 'itty-router';

const router = Router();

router.get('/meta', async (request: Request, env: Bindings) => {
  return jsonifyResponse(await env.DATA.get("meta"));
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

const worker: ExportedHandler<Bindings> = {
  fetch: async (request: Request, env: Bindings) => {
    try {
      return router.handle(request, env);
    } catch (e) {
      return new Response(`${e}`);
    }
  }
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
  return new Response(typeof(value) === "string" ? value : JSON.stringify(value), opts);
};

export default worker;
