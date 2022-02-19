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
        const {stderr} = await execAsync(`wrangler kv:key put --binding=${namespace} "${key}" "${stringify(value, true)}"`);
        if (stderr) {
          throw new Error(stderr);
        }
      } catch (e) {
        errors.push(`Couldn't set '${namespace}:${key}' to Workers KV: ${e}`);
      }
    }
  }
  return errors;
};
