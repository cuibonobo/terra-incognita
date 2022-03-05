import { h } from 'preact';
import { useImageData } from '../hooks';
import { Canvas, Loading } from '../components';

const Artwork = (props: {canvasClass?: string}) => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <Loading />
    );
  }

  return (
    <Canvas
      images={resizedImages}
      width={meta.imgWidth}
      height={meta.imgHeight}
      splitSize={imgSquareSize}
      pixelSize={numImagesSqrt}
      class={`mx-auto ${props.canvasClass ? props.canvasClass : ''}`}
    />
  );
};

export default Artwork;
