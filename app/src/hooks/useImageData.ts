import { useEffect, useState } from 'preact/hooks';
import apiFactory from '../lib/api';
import { getImageResizeOpts, getResizedImageUrls } from '../lib/images';
import { Meta } from '../../../shared';

const useImageData = () => {
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

  return {resizedImages, meta, numImagesSqrt, imgSquareSize};
};

export default useImageData;
