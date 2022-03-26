import { Fragment, h } from 'preact';
import { ImageReplacer, Slider } from '../components';
import { useStore } from '../hooks';
import apiFactory from '../lib/api';

const Controls = () => {
  const {state, actions} = useStore();
  const api = apiFactory();

  const touchHandler = async (imgIndex: number) => {
    if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
      return;
    }
    actions.updateImgArray(await api.postImgArray(imgIndex))
  };

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  const numImagesHandler = async (value: number) => {
    if (value === state.numImagesSqrt) {
      return;
    }
    actions.updateNumImagesSqrt(await api.putNumImagesSqrt(value));
  };

  const imgSquareSizeHandler = async (value: number) => {
    if (value === state.imgSquareSize) {
      return;
    }
    actions.updateImgSquareSize(await api.putImgSquareSize(value));
  };

  return (
    <div class="mx-auto flex flex-col p-4">
      <div>
        <Slider
          min={state.meta.minNumImagesSqrt}
          max={state.meta.maxNumImagesSqrt}
          value={state.numImagesSqrt}
          setValue={numImagesHandler}
          label={<Fragment>Number of images: {state.numImagesSqrt}</Fragment>}
        />
      </div>
      <div>
        <Slider
          min={state.meta.minImgSquareSize}
          max={state.meta.maxImgSquareSize}
          value={state.imgSquareSize}
          setValue={imgSquareSizeHandler}
          label={<Fragment>Image square size: {state.imgSquareSize}</Fragment>}
        />
      </div>
      <ImageReplacer resizedImageUrls={state.resizedImages} touchHandler={touchHandler} />
    </div>
  );
};

export default Controls;
