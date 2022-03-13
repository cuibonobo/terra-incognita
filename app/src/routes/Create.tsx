import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import apiFactory from '../lib/api';
import { getImageResizeOpts, getResizedImageUrls, getImageUrl, getResizedImage } from '../lib/images';
import { Canvas, ImageReplacer, Loading, Slider } from '../components';
import { Meta } from '../../../shared';

const Create = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number | null>(null);
  const [imgSquareSize, setImgSquareSize] = useState<number | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);
  const api = apiFactory();

  const loadData = async () => {
    setMeta(await api.getMeta());
    setNumImagesSqrt(await api.getNumImagesSqrt());
    setImgSquareSize(await api.getImgSquareSize());
  };

  const loadImages = async () => {
    if (meta === null || numImagesSqrt === null) {
      return;
    }
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt);
    setResizedImages(await getResizedImageUrls(numImagesSqrt, imgResizeOpts));
  };

  useEffect(() => {
    if (numImagesSqrt === null) {
      loadData();
      return;
    }
    loadImages();
  }, [numImagesSqrt]);

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <Loading />
    );
  }

  const touchHandler = async (imgIndex: number) => {
    const newImageNum = await api.postImgArray(imgIndex);
    const newImageUrl = getImageUrl(newImageNum);
    const newResizedImage = await getResizedImage(newImageUrl, getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt));
    const newResizedImages = [...resizedImages];
    newResizedImages[imgIndex] = newResizedImage.url;
    setResizedImages(newResizedImages);
  };

  const numImagesHandler = async (value: number) => {
    if (value === numImagesSqrt) {
      return;
    }
    const newNumImages = await api.putNumImagesSqrt(value);
    setNumImagesSqrt(newNumImages);
  };

  const imgSquareSizeHandler = async (value: number) => {
    if (value === imgSquareSize) {
      return;
    }
    setImgSquareSize(await api.putImgSquareSize(value));
  };

  return (
    <div class='mx-auto flex flex-col'>
      <Canvas
        class='w-full'
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={imgSquareSize}
        pixelSize={numImagesSqrt}
      />
      <div class="mx-auto flex flex-col">
        <div>
          <Slider
            min={meta.minNumImagesSqrt}
            max={meta.maxNumImagesSqrt}
            value={numImagesSqrt}
            setValue={numImagesHandler}
            label={<Fragment>Number of images: {numImagesSqrt}</Fragment>}
          />
        </div>
        <div>
          <Slider
            min={meta.minImgSquareSize}
            max={meta.maxImgSquareSize}
            value={imgSquareSize}
            setValue={imgSquareSizeHandler}
            label={<Fragment>Image square size: {imgSquareSize}</Fragment>}
          />
        </div>
        <ImageReplacer resizedImageUrls={resizedImages} touchHandler={touchHandler} />
      </div>
    </div>
  );
};

export default Create;
