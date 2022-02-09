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
  const { pathname } = new URL(request.url);

  if (pathname.startsWith("/api")) {
    return new Response(JSON.stringify({ pathname }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const value = await env.DATA.get("foo");
  return new Response(value ? value : "No key 'foo'");
};

export default worker;
