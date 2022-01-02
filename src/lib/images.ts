
import { h } from 'preact';
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';
import { imgDefaultName, numImages, imgHashtag, imgResizeOpts, imgWidth, imgHeight, numImagesSqrt } from './values';

// Durstenfeld shuffle taken from here: https://stackoverflow.com/a/12646864/2001558
const shuffleArray = (array: any[]): any[] => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const getFileFromBlob = (blob: Blob, imgName: string = imgDefaultName): File => {
  return new File([blob], imgName, {type: blob.type});
};
const getFileFromUrl = async (url: string, defaultImgName: string = imgDefaultName): Promise<File> => {
  const parsedUrl = new URL(url);
  const imgName = parsedUrl.pathname.length > 1 ? parsedUrl.pathname.slice(1) : defaultImgName;
  const response = await fetch(url);
  const blob = await response.blob();
  return getFileFromBlob(blob, imgName);
};
const getResizedImage = async (url: string, options: Partial<MediaFileHandlerOptions>): Promise<MediaFileHandlerData> => {
  const file = await getFileFromUrl(url);
  return await handleMediaFile(file, options);
};
const getHashtagImageUrls = async (hashtag: string): Promise<string[]> => {
  const assetListUrl = new URL('/assets/imageNames.json', window.location.href);
  const response = await fetch(assetListUrl.href);
  const imageNames = shuffleArray(await response.json());
  return imageNames.map((x: string) => (new URL(`/assets/${x}`, window.location.href).href));
};
export const getResizedImageUrls = async (): Promise<string[]> => {
  const hashtagImageUrls = await getHashtagImageUrls(imgHashtag);
  const resizedData: MediaFileHandlerData[] = [];
  const resizedUrls: string[] = [];
  for (let i = 0; i < numImages; i++) {
    resizedData[i] = await getResizedImage(hashtagImageUrls[i], imgResizeOpts);
    resizedUrls[i] = resizedData[i].url;
  }
  return resizedUrls;
};
export const getGridStyle = (): h.JSX.CSSProperties => {
  return {
    width: `${imgWidth * numImagesSqrt}px`,
    height: `${imgHeight * numImagesSqrt}px`
  };
};
