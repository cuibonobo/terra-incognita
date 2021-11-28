import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { handleMediaFile, MediaFileHandlerData, MediaFileHandlerOptions } from 'image-process';

const Artwork = () => {
  // Configurable values
  const numImages = 25;
  const imgBaseSize = 3;
  const imgSquareSize = 25;
  const imgQuality = 0.8;
  // Computed values
  const numImagesSqrt = Math.floor(Math.sqrt(numImages));
  const imgWidth = imgSquareSize * imgBaseSize * 3;
  const imgHeight = imgSquareSize * imgBaseSize * 2;
  const imgUrl = window.location + "assets/CWy8gMzhVMx.jpg";
  const imgResizeOpts = {
    mimeType: 'image/jpeg',
    width: imgWidth,
    height: imgHeight,
    quality: imgQuality
  };
  const imgDefaultName = 'image.jpg';
  const [resizedImages, setResizedImages] = useState<string[] | null>(null); 
  const [splitImages, setSplitImages] = useState<string[][][] | null>(null);

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
          console.log(idx / lastIdx * 100);
        }
      }
    }
    return output;
  };
  const updateImages = async (url: string): Promise<void> => {
    const resizedData: MediaFileHandlerData[] = [];
    const resizedUrls: string[] = [];
    for (let i = 0; i < numImages; i++) {
      resizedData[i] = await getResizedImage(url, imgResizeOpts);
      resizedUrls[i] = resizedData[i].base64;
      console.log(`Resized image ${i}`);
    }
    setResizedImages(resizedUrls);
    setSplitImages(await getSplitImages(resizedData.map(x => x.blob), imgWidth, imgHeight, imgSquareSize));
  };

  useEffect(() => {
    updateImages(imgUrl);
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
      <table>
        {images.map((rows, i) => <tr class={`pixel-row-${i}`}>{rows.map((x, j) => (<td class={`pixel-col-${j}`}><img src={x} /></td>))}</tr>)}
      </table>
    );
  };
  const ImageRow = (props: {urls: string[][], rowIdx: number}) => {
    return (
      <tr class={`table-row-${props.rowIdx}`}>
        {props.urls.map((x, i) => (<td class={`table-col-${i}`}><ImagePixel urls={x} /></td>))}
      </tr>
    );
  };
  const ImageTable = (props: {urls: string[][][]}) => {
    return (
      <table class="imageTable">
        {props.urls.map((x, i) => (<ImageRow urls={x} rowIdx={i} />))}
      </table>
    );
  };

  return (
    <div>
      <div>
        {splitImages ? <ImageTable urls={splitImages} /> : "Loading..."}
      </div>
      <div>
        {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ""}
      </div>
    </div>
  );
};

export default Artwork;
