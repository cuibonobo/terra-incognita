import { ErrorTypes, stringify } from "../../../shared";

export const getKvData = async <T>(key: string, env: Bindings): Promise<T> => {
  const result = await env.DATA.get(key);
  if (result === null) {
    throw new Error(`Key '${key}' does not exist in database!`);
  }
  return JSON.parse(result) as T;
};

export const putKvData = async <T>(key: string, value: T, env: Bindings): Promise<void> => {
  return env.DATA.put(key, stringify(value));
};

export const jsonifyResponse = (value: any, opts: ResponseInit = {}): Response => {
  if (!opts.headers) {
    opts.headers = {};
  }
  opts.headers = {
    ...opts.headers,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  return new Response(stringify(value), opts);
};

export const validationError = (message: string): Response => {
  return jsonifyResponse({message}, {status: 422});
};

export const optionsResponse = (options: string = '*'): Response => {
  return new Response(undefined, {status: 204, headers: {
    'Content-Type': 'text/plain',
    'Allow': options,
    'Access-Control-Allow-Methods': options,
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*'
  }});
};

export const closeWebsocket = (websocket: WebSocket, message?: string) => {
  websocket.close(1011, message);
};

export const sendWebsocketMessage = (websocket: WebSocket, message: any) => {
  websocket.send(stringify(message));
};

export const sendWebsocketReady = (websocket: WebSocket, sessionId: string) => {
  sendWebsocketMessage(websocket, {ready: true, sessionId});
};

export const sendWebsocketError = (websocket: WebSocket, errorType: ErrorTypes, message?: string) => {
  sendWebsocketMessage(websocket, {error: message ? message : errorType, type: errorType});
};

export const handleErrors = (request: Request, func: () => Promise<Response>) => {
  try {
    return func();
  } catch(e) {
    const err = e as Error;
      if (request.headers.get('Upgrade') === 'websocket') {
        // Devtools fail to show the response body for WebSocket requests if
        // we return an HTTP error. Instead we show a WebSocket error response.
        const [client, worker] = Object.values(new WebSocketPair());
        (worker as any).accept();  // FIXME: @cloudflare/workers-types isn't working here
        sendWebsocketError(worker, ErrorTypes.WebSocketError, err.stack);
        closeWebsocket(worker, 'Uncaught exception during session startup');
        return new Response(null, {status: 101, webSocket: client});
      }
      return new Response(err.stack, {status: 500});
  }
};
