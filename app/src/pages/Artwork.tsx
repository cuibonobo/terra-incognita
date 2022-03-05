import { h } from 'preact';
import { useImageData } from '../hooks';
import { FullscreenPage } from '../layout';
import { Canvas, Loading } from '../components';

const Artwork = () => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <FullscreenPage>
        <Loading />
      </FullscreenPage>
    );
  }

  return (
    <FullscreenPage>
      <Canvas
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={imgSquareSize}
        pixelSize={numImagesSqrt}
        class='mx-auto'
      />
    </FullscreenPage>
  );
};

export default Artwork;
