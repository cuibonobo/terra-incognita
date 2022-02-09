
import { h } from 'preact';
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';
import { imgWidth, imgHeight, numImagesSqrt } from './values';

const imagesBaseUrl = "https://terra-images.cuibonobo.com"
const assetListUrl = `${imagesBaseUrl}/imageNames.json`;
const imgResizeOpts = {
  mimeType: 'image/jpeg',
  width: imgWidth / numImagesSqrt,
  height: imgHeight / numImagesSqrt,
  quality: 0.8
};

// Durstenfeld shuffle taken from here: https://stackoverflow.com/a/12646864/2001558
const shuffleArray = (array: any[]): any[] => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const getFileFromBlob = (blob: Blob, imgName: string = 'image.jpg'): File => {
  return new File([blob], imgName, {type: blob.type});
};
const getFileFromUrl = async (url: string): Promise<File> => {
  const parsedUrl = new URL(url);
  const imgName = parsedUrl.pathname.length > 1 ? parsedUrl.pathname.slice(1) : undefined;
  const response = await fetch(url);
  const blob = await response.blob();
  return getFileFromBlob(blob, imgName);
};
const getResizedImage = async (url: string, options: Partial<MediaFileHandlerOptions>): Promise<MediaFileHandlerData> => {
  const file = await getFileFromUrl(url);
  return await handleMediaFile(file, options);
};
const getImageUrls = async (): Promise<string[]> => {
  const response = await fetch(assetListUrl);
  const imageNames = shuffleArray(await response.json());
  return imageNames.map((x: string) => (`${imagesBaseUrl}/${x}`));
};
export const getResizedImageUrls = async (): Promise<string[]> => {
  const imageUrls = (await getImageUrls()).slice(0, Math.pow(numImagesSqrt, 2));
  return Promise.all(imageUrls.map(async (imageUrl: string) => {
    const resizedImage = await getResizedImage(imageUrl, imgResizeOpts);
    return resizedImage.url;
  }));
};
export const getGridStyle = (): h.JSX.CSSProperties => {
  return {
    width: `${imgWidth}px`,
    height: `${imgHeight}px`
  };
};
