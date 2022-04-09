import { h, Fragment } from 'preact';
import { useStore } from '../hooks';
import { Canvas } from '../components';

const Artwork = (props: {canvasClass?: string}) => {
  const {state} = useStore();

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  return (
    <div class="relative">
      <Canvas
        images={state.resizedImages}
        width={state.meta.imgWidth}
        height={state.meta.imgHeight}
        splitSize={state.imgSquareSize}
        pixelSize={state.numImagesSqrt}
        class={`mx-auto ${props.canvasClass ? props.canvasClass : ''}`}
      />
      <div title="Offline" class={"absolute bottom-4 right-4 w-2 h-2 z-10 bg-red-600 rounded-full" + (state.isOffline ? '' : ' hidden')}></div>
    </div>
  );
};

export default Artwork;
