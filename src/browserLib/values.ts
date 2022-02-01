
// Configurable values
export const imgHashtag = 'landscape';
export const numImagesSqrt = 5;
export const imgSquareSize = 10;
const imgBaseSize = 10;
const imgQuality = 0.8;

// Constants
export const imgDefaultName = 'image.jpg';

// Computed values
export const numImages = Math.pow(numImagesSqrt, 2);
export const imgWidth = imgSquareSize * imgBaseSize * 3;
export const imgHeight = imgSquareSize * imgBaseSize * 2;
export const imgResizeOpts = {
  mimeType: 'image/jpeg',
  width: imgWidth,
  height: imgHeight,
  quality: imgQuality
};
