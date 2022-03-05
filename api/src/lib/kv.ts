import { promisify } from 'util';
import { exec } from 'child_process';
import { Miniflare } from 'miniflare';
import { JSONValue } from '../../../shared';

const execAsync = promisify(exec);

export interface KvStore {
  [namespace: string]: {
    [key: string]: JSONValue | (() => Promise<JSONValue>)
  }
}

const stringify = (value: JSONValue, escapeQuotes: boolean = false) => {
  let output = typeof(value) === "string" ? value : JSON.stringify(value);
  if (escapeQuotes) {
    output = JSON.stringify(output);
  }
  return output;
};

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

export const setMiniflareKv = async (namespace: string, key: string, value: JSONValue, wranglerConfigPath: string): Promise<void> => {
  const mf = new Miniflare({
    wranglerConfigPath: wranglerConfigPath,
    modules: true
  });
  const kvNamespace = await mf.getKVNamespace(namespace);
  return kvNamespace.put(key, stringify(value));
};

export const initKv = async (kvData: KvStore, wranglerConfigPath: string): Promise<string[]> => {
  const mf = new Miniflare({
    wranglerConfigPath: wranglerConfigPath,
    modules: true
  });
  const errors: string[] = [];
  for (const namespace of Object.keys(kvData)) {
    const kvNamespace = await mf.getKVNamespace(namespace);
    const nsData = kvData[namespace];
    for (const key of Object.keys(nsData)) {
      const value = nsData[key];
      try {
        await kvNamespace.put(key, stringify(await getKvValue(value)));
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
