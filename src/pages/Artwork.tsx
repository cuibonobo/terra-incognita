import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';

const Artwork = () => {
  // Configurable values
  const imgHashtag = 'landscape';
  const numImagesSqrt = 5;
  const imgBaseSize = 10;
  const imgSquareSize = 10;
  const imgQuality = 0.8;
  // Computed values
  const numImages = Math.pow(numImagesSqrt, 2);
  const imgWidth = imgSquareSize * imgBaseSize * 3;
  const imgHeight = imgSquareSize * imgBaseSize * 2;
  const imgResizeOpts = {
    mimeType: 'image/jpeg',
    width: imgWidth,
    height: imgHeight,
    quality: imgQuality
  };
  const imgDefaultName = 'image.jpg';
  const [percentLoaded, setPercentLoaded] = useState<string>("0");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null); 
  const [splitImages, setSplitImages] = useState<string[][][] | null>(null);

  // Durstenfeld shuffle taken from here: https://stackoverflow.com/a/12646864/2001558
  const shuffleArray = (array: any[]): any[] => {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const getHashtagImageUrls = async (hashtag: string): Promise<string[]> => {
    const response = await fetch(window.location + 'assets/imageNames.json');
    const imageNames = shuffleArray(await response.json());
    return imageNames.map((x: string) => `${window.location}assets/${x}`);
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
  const getImageSquareUrl = async (image: Blob, squareSize: number, col: number, row: number): Promise<string> => {
    const options = {
      width: squareSize,
      height: squareSize,
      quality: imgQuality,
      cropInfo: {
        sx: row * squareSize,
        sy: col * squareSize,
        sw: squareSize,
        sh: squareSize
      }
    }
    return (await handleMediaFile(getFileFromBlob(image), options)).base64;
  };
  const getSplitImages = async (images: Blob[], width: number, height: number, splitSize: number): Promise<string[][][]> => {
    if (splitSize > width || splitSize > height) {
      throw new Error("Square size exceeds dimensions of the image!");
    }
    const maxRows = Math.floor(height / splitSize);
    const maxCols = Math.floor(width / splitSize);
    let idx = 0;
    const lastIdx = maxRows * maxCols * images.length;
    const output: string[][][] = [];
    for (let row = 0; row < maxRows; row++) {
      output[row] = [];
      for (let col = 0; col < maxCols; col++) {
        output[row][col] = [];
        for (let img = 0; img < images.length; img++) {
          output[row][col][img] = await getImageSquareUrl(images[img], splitSize, row, col);
          idx++;
          setPercentLoaded((idx / lastIdx * 100).toFixed(2));
        }
      }
    }
    setElapsedTime((new Date()).valueOf() - startTime.valueOf())
    return output;
  };
  const updateImages = async (): Promise<void> => {
    const hashtagImageUrls = await getHashtagImageUrls(imgHashtag);
    const resizedData: MediaFileHandlerData[] = [];
    const resizedUrls: string[] = [];
    for (let i = 0; i < numImages; i++) {
      resizedData[i] = await getResizedImage(hashtagImageUrls[i], imgResizeOpts);
      resizedUrls[i] = resizedData[i].base64;
    }
    setResizedImages(resizedUrls);
    setSplitImages(await getSplitImages(resizedData.map(x => x.blob), imgWidth, imgHeight, imgSquareSize));
  };

  useEffect(() => {
    updateImages();
  }, []);

  const ImagePixel = (props: {urls: string[]}) => {
    const images: string[][] = [];
    for (let row = 0; row < numImagesSqrt; row++) {
      images[row] = [];
      for (let col = 0; col < numImagesSqrt; col++) {
        images[row][col] = props.urls[row * numImagesSqrt + col];
      }
    }
    return (
      <table style={{height: imgSquareSize * numImagesSqrt}}>
        {images.map((rows) => <tr style={{width: imgSquareSize * numImagesSqrt}}>{rows.map((x) => (<td style={{width: imgSquareSize, height: imgSquareSize}}><img src={x} /></td>))}</tr>)}
      </table>
    );
  };
  const ImageRow = (props: {urls: string[][]}) => {
    return (
      <tr style={{width: imgWidth * numImagesSqrt}}>
        {props.urls.map((x) => (<td><ImagePixel urls={x} /></td>))}
      </tr>
    );
  };
  const ImageTable = (props: {urls: string[][][]}) => {
    return (
      <table class="imageTable" style={{height: imgHeight * numImagesSqrt}}>
        {props.urls.map((x) => (<ImageRow urls={x} />))}
      </table>
    );
  };

  return (
    <div class="artwork" style={{width: `${imgWidth * numImagesSqrt}px`}}>
      <div style={{height: `${imgHeight * numImagesSqrt}px`, textAlign: "center"}}>
        {splitImages ? <ImageTable urls={splitImages} /> : `${percentLoaded}%`}
      </div>
      <div style={{textAlign: "center"}}>
        {elapsedTime ? `${elapsedTime / 1000} seconds` : "Loading..."}
      </div>
      <div class="resizedImages" style={{height: `${imgHeight * numImagesSqrt}px`}}>
        {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ""}
      </div>
    </div>
  );
};

export default Artwork;
