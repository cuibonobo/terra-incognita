import { h } from 'preact';
import { useImageData } from '../hooks';
import { Base } from '../layout';
import { Canvas } from '../components';

const Artwork = () => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <Base isFullScreen={true}>
        <div class='mx-auto'>
          Loading...
        </div>
      </Base>
    );
  }

  return (
    <Base isFullScreen={true}>
      <Canvas
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={imgSquareSize}
        pixelSize={numImagesSqrt}
      />
    </Base>
  );
};

export default Artwork;
