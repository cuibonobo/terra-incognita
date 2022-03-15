import { stringify } from "../../../shared";

const REJOIN_TIMEOUT = 10;

const messagesFactory = (messageHandler: (data: any) => void, errorHandler: (error: Error) => void) => {
  const hostname = (new URL(window.location.href).hostname);
  const baseUrl = process.env.NODE_ENV == 'production' ? 'wss://terra.cuibonobo.com' : `ws://${hostname}:8787`;
  const messagesUrl = baseUrl + '/messages';

  let sessionId: string | null;
  let startTime: number;
  let rejoined: boolean;
  let ws: WebSocket = new WebSocket(messagesUrl);

  const init = () => {
    sessionId = null;
    startTime = Date.now();
    rejoined = false;
    ws = new WebSocket(messagesUrl);
  };

  const rejoin = async () => {
    if (rejoined) {
      return;
    }
    rejoined = true;

    const timeSinceLastJoin = Date.now() - startTime;
    if (timeSinceLastJoin < REJOIN_TIMEOUT * 1000) {
      await new Promise((resolve) => setTimeout(resolve, (REJOIN_TIMEOUT * 1000) - timeSinceLastJoin));
    }
    init();
  };

  const send = (data: any) => {
    if (sessionId === null) {
      console.error("WebSocket is not ready for messages yet!");
      return;
    }
    ws.send(stringify(data));
  };

  init();

  ws.addEventListener('open', (event: Event) => {
    // Send an empty object as our first message
    ws.send(stringify({}));
  });
  ws.addEventListener('close', (event: CloseEvent) => {
    console.error("WebSocket closed, reconnecting:", event.code, event.reason);
    rejoin();
  });
  ws.addEventListener('error', (event: Event) => {
    console.error("WebSocket error, reconnecting:", event);
    rejoin();
  });

  ws.addEventListener('message', (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      return errorHandler(new Error(data.error));
    }

    if (data.ready) {
      sessionId = data.sessionId;
      return;
    }

    if (sessionId && data.sessionId && sessionId === data.sessionId) {
      // Ignore messages sent from the same session
      return;
    }

    messageHandler(data);
  });

  return {
    send
  };
};

export default messagesFactory;
