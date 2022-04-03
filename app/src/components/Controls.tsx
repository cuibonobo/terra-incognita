import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ImageReplacer, Slider } from '../components';
import Arrows from 'url:../media/Arrows.svg';
import ImageSizeMin from 'url:../media/ImageSizeMin.svg';
import ImageSizeMax from 'url:../media/ImageSizeMax.svg';
import NumImagesMin from 'url:../media/NumImagesMin.svg';
import NumImagesMax from 'url:../media/NumImagesMax.svg';
import { useStore } from '../hooks';
import apiFactory from '../lib/api';

const Controls = () => {
  const {state, actions} = useStore();
  const [isCooling, setIsCooling] = useState<boolean>(false);
  const api = apiFactory();

  const touchHandler = async (imgIndex: number) => {
    if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
      console.error("Attempting to update image array before app is ready.");
      return;
    }
    actions.updateImgArray(await api.postImgArray(imgIndex));
    setIsCooling(true);
  };

  if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
    return <Fragment />;
  }

  const numImagesHandler = async (value: number) => {
    if (value === state.numImagesSqrt) {
      return;
    }
    actions.updateNumImagesSqrt(await api.putNumImagesSqrt(value));
    setIsCooling(true);
  };

  const imgSquareSizeHandler = async (value: number) => {
    if (value === state.imgSquareSize) {
      return;
    }
    actions.updateImgSquareSize(await api.putImgSquareSize(value));
    setIsCooling(true);
  };

  useEffect(() => {
    if (state.meta === null || !isCooling) {
      return;
    }
    setTimeout(() => setIsCooling(false), state.meta.cooldownTimeout * 1000);
  }, [isCooling]);

  return (
    <div class="mx-auto relative w-full 2xl:w-1/2 xl:w-3/5 md:w-4/5">
      <div class="flex flex-col p-4 space-y-8">
        <Slider
          min={state.meta.minImgSquareSize}
          max={state.meta.maxImgSquareSize}
          value={state.imgSquareSize}
          setValue={imgSquareSizeHandler}
          label={<div class="flex flex-row space-x-4 items-center max-w-md mx-auto">
            <img class='w-full h-full' src={ImageSizeMin} />
            <div class="">
              <img class='md:w-96 w-72 mt-4' src={Arrows} />
              <div class='text-center leading-5'>{state.imgSquareSize}</div>
            </div>
            <img class='w-full h-full' src={ImageSizeMax} />
          </div>}
        />
        <Slider
          min={state.meta.minNumImagesSqrt}
          max={state.meta.maxNumImagesSqrt}
          value={state.numImagesSqrt}
          setValue={numImagesHandler}
          label={<div class="flex flex-row space-x-4 items-center max-w-md mx-auto">
          <img class='w-full h-full' src={NumImagesMin} />
          <div class="">
            <img class='md:w-96 w-72 mt-4' src={Arrows} />
            <div class='text-center leading-5'>{state.numImagesSqrt}</div>
          </div>
          <img class='w-full h-full' src={NumImagesMax} />
        </div>}
        />
        <ImageReplacer resizedImageUrls={state.resizedImages} touchHandler={touchHandler} />
      </div>
      <div class={`w-full h-full absolute top-0 left-0 bg-white opacity-50 text-center ${isCooling ? '' : 'hidden'}`}>Updating...</div>
    </div>
  );
};

export default Controls;
