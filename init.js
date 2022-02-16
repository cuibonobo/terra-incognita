import { promisify } from 'util';
import { exec } from 'child_process';
import { Miniflare } from 'miniflare';

const execAsync = promisify(exec);

const kvData = {
  "DATA": {
    "foo": "bar"
  }
};

const mf = new Miniflare({
  wranglerConfigPath: './wrangler.toml',
  modules: true
});

for (const namespace of Object.keys(kvData)) {
  const ns = await mf.getKVNamespace(namespace);
  const nsData = kvData[namespace];
  for (const key of Object.keys(nsData)) {
    try {
      await ns.put(key, nsData[key]);
    } catch (e) {
      console.error(`Couldn't set '${key}' to MiniFlare: ${e}`);
    }
    try {
      const {stderr} = await execAsync(`wrangler kv:key put --binding=${namespace} "${key}" "${nsData[key]}"`);
      if (stderr) {
        throw new Error(stderr);
      }
    } catch (e) {
      console.error(`Couldn't set 'key' to Workers KV: ${e}`);
    }
  }
}
