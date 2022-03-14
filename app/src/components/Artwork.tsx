import { h, Fragment } from 'preact';
import { useStore } from '../hooks';
import { Canvas } from '../components';

const Artwork = (props: {canvasClass?: string}) => {
  const {state} = useStore();

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  return (
    <Canvas
      images={state.resizedImages}
      width={state.meta.imgWidth}
      height={state.meta.imgHeight}
      splitSize={state.imgSquareSize}
      pixelSize={state.numImagesSqrt}
      class={`mx-auto ${props.canvasClass ? props.canvasClass : ''}`}
    />
  );
};

export default Artwork;
