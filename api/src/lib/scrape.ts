/// <reference types="../types" />
import path from 'path';
import fetch from 'node-fetch';
import { writeFile, readDir, stat, mkTempDir, rm } from './fs';
import { HashtagImage, getHashtagImages } from './instagram';
import { getAuthenticatedClient } from './b2';
import { getWranglerKv, setWranglerKv } from './kv';
import { setMiniflareKv } from './miniflare';

const bucketDir = 'images';

const downloadImage = async (url: string, destPath: string): Promise<void> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(destPath, Buffer.from(arrayBuffer));
};

const downloadHashtagImages = async (images: HashtagImage[], destDir: string): Promise<[HashtagImage[], string[]]> => {
  const errors: string[] = [];
  const downloads: HashtagImage[] = [];
  for (const image of images) {
    try {
      const filePath = path.join(destDir, `${image.shortcode}.jpg`);
      await downloadImage(image.thumbnail, filePath);
      downloads.push({...image, filePath});
    } catch (e) {
      errors.push(`Couldn't download image ${image.shortcode}: ${e}`);
    }
  }
  return [downloads, errors];
};

const getImageNames = async (imageDir: string, imageExt: string = '.jpg'): Promise<string[]> => {
  const files = await readDir(imageDir);
  return files.filter((v) => v.endsWith(imageExt));
};

const printWarnings = (messages: string[], warningSuffix: string = ' errors'): void => {
  if (messages.length > 0) {
    console.warn(`${messages.length}${warningSuffix}:`);
    for (const msg of messages) {
      console.warn(`\t${msg}`);
    }
  }
};

const getIndexedName = (idx: number, imageExt: string = '.jpg', namePadding: number = 8): string => {
  return String(idx).padStart(namePadding, '0') + imageExt;
};

const uploadImagesToBucket = async (images: HashtagImage[], startIndex: number, credentialsDir: string = './'): Promise<[number, string[]]> => {
  const client = await getAuthenticatedClient(credentialsDir);
  let imageCounter = startIndex;
  const errors: string[] = [];
  for (const image of images) {
    // We only call this function after `downloadImages` which sets the filePath
    const filePath: string = image.filePath!;
    try {
      await client.uploadFile({
        filePath,
        timestamp: image.timestamp * 1000,  // Timestamps from Instagram are in seconds
        destName: getIndexedName(imageCounter),
        data: {
          thumbnail: image.thumbnail,
          likes: image.likes.toString(),
          shortcode: image.shortcode
        }
      }, bucketDir);
      imageCounter++;
    } catch(e) {
      errors.push(`Error uploading ${filePath}: ${e}`);
    }
  }
  return [imageCounter, errors];
};

/**
 * Syncs images from source directory to a B2 bucket, but changes image names to a number that
 * corresponds with the order in which they were uploaded. The default name padding should be
 * enough to upload 100 images every hour for 30 years.
 */
export const syncImageDir = async (imageDir: string, startIndex: number = 0, credentialsDir: string = './', imageExt: string = '.jpg', namePadding: number = 8): Promise<[number, string[]]> => {
  const client = await getAuthenticatedClient(credentialsDir);
  const imageNames = await getImageNames(imageDir, imageExt);
  let imageCounter = startIndex;
  const errors: string[] = [];
  for (const imageName of imageNames) {
    try {
      const filePath = path.resolve(path.join(imageDir, imageName));
      const fileOpts = {
        filePath,
        timestamp: (await stat(filePath)).mtimeMs,
        destName: getIndexedName(imageCounter, imageExt, namePadding)
      };
      await client.uploadFile(fileOpts, bucketDir);
      imageCounter++;
    } catch(e) {
      errors.push(`Couldn't upload ${imageName}: ${e}`);
    }
  }
  return [imageCounter, errors];
};

const scrape = async (imgHashtag: string, instagramSessionId: string, wranglerConfigPath?: string): Promise<void> => {
  const destDir = await mkTempDir();
  const currentIdx = await getWranglerKv('DATA', 'totalImages') as number;
  let images: HashtagImage[] = [];
  try {
    console.log(`Getting images for #${imgHashtag}...`);
    images = await getHashtagImages(imgHashtag, instagramSessionId);
  } catch (e) {
    console.error(`Couldn't get #${imgHashtag} data: ${e}`);
    return;
  }
  let downloadedImages: HashtagImage[] = [];
  try {
    const [downloads, errors] = await downloadHashtagImages(images, destDir);
    downloadedImages = downloads;
    printWarnings(errors, " images couldn't be downloaded");
  } catch (e) {
    console.error(`Couldn't download images: ${e}`);
    return;
  }
  let updatedIndex = 0;
  try {
    console.log("Upload images to B2 bucket...");
    const [newIndex, errors] = await uploadImagesToBucket(downloadedImages, currentIdx);
    printWarnings(errors, " images couldn't be uploaded");
    updatedIndex = newIndex;
    console.log(`New image index: ${updatedIndex}`);
  } catch(e) {
    console.error(`Couldn't upload images to bucket: ${e}`);
    return;
  }
  await setWranglerKv('DATA', 'totalImages', updatedIndex);
  await setMiniflareKv('DATA', 'totalImages', updatedIndex, wranglerConfigPath);
  try {
    await rm(destDir);
  } catch(e) {
    console.error(`Couldn't delete temp directory '${destDir}': ${e}`);
  }
  console.log("Done!");
};

export default scrape;
