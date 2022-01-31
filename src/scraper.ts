/// <reference types="./scraper" />
import fs from 'fs';
import util from 'util';
import https from 'https';
import Scraper from 'scraper-instagram';
import { IncomingMessage } from 'http';
import { Transform } from 'stream';

const imgHashtag = 'landscape';

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

const getHashtagResult = async (hashtag: string): Promise<any> => {
  const client = new Scraper();
  return await client.getHashtag(hashtag);
};

const downloadImage = async (url: string, destName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    https.request(url, (response: IncomingMessage) => {
      const data = new Transform();

      response.on('data', (chunk) => {
        data.push(chunk);
      });

      response.on('end', () => {
        fs.writeFile(destName, data.read(), (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        })
      });
    }).end();
  });
};

const writeImageNames = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readdir('./assets/', (readDirErr, files) => {
      if (readDirErr) {
        return reject(readDirErr);
      }
      const imageNames = files.filter((v) => v.endsWith('.jpg'));
      fs.writeFile('./assets/imageNames.json', JSON.stringify(imageNames), 'utf-8', (writeFileErr) => {
        if (writeFileErr) {
          return reject(writeFileErr);
        }
        return resolve();
      })
    });
  });
};

const main = async (): Promise<void> => {
  try {
    if (!(await exists('./assets'))) {
      await mkdir('./assets')
    }
  } catch(e) {
    console.error(`Couldn't create assets folder: ${e}`);
  }
  let result: any = null;
  try {
    console.log(`Getting images for #${imgHashtag}...`);
    result = await getHashtagResult(imgHashtag);
  } catch (e) {
    console.error(`Couldn't get #${imgHashtag} data: ${e}`);
  }
  for (let i = 0; i < result.lastPosts.length; i++) {
    console.log(`Downloading image ${i}...`);
    try {
      await downloadImage(result.lastPosts[i].thumbnail, `./assets/${result.lastPosts[i].shortcode}.jpg`);
    } catch (e) {
      console.error(`Couldn't download image ${i}: ${e}`);
    }
  }
  try {
    console.log("Writing image index...");
    await writeImageNames();
  } catch(e) {
    console.error(`Couldn't write image names to index: ${e}`);
  }
  console.log("Done!");
};

main();
