/// <reference types="../global" />
import Scraper from 'scraper-instagram';
import fetch from 'node-fetch';
import { mkdir, exists, writeFile, readDir } from './fs';

const getHashtagResult = async (hashtag: string): Promise<any> => {
  const client = new Scraper();
  return await client.getHashtag(hashtag);
};

const downloadImage = async (url: string, destName: string): Promise<void> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(destName, Buffer.from(arrayBuffer));
};

const writeImageNames = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const files = await readDir('./assets/');
      const imageNames = files.filter((v) => v.endsWith('.jpg'));
      try {
        await writeFile('./assets/imageNames.json', JSON.stringify(imageNames), 'utf-8');
        resolve();
      } catch (writeFileErr) {
        reject(writeFileErr);
      }
    } catch(readDirErr) {
      return reject(readDirErr);
    }
  });
};

const scrape = async (imgHashtag: string): Promise<void> => {
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

export default scrape;
