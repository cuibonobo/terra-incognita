import { promisify } from 'util';
import { exec } from 'child_process';
import { Miniflare } from 'miniflare';

const execAsync = promisify(exec);

export interface KvStore {
  [namespace: string]: {
    [key: string]: JSONValue
  }
}

const stringify = (value: any, escapeQuotes: boolean = false) => {
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

export const getWranglerKv = async (namespace: string, key: string, defaultValue?: string): Promise<string> => {
  try {
    return execThrow(`wrangler kv:key get --binding=${namespace} "${key}"`);
  } catch(e) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw e;
  }
};

const setWranglerKv = async (namespace: string, key: string, value: string): Promise<void> => {
  await execThrow(`wrangler kv:key put --binding=${namespace} "${key}" "${value}"`);
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
        await kvNamespace.put(key, stringify(value));
      } catch (e) {
        errors.push(`Couldn't set '${namespace}:${key}' to MiniFlare: ${e}`);
      }
      try {
        await setWranglerKv(namespace, key, stringify(value, true));
      } catch (e) {
        errors.push(`Couldn't set '${namespace}:${key}' to Workers KV: ${e}`);
      }
    }
  }
  return errors;
};
