import { JSONObject, JSONValue, stringify,ErrorTypes } from "../../../shared";

const JOIN_TIMEOUT = 1;
const JOIN_RETRIES = 30;
const REJOIN_TIMEOUT = 3;
const HEARTBEAT_TIMEOUT = 30;

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
  let joining: boolean = false;
  let joinRetries: number = 0;
  let rejoining: boolean;
  let ws: WebSocket;

  const connect = () => {
    if (joining) {
      return;
    }
    console.debug("Initializing WebSocket...");
    sessionId = null;
    startTime = Date.now();
    lastSeenTimestamp = 0;
    joining = true;
    rejoining = false;
    ws = new WebSocket(messagesUrl);
    setTimeout(() => {
      if (joining) {
        ws.close();
        joining = false;
        joinRetries += 1;
        if (joinRetries >= JOIN_RETRIES) {
          window.location.reload();
        } else {
          console.log("Rejoin attempt #", joinRetries);
        }
      }
    }, JOIN_TIMEOUT * 1000);
    initializeWebsocket(ws);
  };

  const rejoin = async () => {
    if (joining) {
      return;
    }
    if (rejoining) {
      console.log("Rejoin request is too soon. Can't rejoin yet...");
      return;
    }
    rejoining = true;

    const timeSinceLastJoin = Date.now() - startTime;
    if (timeSinceLastJoin < REJOIN_TIMEOUT * 1000) {
      await new Promise((resolve) => setTimeout(resolve, (REJOIN_TIMEOUT * 1000) - timeSinceLastJoin));
    }
    connect();
  };

  const send = (data: JSONObject) => {
    if (sessionId === null || !ws) {
      errorHandler(new Error("WebSocket is not ready for messages yet!"));
      return;
    }
    ws.send(stringify(data));
  };

  const initializeWebsocket = (ws: WebSocket) => {
    ws.addEventListener('open', (_: Event) => {
      // Send an empty object as our first message
      console.debug("WebSocket has opened.");
      joining = false;
      joinRetries = 0;
      ws.send(stringify({}));
    });
    ws.addEventListener('close', (_: CloseEvent) => {
      if (!rejoining) {
        errorHandler(new Error("Server connection closed"));
        rejoin();
      }
    });
    ws.addEventListener('error', (_: Event) => {
      if (!ws.CLOSED) {
        ws.close();
      }
      if (!rejoining) {
        errorHandler(new Error("Connection error!"));
        rejoin();
      }
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
        messageHandler(data);
        return;
      }
  
      if (data.heartbeat) {
        // Don't do anything with heartbeats
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
  };

  connect();

  // Create a heartbeat
  setInterval(() => {
    if (!sessionId) {
      return;
    }
    send({heartbeat: sessionId});
  }, HEARTBEAT_TIMEOUT * 1000);

  return {
    send
  };
};

export default messagesFactory;
