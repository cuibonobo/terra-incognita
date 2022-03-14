import { getRandomString, Meta, stringify } from "../../../shared";
import { handleErrors, closeWebsocket, sendWebsocketError, sendWebsocketReady, sendWebsocketMessage } from "../lib/workers";
import { RateLimiterClient } from "./RateLimiter";

const SESSION_ID_LENGTH = 12;
const SESSION_INIT_TIMEOUT = 5;

/**
 * There should only be a single Messenger object
 * for this application.
 */
export default class Messenger {
  state: DurableObjectState;
  env: Bindings;
  sessions: Session[];
  lastTimestamp: number;

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.lastTimestamp = 0;
  }

  async fetch(request: Request, env: Bindings) {
    return handleErrors(request, async () => {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response("Expected websocket", {status: 400});
      }

      // Get the client's IP address to feed to the rate limiter
      const ip = request.headers.get('CF-Connecting-IP');

      // Accept the request by creating a new websocket pair
      const [client, worker] = Object.values(new WebSocketPair());

      // Prepare the worker socket, then send the client socket
      await this.prepareWorkerSocket(worker, ip!);
      return new Response(null, {status: 101, webSocket: client});
    });
  }

  async prepareWorkerSocket(websocket: WebSocket, ip: string) {
    (websocket as any).accept();  // FIXME: Cloudflare WebSocket definition conflicts with DOM
    
    // Set up the rate limiter for this session
    const limiterId = this.env.limiters.idFromName(ip);
    const limiter = RateLimiterClient(
      () => this.env.limiters.get(limiterId),
      (err: Error) => closeWebsocket(websocket, err.stack)
    );

    // Create a new session and add it to the sessions list
    const session: Session = {
      websocket,
      timestamp: Date.now(),
      quit: false
    };
    this.sessions.push(session);

    // Set the session to quit and remove it from the session list on 
    // close or error
    const closeOrErrorListener = (event: Event) => {
      session.quit = true;
      this.sessions = this.sessions.filter((s: Session) => s !== session);
    };
    websocket.addEventListener('close', closeOrErrorListener);
    websocket.addEventListener('error', closeOrErrorListener);

    // Message event listener
    websocket.addEventListener('message', async (msg: MessageEvent) => {
      try {
        if (session.quit) {
          // Getting messages from a quit session shouldn't happen, but OK
          closeWebsocket(websocket, 'WebSocket broken.');
          return;
        }

        if (!limiter.canPost()) {
          sendWebsocketError(websocket, 'Your IP is being rate-limited. Please try again later.');
        }

        if (!session.id) {
          // Having an ID is a signal that the session is ready to receive messages
          session.id = getRandomString(SESSION_ID_LENGTH);
          sendWebsocketReady(websocket);
          return;
        }

        const message: Message = JSON.parse(msg.data);

        // TODO: Sanitize message

        this.broadcast(stringify(message));

        // TODO: Save the message
      } catch (e) {
        const err = e as Error;
        sendWebsocketError(websocket, err.stack);
      }
    });
  }

  async broadcast(message: string) {
    // Iterate over all the sessions to send the message. Passing this through
    // a filter so that we also purge dead connections
    this.sessions = this.sessions.filter((session: Session) => {
      if (!session.id) {
        // Don't send messages to uninitialized sessions, but keep them
        // in the session list if they haven't timed out
        return Date.now() - session.timestamp < SESSION_INIT_TIMEOUT * 1000;
      }
      try {
        sendWebsocketMessage(session.websocket, message);
        return true;
      } catch (e) {
        session.quit = true;
        return false;
      }
    });
  }
}

interface Session {
  id?: string,
  timestamp: number,
  websocket: WebSocket,
  quit: boolean
}

interface Message {
  senderId: string,
  meta: Meta,
  numImagesSqrt: number,
  imgSquareSize: number,
  imgArray: number[],
  timestamp?: number
}
