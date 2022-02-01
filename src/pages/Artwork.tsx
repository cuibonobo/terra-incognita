import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { numImagesSqrt, imgWidth, imgHeight, imgSquareSize } from '../browserLib/values';
import { getGridStyle, getResizedImageUrls } from '../browserLib/images';
import Canvas from './Canvas';

const Artwork = () => {
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      setResizedImages(await getResizedImageUrls())
    })();
  }, []);

  return (
    <div class="main" style={getGridStyle()}>
      {resizedImages ? <Canvas images={resizedImages} width={imgWidth} height={imgHeight} splitSize={imgSquareSize} pixelSize={numImagesSqrt} /> : ""}
    </div>
  );
};

export default Artwork;
