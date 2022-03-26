import { h } from 'preact';
import { useEffect, useState, useRef, useMemo } from 'preact/hooks';

const Canvas = (props: {
  images: string[], width: number, height: number, splitSize: number, pixelSize: number,
  class?: string
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImageUrls] = useState<string[]>(props.images);
  const [splitSize, setSplitSize] = useState<number>(props.splitSize);
  const [pixelSize, setPixelSize] = useState<number>(props.pixelSize);
  const [drawCtx, setDrawCtx] = useState<CanvasRenderingContext2D | null>(null);

  const getImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = (ev: Event) => {
        resolve(image);
      };
      try {
        image.src = url;
      } catch (e) {
        reject(e);
      }
    });
  };
  const drawImages = useMemo(async () => {
    if (!drawCtx) {
      return;
    }
    const w = props.width / pixelSize;
    const h = props.height / pixelSize;
    const s = splitSize;
    const p = pixelSize;
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
  }, [drawCtx, images, splitSize]);

  useEffect(() => {
    if (canvasRef.current) {
      const context2d = canvasRef.current.getContext("2d");
      setDrawCtx(context2d);
      if (context2d) {
        drawImages;
      }
    }
  }, [canvasRef]);

  useEffect(() => {
    if (!drawCtx) {
      return;
    }
    setImageUrls(props.images);
  }, [props.images]);

  useEffect(() => {
    if (!drawCtx) {
      return;
    }
    setSplitSize(props.splitSize);
  }, [props.splitSize]);

  useEffect(() => {
    if (!drawCtx) {
      return;
    }
    setPixelSize(props.pixelSize);
  }, [props.pixelSize]);

  return (
    <canvas class={props.class} width={props.width} height={props.height} ref={canvasRef}></canvas>
  );
};

export default Canvas;
