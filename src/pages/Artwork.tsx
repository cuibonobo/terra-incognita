import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { handleMediaFile, MediaFileHandlerData } from 'image-process';

const Artwork = () => {
  const numImages = 25;
  const numImagesSqrt = Math.floor(Math.sqrt(numImages));
  const imgBaseSize = 15;
  const imgSquareSize = 25;
  const imgWidth = imgSquareSize * imgBaseSize * 3;
  const imgHeight = imgSquareSize * imgBaseSize * 2;
  const imgUrl = window.location + "assets/CWy8gMzhVMx.jpg";
  const imgResizeOpts = {
    mimeType: 'image/jpeg',
    width: imgWidth / numImagesSqrt,
    height: imgHeight / numImagesSqrt,
    quality: 1.0
  };
  const imgDefaultName = 'image.jpg';
  const [splitImg, setSplitImg] = useState<string[][] | null>(null);

  const blobToFile = (blob: Blob, imgName: string = imgDefaultName): File => {
    return new File([blob], imgName, {type: blob.type});
  };
  const urlToFile = async (url: string): Promise<File> => {
    const parsedUrl = new URL(url);
    const imgName = parsedUrl.pathname.length > 1 ? parsedUrl.pathname.slice(1) : imgDefaultName;
    const response = await fetch(url);
    const blob = await response.blob();
    return blobToFile(blob, imgName);
  };
  const resizeImage = async (url: string): Promise<MediaFileHandlerData> => {
    const file = await urlToFile(url);
    return await handleMediaFile(file, imgResizeOpts);
  };
  const splitImage = async (data: MediaFileHandlerData, splitSize: number): Promise<string[][]> => {
    const width = data.width;
    const height = data.height;
    if (splitSize > width || splitSize > height) {
      throw new Error("Square size exceeds dimensions of the image!");
    }
    const maxCols = Math.floor(height / splitSize);
    const maxRows = Math.floor(width / splitSize);
    const output: string[][] = [];
    for (let col = 0; col < maxCols; col++) {
      output[col] = [];
      for (let row = 0; row < maxRows; row++) {
        const options = {
          width: splitSize,
          height: splitSize,
          quality: 1.0,
          cropInfo: {
            sx: row * splitSize,
            sy: col * splitSize,
            sw: splitSize,
            sh: splitSize
          }
        }
        output[col][row] = (await handleMediaFile(blobToFile(data.blob), options)).base64;
      }
    }
    return output;
  };
  const updateImages = async (url: string): Promise<void> => {
    const result = await resizeImage(url);
    setSplitImg(await splitImage(result, imgSquareSize));
  };

  useEffect(() => {
    updateImages(imgUrl);
  }, []);

  const ImageRow = (props: {urls: string[]}) => {
    return (
      <tr>
        {props.urls.map(x => (<td><img src={x} /></td>))}
      </tr>
    );
  };
  const ImageTable = (props: {urls: string[][]}) => {
    return (
      <table class="imageTable">
        {props.urls.map(x => (<ImageRow urls={x} />))}
      </table>
    );
  };

  return (
    <div>
      {splitImg ? <ImageTable urls={splitImg} /> : "Loading..."}
    </div>
  );
};

export default Artwork;
