import { Miniflare } from "miniflare";

const mf = new Miniflare({
  wranglerConfigPath: './wrangler.toml',
  modules: true
});

const ns = await mf.getKVNamespace("DATA");
await ns.put("foo", "bar");

// This script is the Miniflare equivalent to:
// wrangler kv:key put --binding=DATA "foo" "bar"
