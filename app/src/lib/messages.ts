import { JSONObject, JSONValue, stringify,ErrorTypes } from "../../../shared";

const REJOIN_TIMEOUT = 10;

export class RateLimitError extends Error {};
export class WebSocketError extends Error {};
export class ConnectionError extends Error {};
export class ServerError extends Error {};

export interface WebSocketErrorMessage {
  type: ErrorTypes,
  error: string
}

export const getErrorFromWebSocketMessage = (err: WebSocketErrorMessage): Error  => {
  switch(err.type) {
    case ErrorTypes.RateLimitError:
      return new RateLimitError(err.error);
    case ErrorTypes.WebSocketError:
      return new WebSocketError(err.error);
    case ErrorTypes.ConnectionError:
      return new ConnectionError(err.error);
    case ErrorTypes.ServerError:
      return new ServerError(err.error);
    default:
      return new Error(err.error);
  }
};

const messagesFactory = (messageHandler: (data: JSONObject) => void, errorHandler: (error: Error) => void) => {
  const hostname = (new URL(window.location.href).hostname);
  const baseUrl = process.env.NODE_ENV == 'production' ? 'wss://terra.cuibonobo.com' : `ws://${hostname}:8787`;
  const messagesUrl = baseUrl + '/messages';

  let sessionId: string | null;
  let startTime: number;
  let lastSeenTimestamp: number;
  let rejoined: boolean;
  let ws: WebSocket = new WebSocket(messagesUrl);

  const init = () => {
    console.debug("Initializing WebSocket...");
    sessionId = null;
    startTime = Date.now();
    lastSeenTimestamp = 0;
    rejoined = false;
    ws = new WebSocket(messagesUrl);
    // TODO: Reload the page if the WebSocket hasn't opened before a timeout
  };

  const rejoin = async () => {
    if (rejoined) {
      console.log("Rejoin request is too soon. Can't rejoin yet...");
      return;
    }
    rejoined = true;

    const timeSinceLastJoin = Date.now() - startTime;
    if (timeSinceLastJoin < REJOIN_TIMEOUT * 1000) {
      await new Promise((resolve) => setTimeout(resolve, (REJOIN_TIMEOUT * 1000) - timeSinceLastJoin));
    }
    init();
  };

  const send = (data: JSONObject) => {
    if (sessionId === null) {
      errorHandler(new Error("WebSocket is not ready for messages yet!"));
      return;
    }
    ws.send(stringify(data));
  };

  init();

  ws.addEventListener('open', (_: Event) => {
    // Send an empty object as our first message
    console.debug("WebSocket has opened.");
    ws.send(stringify({}));
  });
  ws.addEventListener('close', (_: CloseEvent) => {
    errorHandler(new Error("Server connection closed"));
    rejoin();
  });
  ws.addEventListener('error', (_: Event) => {
    errorHandler(new Error("Connection error!"));
    rejoin();
  });

  ws.addEventListener('message', (event: MessageEvent) => {
    const data: JSONValue = JSON.parse(event.data);

    if (!(typeof data === 'object' && !Array.isArray(data))) {
      // Ignore all messages that don't parse to an object
      return;
    }

    if (data.error) {
      const error = (data as unknown) as WebSocketErrorMessage;
      console.log("handling event listener error", error)
      return errorHandler(getErrorFromWebSocketMessage(error));
    }

    if (data.ready) {
      sessionId = data.sessionId as string;
      return;
    }

    // Reject messages that don't have expected keys
    if (!data.timestamp || !data.sessionId) {
      console.debug("Missing timestamp or session ID. Rejecting.");
      return;
    }

    // Reject messages we've already seen before
    if (data.timestamp < lastSeenTimestamp) {
      console.debug("Duplicate timestamp. Rejecting.");
      return;
    } else {
      lastSeenTimestamp = data.timestamp as number;
    }

    if (sessionId && data.sessionId && sessionId === data.sessionId) {
      console.debug("Ignoring message from same sender", sessionId);
      return;
    }
    messageHandler(data);
  });

  return {
    send
  };
};

export default messagesFactory;
