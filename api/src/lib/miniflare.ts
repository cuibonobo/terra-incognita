import { Miniflare } from 'miniflare';
import { stringify } from '../../../shared';

const wranglerConfig = '../../wrangler.toml';

export const getMiniflareKvNamespace = async (namespace: string, wranglerConfigPath: string = wranglerConfig): Promise<KVNamespace> => {
  const mf = new Miniflare({
    wranglerConfigPath: wranglerConfigPath,
    modules: true
  });
  // FIXME: Strange type incompatibility that might be resolved in a future version
  let ns: unknown = await mf.getKVNamespace(namespace);
  return ns as KVNamespace;
}

export const setMiniflareKv = async <T>(namespace: string, key: string, value: T, wranglerConfigPath: string = wranglerConfig): Promise<void> => {
  const kvNamespace = await getMiniflareKvNamespace(namespace, wranglerConfigPath);
  return kvNamespace.put(key, stringify(value));
};

export const getMiniflareKv = async (namespace: string, key: string, wranglerConfigPath: string = wranglerConfig): Promise<string | null> => {
  const kvNamespace = await getMiniflareKvNamespace(namespace, wranglerConfigPath);
  return kvNamespace.get(key);
};
