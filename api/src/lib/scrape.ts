/// <reference types="../types" />
import path from 'path';
import Scraper from 'scraper-instagram';
import fetch from 'node-fetch';
import { writeFile, readDir, ensureDir } from './fs';
import { getAuthenticatedClient } from './b2';

const bucketDir = 'images';
const indexName = 'imageNames.json';

interface HashtagImage {
  shortcode: string,
  caption: string[],
  comments: number,
  likes: number,
  thumbnail: string,
  timestamp: number
}

const getLatestHashtagImages = async (hashtag: string): Promise<HashtagImage[]> => {
  const client = new Scraper();
  const result = await client.getHashtag(hashtag);
  return result.lastPosts;
};

const downloadImage = async (url: string, destPath: string): Promise<void> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(destPath, Buffer.from(arrayBuffer));
};

const downloadImages = async (images: HashtagImage[], destDir: string): Promise<string[]> => {
  const errors: string[] = [];
  for (const image of images) {
    try {
      await downloadImage(image.thumbnail, path.join(destDir, `${image.shortcode}.jpg`));
    } catch (e) {
      errors.push(`Couldn't download image ${image.shortcode}: ${e}`);
    }
  }
  return errors;
};

const writeImageNames = async (imageDir: string): Promise<void> => {
  const files = await readDir(imageDir);
  const imageNames = files.filter((v) => v.endsWith('.jpg'));
  await writeFile(path.join(imageDir, indexName), JSON.stringify(imageNames), 'utf-8');
};

const uploadImagesToBucket = async (images: string[] | HashtagImage[], imageDir: string, credentialsDir: string = './'): Promise<string[]> => {
  const client = await getAuthenticatedClient(credentialsDir);
  const errors: string[] = [];
  for (const image of images) {
    const imagePath: string = path.join(imageDir, typeof image === 'string' ? image : `${image.shortcode}.jpg`);
    try {
      await client.uploadFile(imagePath, bucketDir)
    } catch(e) {
      errors.push(`Error uploading ${imagePath}: ${e}`);
    }
  }
  return errors;
};

const uploadIndexToBucket = async (imageDir: string, credentialsDir: string = './') => {
  const client = await getAuthenticatedClient(credentialsDir);
  return await client.uploadFile(path.join(imageDir, indexName), bucketDir);
};

const scrape = async (imgHashtag: string): Promise<void> => {
  // TODO: Current scraper assumes destDir and bucket have the same contents
  const destDir = '../assets';
  try {
    await ensureDir(destDir);
  } catch(e) {
    console.error(`Couldn't create assets folder: ${e}`);
    return;
  }
  let images: HashtagImage[] = [];
  try {
    console.log(`Getting images for #${imgHashtag}...`);
    images = await getLatestHashtagImages(imgHashtag);
  } catch (e) {
    console.error(`Couldn't get #${imgHashtag} data: ${e}`);
    return;
  }
  try {
    const errors = await downloadImages(images, destDir);
    console.log(`Downloaded ${images.length - errors.length} out of ${images.length} images`)
  } catch (e) {
    console.error(`Couldn't download images: ${e}`);
    return;
  }
  try {
    console.log("Writing image index...");
    await writeImageNames(destDir);
  } catch(e) {
    console.error(`Couldn't write image names to index: ${e}`);
    return;
  }
  try {
    console.log("Upload images to B2 bucket...");
    const errors = await uploadImagesToBucket(images, destDir);
    if (errors.length > 0) {
      console.warn(`${errors.length} images couldn't be uploaded:`);
      for (const error of errors) {
        console.warn(`\t${error}`);
      }
    }
  } catch(e) {
    console.error(`Couldn't upload images to bucket: ${e}`);
    return;
  }
  try {
    console.log("Upload index to B2 bucket...");
    await uploadIndexToBucket(destDir);
  } catch(e) {
    console.error(`Couldn't upload index to bucket: ${e}`);
    return;
  }
  console.log("Done!");
};

export default scrape;
