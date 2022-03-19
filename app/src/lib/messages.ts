import { JSONObject, JSONValue, stringify } from "../../../shared";

const REJOIN_TIMEOUT = 10;

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
      console.error("Can't rejoin yet...");
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
      console.error("WebSocket is not ready for messages yet!");
      return;
    }
    ws.send(stringify(data));
  };

  init();

  ws.addEventListener('open', (event: Event) => {
    // Send an empty object as our first message
    console.debug("WebSocket has opened.");
    ws.send(stringify({}));
  });
  ws.addEventListener('close', (event: CloseEvent) => {
    console.error("WebSocket closed, reconnecting:", event.code, event.reason);
    rejoin();
  });
  ws.addEventListener('error', (_: Event) => {
    console.error("WebSocket error, reconnecting.");
    rejoin();
  });

  ws.addEventListener('message', (event: MessageEvent) => {
    const data: JSONValue = JSON.parse(event.data);

    if (!(typeof data === 'object' && !Array.isArray(data))) {
      // Ignore all messages that don't parse to an object
      return;
    }

    if (data.error) {
      // TODO: Errors should have specific types so that we can handle them differently
      return errorHandler(new Error(data.error as string));
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
