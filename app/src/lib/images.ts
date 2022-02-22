
import { h } from 'preact';
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';
import { getImgArray } from './api';

const imagesBaseUrl = 'https://terra-images.cuibonobo.com';

export const getImageResizeOpts = (imgWidth: number, imgHeight: number, numImagesSqrt: number): Partial<MediaFileHandlerOptions> => {
  return {
    mimeType: 'image/jpeg',
    width: imgWidth / numImagesSqrt,
    height: imgHeight / numImagesSqrt,
    quality: 0.8
  };
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
const getIndexedName = (idx: number, imageExt: string = '.jpg', namePadding: number = 8): string => {
  return String(idx).padStart(namePadding, '0') + imageExt;
};
const getImageUrls = async (): Promise<string[]> => {
  const imgArray = await getImgArray();
  return imgArray.map((n: number) => `${imagesBaseUrl}/${getIndexedName(n)}`);
};
export const getResizedImageUrls = async (numImagesSqrt: number, imgResizeOpts: Partial<MediaFileHandlerOptions>): Promise<string[]> => {
  const imageUrls = (await getImageUrls()).slice(0, Math.pow(numImagesSqrt, 2));
  return Promise.all(imageUrls.map(async (imageUrl: string) => {
    const resizedImage = await getResizedImage(imageUrl, imgResizeOpts);
    return resizedImage.url;
  }));
};
export const getGridStyle = (imgWidth: number, imgHeight: number): h.JSX.CSSProperties => {
  return {
    width: `${imgWidth}px`,
    height: `${imgHeight}px`
  };
};
