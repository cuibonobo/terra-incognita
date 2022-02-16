import { promisify } from 'util';
import { exec } from 'child_process';
import { Miniflare } from 'miniflare';

const execAsync = promisify(exec);

const kvData = {
  "DATA": {
    "meta": {
      "imgHashtag": "landscape",
      "numImagesSqrt": 5,
      "imgSquareSize": 10,
      "imgWidth": 1920.0,
      "imgHeight": 1080.0
    }
  }
};

const mf = new Miniflare({
  wranglerConfigPath: './wrangler.toml',
  modules: true
});

const stringify = (value, escapeQuotes = false) => {
  let output = typeof(value) === "string" ? value : JSON.stringify(value);
  if (escapeQuotes) {
    output = JSON.stringify(output);
  }
  return output;
};

for (const namespace of Object.keys(kvData)) {
  const ns = await mf.getKVNamespace(namespace);
  const nsData = kvData[namespace];
  for (const key of Object.keys(nsData)) {
    const value = nsData[key];
    try {
      await ns.put(key, stringify(value));
    } catch (e) {
      console.error(`Couldn't set '${key}' to MiniFlare: ${e}`);
    }
    try {
      const {stderr} = await execAsync(`wrangler kv:key put --binding=${namespace} "${key}" "${stringify(value, true)}"`);
      if (stderr) {
        throw new Error(stderr);
      }
    } catch (e) {
      console.error(`Couldn't set 'key' to Workers KV: ${e}`);
    }
  }
}
