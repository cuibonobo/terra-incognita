import { Fragment, h } from 'preact';
import { ActionTypes } from '../actions';
import { ImageReplacer, Slider } from '../components';
import { useStore } from '../hooks';
import apiFactory from '../lib/api';
import { getImageResizeOpts, getImageUrl, getResizedImage } from '../lib/images';

const Controls = () => {
  const {state, dispatch} = useStore();
  const api = apiFactory();

  const touchHandler = async (imgIndex: number) => {
    if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
      return;
    }
    const imageNum = await api.postImgArray(imgIndex);
    const imageUrl = getImageUrl(imageNum);
    const newResizedImage = await getResizedImage(imageUrl, getImageResizeOpts(state.meta.imgWidth, state.meta.imgHeight, state.numImagesSqrt));
    const newResizedImages = Array.from(state.resizedImages);
    newResizedImages[imgIndex] = newResizedImage.url;
    dispatch({
      type: ActionTypes.UpdateResizedImages,
      resizedImages: newResizedImages
    });
  };

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  const numImagesHandler = async (value: number) => {
    if (value === state.numImagesSqrt) {
      return;
    }
    const newNumImages = await api.putNumImagesSqrt(value);
    dispatch({
      type: ActionTypes.UpdateNumImagesSqrt,
      numImagesSqrt: newNumImages
    });
  };

  const imgSquareSizeHandler = async (value: number) => {
    if (value === state.imgSquareSize) {
      return;
    }
    dispatch({
      type: ActionTypes.UpdateImgSquareSize,
      imgSquareSize: await api.putImgSquareSize(value)
    });
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
