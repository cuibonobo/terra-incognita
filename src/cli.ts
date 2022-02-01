import { Command } from 'commander';
import 'dotenv/config';
import scrape from './nodeLib/scrape';
import { authenticate, setCredentials, getAuthenticatedClient } from './nodeLib/b2';

const program = new Command();

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
        throw new Error("B2_WRITE_KEY_ID and B2_WRITE_APP_KEY are not defined!");
      }
      console.log("Authenticating...");
      const credentials = await authenticate(process.env.B2_WRITE_APP_KEY_ID, process.env.B2_WRITE_APP_KEY);
      await setCredentials(credentials);
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
      console.log("Uploading...");
      console.log(await client.uploadFile(filePath));
    } catch (e) {
      console.error(e);
    }
  });

program.parse();
