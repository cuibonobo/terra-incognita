import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getGridStyle, getImageResizeOpts, getResizedImageUrls } from '../browserLib/images';
import api, { Meta } from '../browserLib/api';
import Canvas from './Canvas';

const Artwork = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  const initialize = async () => {
    if (meta === null) {
      const response: unknown = await api.get('/meta');
      setMeta(response as Meta);
      return;
    }
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, meta.numImagesSqrt);
    setResizedImages(await getResizedImageUrls(meta.numImagesSqrt, imgResizeOpts))
  };

  useEffect(() => {
    initialize();
  }, [meta]);

  if (meta === null) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div class="main" style={getGridStyle(meta.imgWidth, meta.imgHeight)}>
      {resizedImages ? <Canvas
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={meta.imgSquareSize}
        pixelSize={meta.numImagesSqrt}
      /> : ""}
    </div>
  );
};

export default Artwork;
