import { promisify } from 'util';
import { exec } from 'child_process';
import { JSONValue, stringify } from '../../../shared';
import { setMiniflareKv } from './miniflare';

const execAsync = promisify(exec);

export interface KvStore {
  [namespace: string]: {
    [key: string]: JSONValue | (() => Promise<JSONValue>)
  }
}

const execThrow = async (command: string): Promise<string> => {
  const {stdout, stderr} = await execAsync(command);
  if (stderr) {
    throw new Error(stderr);
  }
  return stdout;
};

export const getKvValue = async (value: JSONValue | (() => Promise<JSONValue>)): Promise<JSONValue> => {
  return typeof value === 'function' ? await value() : value;
};

export const getWranglerKv = async (namespace: string, key: string, defaultValue?: JSONValue): Promise<JSONValue> => {
  try {
    return JSON.parse(await execThrow(`wrangler kv:key get --binding=${namespace} "${key}"`));
  } catch(e) {
    if (defaultValue !== undefined) {
      console.debug(`Returning default value for '${namespace}:${key}'. ${e}'`);
      return defaultValue;
    }
    throw e;
  }
};

export const setWranglerKv = async (namespace: string, key: string, value: JSONValue): Promise<void> => {
  await execThrow(`wrangler kv:key put --binding=${namespace} "${key}" "${stringify(value, true)}"`);
};

export const initKv = async (kvData: KvStore, wranglerConfigPath: string): Promise<string[]> => {
  const errors: string[] = [];
  for (const namespace of Object.keys(kvData)) {
    const nsData = kvData[namespace];
    for (const key of Object.keys(nsData)) {
      const value = nsData[key];
      try {
        await setMiniflareKv(namespace, key, value, wranglerConfigPath);
      } catch (e) {
        errors.push(`Couldn't set '${namespace}:${key}' to MiniFlare: ${e}`);
      }
      try {
        await setWranglerKv(namespace, key, await getKvValue(value));
      } catch (e) {
        errors.push(`Couldn't set '${namespace}:${key}' to Workers KV: ${e}`);
      }
    }
  }
  return errors;
};
