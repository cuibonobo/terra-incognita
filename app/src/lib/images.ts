
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';

const IMG_NAME_PADDING = 8;
const imagesBaseUrl = 'https://terra-images.cuibonobo.com';

const getImageResizeOpts = (imgWidth: number, imgHeight: number, numImagesSqrt: number, imgSquareSize: number): Partial<MediaFileHandlerOptions> => {
  return {
    mimeType: 'image/jpeg',
    width: imgWidth / numImagesSqrt + imgSquareSize,
    height: imgHeight / numImagesSqrt + imgSquareSize,
    quality: 0.8
  };
};
const getFileFromBlob = (blob: Blob, imgName: string = 'image.jpg'): File => {
  return new File([blob], imgName, {type: blob.type});
};
const getFileFromUrl = async (url: string): Promise<File> => {
  const parsedUrl = new URL(url);
  // Remove the forward slash from the image URL
  const imgName = parsedUrl.pathname.length > 1 ? parsedUrl.pathname.slice(1) : undefined;
  const response = await fetch(url);
  const blob = await response.blob();
  return getFileFromBlob(blob, imgName);
};
const getResizedImage = async (url: string, imgWidth: number, imgHeight: number, numImagesSqrt: number, imgSquareSize: number): Promise<MediaFileHandlerData> => {
  const file = await getFileFromUrl(url);
  return handleMediaFile(file, getImageResizeOpts(imgWidth, imgHeight, numImagesSqrt, imgSquareSize));
};
const getIndexedName = (idx: number, imageExt: string = '.jpg', namePadding: number = IMG_NAME_PADDING): string => {
  // Convert the index to a string, pad it with zeroes, and add an extension
  return String(idx).padStart(namePadding, '0') + imageExt;
};
const getImageUrl = (imgNum: number): string => {
  return `${imagesBaseUrl}/${getIndexedName(imgNum)}`;
};
const getImageUrls = (imgArray: number[]): string[] => {
  return imgArray.map(getImageUrl);
};
const copyArrayToLength = <T extends string | number | boolean | null | undefined>(arrayToCopy: null | T[], length: number): T[] => {
  const copiedArray = arrayToCopy === null ? new Array<T>(length) : arrayToCopy.slice(0, length);
  copiedArray.length = length;
  return copiedArray;
};
export const getDiffResizedImageUrls = async (
  imgWidth: number, imgHeight: number, imgSquareSize: number, oldImgArray: number[] | null, newImgArray: number[], oldNumImagesSqrt: number | null, newNumImagesSqrt: number, cachedResizedUrls: null | string[]
): Promise<string[]> => {
  const numImages = Math.pow(newNumImagesSqrt, 2);
  const baseImgArray = copyArrayToLength(oldImgArray, newImgArray.length);
  const cachedUrls = copyArrayToLength(cachedResizedUrls, numImages);
  const imgUrls = getImageUrls(copyArrayToLength(newImgArray, numImages));
  return Promise.all(imgUrls.map(async (imgUrl: string, i: number) => {
    if (oldNumImagesSqrt === newNumImagesSqrt && baseImgArray[i] === newImgArray[i] && cachedUrls[i]) {
      return cachedUrls[i];
    }
    const resizedImage = await getResizedImage(imgUrl, imgWidth, imgHeight, newNumImagesSqrt, imgSquareSize);
    return resizedImage.url;
  }));
};
