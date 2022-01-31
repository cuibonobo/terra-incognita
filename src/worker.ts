const worker: ExportedHandler<Bindings> = {
  fetch: async (request: Request, env: Bindings) => {
    try {
      return await handleRequest(request, env);
    } catch (e) {
      return new Response(`${e}`);
    }
  }
};

const handleRequest = async (request: Request, env: Bindings) => {
  return new Response("Hello, world!");
};

export default worker;
