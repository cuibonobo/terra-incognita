import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getGridStyle, getImageResizeOpts, getResizedImageUrls } from '../browserLib/images';
import { Meta, getMeta, getNumImagesSqrt, getImgSquareSize } from '../browserLib/api';
import Canvas from './Canvas';

const Artwork = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number | null>(null);
  const [imgSquareSize, setImgSquareSize] = useState<number | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  const loadData = async () => {
    try {
      setMeta(await getMeta());
      setNumImagesSqrt(await getNumImagesSqrt());
      setImgSquareSize(await getImgSquareSize());
      setIsLoading(false);
    } catch(e) {
      setErrors([...errors, `${e}`]);
    }
  };

  const loadImages = async () => {
    if (meta === null || numImagesSqrt === null || imgSquareSize === null) {
      return;
    }
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt);
    setResizedImages(await getResizedImageUrls(numImagesSqrt, imgResizeOpts));
  };

  useEffect(() => {
    if (isLoading) {
      loadData();
      return;
    }
    loadImages();
  }, [isLoading, errors]);

  if (errors.length > 1) {
    return errors.map((error:string) => <p>{error}</p>);
  }

  if (meta === null || numImagesSqrt === null || imgSquareSize === null) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div class='main' style={getGridStyle(meta.imgWidth, meta.imgHeight)}>
      {resizedImages ? <Canvas
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={imgSquareSize}
        pixelSize={numImagesSqrt}
      /> : ''}
    </div>
  );
};

export default Artwork;
