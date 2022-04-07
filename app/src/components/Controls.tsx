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
import Spinner from './Spinner';

const Controls = () => {
  const {state, actions} = useStore();
  const [isCooling, setIsCooling] = useState<boolean>(false);
  const api = apiFactory();

  const touchHandler = async (imgIndex: number) => {
    if (state.meta === null || state.numImagesSqrt === null || state.resizedImages === null || state.imgSquareSize === null) {
      const content = "Attempting to update image array before app is ready.";
      console.error(content);
      actions.addAlert({content, isError: true});
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
      {isCooling ? <Spinner textContent='Updating...' overlay={true} /> : ''}
      <div class="flex relative flex-col p-4 space-y-8">
        <Slider
          min={state.meta.minImgSquareSize}
          max={state.meta.maxImgSquareSize}
          value={state.imgSquareSize}
          setValue={imgSquareSizeHandler}
          label={<div class="flex flex-row space-x-4 items-center max-w-md mx-auto">
            <img class='w-full h-full md:max-w-[10rem] max-w-[6rem]' src={ImageSizeMin} alt="The minimum number of pixels in a square" />
            <div class="">
              <img class='md:w-96 w-72 mt-4' src={Arrows} alt="The range between minimum and maximum" />
              <div class='text-center leading-5'>{state.imgSquareSize}</div>
            </div>
            <img class='w-full h-full md:max-w-[10rem] max-w-[6rem]' src={ImageSizeMax}alt="The maximum number of pixels in a square" />
          </div>}
        />
        <Slider
          min={state.meta.minNumImagesSqrt}
          max={state.meta.maxNumImagesSqrt}
          value={state.numImagesSqrt}
          setValue={numImagesHandler}
          label={<div class="flex flex-row space-x-4 items-center max-w-md mx-auto">
          <img class='w-full h-full md:max-w-[10rem] max-w-[6rem]' src={NumImagesMin} alt="The minimum number of images to sample" />
          <div class="">
            <img class='md:w-96 w-72 mt-4' src={Arrows} alt="The range between minimum and maximum" />
            <div class='text-center leading-5'>{Math.pow(state.numImagesSqrt, 2)}</div>
          </div>
          <img class='w-full h-full md:max-w-[10rem] max-w-[6rem]' src={NumImagesMax} alt="The maximum number of images to sample" />
        </div>}
        />
        <ImageReplacer resizedImageUrls={state.resizedImages} touchHandler={touchHandler} />
      </div>
    </div>
  );
};

export default Controls;
