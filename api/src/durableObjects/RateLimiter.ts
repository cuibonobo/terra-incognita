import { stringify, Meta } from "../../../shared";
import { getKvData, handleErrors } from "../lib/workers";

/**
 * A new RateLimiter object is created for each IP address. The object
 * will return the number of seconds that are left before the IP
 * can POST or PUT again.
 */
export default class RateLimiter {
  nextAllowedTime: number;
  cooldownTimeout: null | number;
  env: Bindings;

  constructor(state: DurableObjectState, env: Bindings) {
    this.nextAllowedTime = 0;
    this.cooldownTimeout = null;
    this.env = env;
  }

  async fetch(request: Request, env: Bindings) {
    return handleErrors(request, async () => {
      if (this.cooldownTimeout === null) {
        const meta: Meta = await getKvData('meta', this.env);
        this.cooldownTimeout = meta.cooldownTimeout;
      }
      const now = Date.now() / 1000;
      this.nextAllowedTime = Math.max(now, this.nextAllowedTime);

      if (request.method === 'POST') {
        // Whenever a POST action is performed, bump the next allowed time
        this.nextAllowedTime += this.cooldownTimeout;
      }

      const cooldown = Math.max(0, this.nextAllowedTime - now);
      return new Response(stringify(cooldown));
    });
  }
}

export const RateLimiterClient = (getLimiterStub: () => DurableObjectStub, errorCallback: (err: Error) => void) => {
  let limiter = getLimiterStub();
  let inCooldown = false;

  const canPost = (): boolean => {
    if (inCooldown) {
      return false;
    }
    inCooldown = true;
    callLimiter();
    return true;
  };

  const _callLimiter = async (): Promise<Response> => {
    // fetch calls on Durable Objects need a valid URL despite not actually
    // going out to the internet
    return limiter.fetch('https://dummy-url', {method: 'POST'});
  };

  const callLimiter = async (): Promise<void> => {
    try {
      let response: Response;
      try {
        response = await _callLimiter();
      } catch (limiterError) {
        // Try the connection again in case we've been disconnected from the limiter
        limiter = getLimiterStub();
        response = await _callLimiter();
      }
      const cooldown: number = await response.json();
      await new Promise((resolve) => setTimeout(resolve, cooldown * 1000));

      // Out of cooldown
      inCooldown = false;
    } catch (callError) {
      errorCallback(callError as Error);
    }
  }

  return {
    canPost
  };
};
