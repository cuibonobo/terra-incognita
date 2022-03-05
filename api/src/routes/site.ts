import { Router } from 'itty-router';

// TODO: Leaving caching off until the code is more mature

const BASE_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://terra-site.cuibonobo.com'
    : 'http://localhost:8000';
// const CACHE_NAME = 'terra';

const siteRouter = Router({ base: '/' });

siteRouter.get('*', async (request: Request, env: Bindings) => {
  // Return a cached response if we have one
  // const cache = await caches.open(CACHE_NAME);
  // const cachedResponse = await cache.match(request);
  // if (cachedResponse) {
  //   return cachedResponse;
  // }
  // If the path is not a filename, redirect if the path ends in a slash, and
  // use 'index.html' for all other paths
  const parsedUrl = new URL(request.url);
  let path = parsedUrl.pathname;
  if (!pathIsFilename(path)) {
    if (path !== '/' && path.endsWith('/')) {
      return Response.redirect(`${parsedUrl.origin}${path.slice(0, -1)}`, 301);
    }
    path = '/index.html';
  }
  // Fetch the file from B2 storage
  const b2Response = await fetch(`${BASE_URL}${path}`);
  // Create the response object
  const response = new Response(b2Response.body, {
    ...b2Response,
    headers: {
      'Cache-Control': 'public, max-age=14400',
      'Content-Type': b2Response.headers.get('Content-Type')!
    }
  });
  // Cache the response if it wasn't an error
  // if (response.status < 400) {
  //   await cache.put(request, response);
  // }
  return response;
});

const pathIsFilename = (path: string): boolean => {
  return path.substring(path.lastIndexOf('/')).indexOf('.') >= 0;
};

export default siteRouter;
