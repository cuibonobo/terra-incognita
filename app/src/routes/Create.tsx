import { h, Fragment } from 'preact';
import { Canvas, Controls } from '../components';
import { useStore } from '../hooks';

const Create = () => {
  const {state} = useStore();

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  return (
    <div class='mx-auto flex flex-col space-y-6'>
      <Canvas
        class='w-full'
        images={state.resizedImages}
        width={state.meta.imgWidth}
        height={state.meta.imgHeight}
        splitSize={state.imgSquareSize}
        pixelSize={state.numImagesSqrt}
      />
      <Controls />
    </div>
  );
};

export default Create;
