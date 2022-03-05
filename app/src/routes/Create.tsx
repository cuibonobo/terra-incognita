import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getImgSquareSize, getMeta, getNumImagesSqrt, postImgArray } from '../lib/api';
import { getImageResizeOpts, getResizedImageUrls, getImageUrl, getResizedImage } from '../lib/images';
import { Canvas, ImageReplacer, Loading } from '../components';
import { Meta } from '../../../shared';

const Create = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number | null>(null);
  const [imgSquareSize, setImgSquareSize] = useState<number | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  const loadData = async () => {
    setMeta(await getMeta());
    setNumImagesSqrt(await getNumImagesSqrt());
    setImgSquareSize(await getImgSquareSize());
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
    const newImageNum = await postImgArray(imgIndex);
    const newImageUrl = getImageUrl(newImageNum);
    const newResizedImage = await getResizedImage(newImageUrl, getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt));
    const newResizedImages = [...resizedImages];
    newResizedImages[imgIndex] = newResizedImage.url;
    setResizedImages(newResizedImages);
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
      <div>
        <div>
          Number of images
        </div>
        <div>
          Image square size
        </div>
        <ImageReplacer resizedImageUrls={resizedImages} touchHandler={touchHandler} />
      </div>
    </div>
  );
};

export default Create;
