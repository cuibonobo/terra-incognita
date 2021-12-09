import { h } from 'preact';
import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
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
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

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
  const updateImages = async (): Promise<void> => {
    const hashtagImageUrls = await getHashtagImageUrls(imgHashtag);
    const resizedData: MediaFileHandlerData[] = [];
    const resizedUrls: string[] = [];
    for (let i = 0; i < numImages; i++) {
      resizedData[i] = await getResizedImage(hashtagImageUrls[i], imgResizeOpts);
      resizedUrls[i] = resizedData[i].url;
    }
    setResizedImages(resizedUrls);
  };

  useEffect(() => {
    updateImages();
  }, []);

  const Canvas = (props: {
    images: string[], width: number, height: number, splitSize: number, pixelSize: number, baseSize: number
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [drawCtx, setDrawCtx] = useState<CanvasRenderingContext2D | null>(null);

    const getImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = (ev: Event) => {
          resolve(image);
        };
        image.src = url;
      });
    };
    const drawImages = useMemo(async () => {
      if (!drawCtx) {
        return;
      }
      const w = props.width;
      const h = props.height;
      const s = props.splitSize;
      const p = props.pixelSize;
      const images = props.images;
      if (s > w || s > h) {
        throw new Error("Square size exceeds dimensions of the image!");
      }
      const yMax = Math.floor(h / s);
      const xMax = Math.floor(w / s);
      const pixelWidth = s * p;
      
      for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
        const image = await getImage(images[imgIdx]);
        const [imgX, imgY] = [imgIdx % p, Math.floor(imgIdx / p)];
        for (let x = 0; x < xMax; x++) {
          for (let y = 0; y < yMax; y++) {
            // ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
            drawCtx.drawImage(image, x * s, y * s, s, s, x * pixelWidth + imgX * s, y * pixelWidth + imgY * s, s, s);
          }
        }
      }
    }, [drawCtx]);

    useEffect(() => {
      if (canvasRef.current) {
        const context2d = canvasRef.current.getContext("2d");
        setDrawCtx(context2d);
        if (context2d) {
          drawImages;
        }
      }
    }, [canvasRef]);

    return (
      <canvas width={props.width * props.baseSize} height={props.height * props.baseSize} ref={canvasRef}></canvas>
    );
  };

  return (
    <div class="artwork" style={{width: `${imgWidth * numImagesSqrt}px`}}>
      <div style={{height: `${imgHeight * numImagesSqrt}px`, textAlign: "center"}}>
        {resizedImages ? <Canvas images={resizedImages} width={imgWidth} height={imgHeight} splitSize={imgSquareSize} pixelSize={numImagesSqrt} baseSize={imgBaseSize} /> : ""}
      </div>
      <div style={{textAlign: "center"}}>
        &nbsp;
      </div>
      <div class="resizedImages" style={{height: `${imgHeight * numImagesSqrt}px`}}>
        {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ""}
      </div>
    </div>
  );
};

export default Artwork;
