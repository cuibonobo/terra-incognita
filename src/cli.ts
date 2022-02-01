import { Command } from 'commander';
import 'dotenv/config';
import scrape from './nodeLib/scrape';
import { authenticate, B2Client, Credentials } from './nodeLib/b2';
import { writeFile, readFile } from './nodeLib/fs';

const credentialsFile = './credentials.json';
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
      await writeFile(credentialsFile, JSON.stringify(credentials));
    } catch (e) {
      console.error(e);
    }
  });

  program
  .command('upload <filePath>')
  .description('Upload a file to Backblaze B2')
  .action(async (filePath: string) => {
    try {
      const credentials: Credentials = JSON.parse((await readFile(credentialsFile)).toString());
      const client = new B2Client(credentials);
      console.log("Uploading...");
      console.log(await client.uploadFile(filePath));
    } catch (e) {
      console.error(e);
    }
  });

program.parse();
