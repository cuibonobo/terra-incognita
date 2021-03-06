import { ErrorTypes, getRandomString, JSONObject, JSONValue, stringify } from "../../../shared";
import { handleErrors, closeWebsocket, sendWebsocketError, sendWebsocketReady, sendWebsocketMessage, getTimeKey, getAppState, parseEnvData } from "../lib/workers";
import { RateLimiterClient } from "./RateLimiter";

const SESSION_ID_LENGTH = 12;
const SESSION_INIT_TIMEOUT = 5;
const RANDOMIZER_TIMEOUT = 5 * 60;

/**
 * There should only be a single Messenger object
 * for this application.
 */
export default class Messenger {
  state: DurableObjectState;
  env: Bindings;
  sessions: Session[];
  lastTimestamp: number;
  lastRandomValue: number;

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.lastTimestamp = 0;
    this.lastRandomValue = 0;
  }

  async fetch(request: Request, env: Bindings) {
    return handleErrors(request, this.env, async () => {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response("Expected websocket", {status: 400});
      }

      // Get the client's IP address to feed to the rate limiter
      let connectingIP = getIpFromRequest(request);
      if (connectingIP === null) {
        connectingIP = getRandomString(SESSION_ID_LENGTH, 'ip-');
        console.warn("Couldn't get IP from request. Using random string as IP.", connectingIP);
      }

      // Accept the request by creating a new websocket pair
      const [client, worker] = Object.values(new WebSocketPair());

      // Prepare the worker socket, then send the client socket
      await this.prepareWorkerSocket(worker, connectingIP);
      return new Response(null, {status: 101, webSocket: client});
    });
  }

  async prepareWorkerSocket(websocket: WebSocket, ip: string) {
    (websocket as any).accept();  // FIXME: Cloudflare WebSocket definition conflicts with DOM
    
    // Set up the rate limiter for this session
    // const limiterId = this.env.limiters.idFromName(ip);
    // const limiter = RateLimiterClient(
    //   () => this.env.limiters.get(limiterId),
    //   (err: Error) => {
    //     console.error("Rate-limiter error", err.stack);
    //     closeWebsocket(websocket, err.stack);
    //   }
    // );

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
      console.debug("Closing session", session.id);
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
          console.warn("Got message on a session that should have quit.", session.id);
          closeWebsocket(websocket, 'WebSocket broken.');
          return;
        }

        // if (!limiter.canPost()) {
        //   console.info("Rate-limiting this session", ip, session.id);
        //   sendWebsocketError(websocket, ErrorTypes.RateLimitError, 'Your IP is being rate-limited. Please try again later.');
        //   return;
        // }

        if (!session.id) {
          // Having an ID is a signal that the session is ready to receive messages
          session.id = getRandomString(SESSION_ID_LENGTH);
          console.debug("Session is ready to receive messages", session.id);
          sendWebsocketReady(websocket, session.id, await getAppState(this.env));
          return;
        }

        const message = JSON.parse(msg.data);

        // Reject the message if it already has a message ID
        if (message.sessionId) {
          return;
        }

        // Respond to heartbeats
        if (message.heartbeat) {
          sendWebsocketMessage(session.websocket, {heartbeat: message.heartbeat});
          return;
        }

        // Sanitize the message and add some metadata
        const msgKeys = Object.keys(message);
        if (msgKeys.length !== 2) {
          return;
        }
        const typeIdx = msgKeys.indexOf('type');
        if (typeIdx < 0) {
          return;
        }
        const broadcastMessage: JSONObject = {
          ...message,
          sessionId: session.id,
          timestamp: Math.max(Date.now(), this.lastTimestamp + 1)
        };

        // Set a timestamp on the message
        this.lastTimestamp = broadcastMessage.timestamp as number;

        this.broadcast(broadcastMessage);

        // Save the current state
        await this.env.LOGS.put(getTimeKey(), stringify({
          ...broadcastMessage,
          ...(await getAppState(this.env)),
          ip
        }));
      } catch (e) {
        const err = e as Error;
        console.error("Message event listener error", err.stack);
        sendWebsocketError(websocket, ErrorTypes.ServerError, err.stack);
      }
    });

    // NOTE: This interval will run for every socket connection
    const meta = parseEnvData(await this.env.DATA.get('meta'));
    setInterval(async () => {
      if (this.lastRandomValue + RANDOMIZER_TIMEOUT * 1000 > Date.now()) {
        return;
      }
      this.lastRandomValue = Date.now();
      const op = Math.floor(Math.random() * 3);
      switch(op) {
        case 0:
          const numImagesSqrt = Math.round(Math.random() * (meta.maxNumImagesSqrt - meta.minNumImagesSqrt)) + meta.minNumImagesSqrt;
          await this.env.DATA.put('numImagesSqrt', stringify(numImagesSqrt));
          this.broadcast({type: 2, numImagesSqrt, timestamp: Date.now(), sessionId: 'server'});
          return;
        case 1:
          const imgSquareSize = Math.round(Math.random() * (meta.maxImgSquareSize - meta.minImgSquareSize)) + meta.minImgSquareSize;
          await this.env.DATA.put('imgSquareSize', stringify(imgSquareSize));
          this.broadcast({type: 3, imgSquareSize, timestamp: Date.now(), sessionId: 'server'});
          return;
        case 2:
          const imgArray = parseEnvData(await this.env.DATA.get('imgArray'));
          const totalImages = parseEnvData(await this.env.DATA.get('totalImages'));
          if (imgArray === null || totalImages === null) {
            return;
          }
          const idx = Math.floor(Math.random()) * 100;
          const img = Math.floor(Math.random()) * totalImages;
          imgArray[idx] = img;
          await this.env.DATA.put('imgArray', stringify(imgArray));
          this.broadcast({type: 4, imgArray, timestamp: Date.now(), sessionId: 'server'});
          return;
        default:
          console.warn("Got unexpected random operation", op);
      }
    }, RANDOMIZER_TIMEOUT * 1000);
  }

  async broadcast(message: JSONValue) {
    // Don't send null messages or empty strings
    if (message === null || typeof message === 'string' && message.length === 0) {
      console.debug("Ignoring empty message", message);
      return;
    }
    // Iterate over all the sessions to send the message. Passing this through
    // a filter so that we also purge dead connections
    this.sessions = this.sessions.filter((s: Session) => {
      if (!s.id) {
        // Don't send messages to uninitialized sessions, but keep them
        // in the session list if they haven't timed out
        const sessionInitTimedOut = Date.now() - s.timestamp < SESSION_INIT_TIMEOUT * 1000;
        if (sessionInitTimedOut) {
          console.warn("Timing out a session", s);
        }
        return sessionInitTimedOut;
      }
      try {
        // Don't broadcast the message to the sender
        if (!(typeof message === 'object' && !Array.isArray(message) && message.sessionId === s.id)) {
          console.debug("Sending message to session", s.id)
          sendWebsocketMessage(s.websocket, stringify(message));
        }
        return true;
      } catch (e) {
        const err = e as Error;
        console.error("Broadcast error", err.stack);
        s.quit = true;
        return false;
      }
    });
  }
}

const isIpAddress = (ip: string | null): boolean => {
  if (!ip) {
    return false;
  }
  return ip.toLowerCase() !== 'localhost' && ip.toLowerCase() !== '127.0.0.1';
};

const getIpFromRequest = (request: Request): string | null => {
  const connectingIP = request.headers.get('CF-Connecting-IP');
  if (isIpAddress(connectingIP)) {
    return connectingIP;
  }
  const xRealIP = request.headers.get('X-Real-IP');
  if (isIpAddress(xRealIP)) {
    return xRealIP;
  }
  const referrerIP = request.referrer;
  if (isIpAddress(referrerIP)) {
    return referrerIP;
  }
  return null;
};

interface Session {
  id?: string,
  timestamp: number,
  websocket: WebSocket,
  quit: boolean
}
