import path from 'path';
import url from 'url';
import { Command } from 'commander';
import 'dotenv/config';
import scrape, { syncImageDirToBucket } from './lib/scrape';
import { authenticate, setCredentials, getAuthenticatedClient } from './lib/b2';
import { initKv } from './lib/kv';
import defaultData from './defaultData';
import { build } from 'esbuild';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const program = new Command();

program
  .command('sync')
  .description('Sync image dir to B2')
  .action(async () => {
    try {
      console.log('Syncing images...');
      const [imageCounter, errors] = await syncImageDirToBucket('../assets');
      console.log(`Synced ${imageCounter} images`);
      if (errors.length > 0) {
        console.warn(`${errors.length} images couldn't be uploaded:`);
        for (const error of errors) {
          console.warn(`\t${error}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

program
  .command('scrape <hashtag>')
  .description('Scrape Instagram for new images with the given hashtag')
  .action(async (hashtag: string) => {
    try {
      await scrape(hashtag);
    } catch (e) {
      console.error(e);
    }
  });

program
  .command('authenticate')
  .description('Authenticate to Backblaze B2')
  .action(async () => {
    try {
      if (process.env.B2_WRITE_APP_KEY_ID === undefined || process.env.B2_WRITE_APP_KEY === undefined) {
        throw new Error('B2_WRITE_KEY_ID and B2_WRITE_APP_KEY are not defined!');
      }
      console.log('Authenticating...');
      const credentials = await authenticate(process.env.B2_WRITE_APP_KEY_ID, process.env.B2_WRITE_APP_KEY);
      await setCredentials(credentials);
      console.log('Done.');
    } catch (e) {
      console.error(e);
    }
  });

program
  .command('init')
  .description('Initialize data to MiniFlare and Workers KV')
  .action(async () => {
    try {
      const errors = await initKv(defaultData, path.join(__dirname, '../wrangler.toml'));
      if (errors.length > 0) {
        for (const error of errors) {
          console.error(error);
        }
      }
    } catch(e) {
      console.error(e);
    }
  });

program
  .command('build')
  .description('Build the Cloudflare Worker application')
  .action(async () => {
    try {
      await build({
        bundle: true,
        sourcemap: true,
        format: 'esm',
        target: 'esnext',
        entryPoints: [path.join(__dirname, 'worker.ts')],
        outdir: path.join(__dirname, '../dist'),
        outExtension: { '.js': '.mjs' },
      });
    } catch (e) {
      console.error(e);
    }
  });

  program
  .command('upload <filePath>')
  .description('Upload a file to Backblaze B2')
  .action(async (filePath: string) => {
    try {
      const client = await getAuthenticatedClient();
      console.log('Uploading...');
      console.log(await client.uploadFile(filePath));
    } catch (e) {
      console.error(e);
    }
  });

program.parse();
