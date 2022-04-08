import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ImageReplacer, Slider } from '../components';
import Arrows from 'url:../media/Arrows.svg';
import ImageSizeMin from 'url:../media/ImageSizeMin.svg';
import ImageSizeMax from 'url:../media/ImageSizeMax.svg';
import NumImagesMin from 'url:../media/NumImagesMin.svg';
import NumImagesMax from 'url:../media/NumImagesMax.svg';
import TerraOffline from 'url:../media/TerraOffline.png';
import { useStore } from '../hooks';
import apiFactory from '../lib/api';
import Spinner from './Spinner';

const SliderGraphics = (props: {value: number, minSrc: string, minAlt: string, maxSrc: string, maxAlt: string}) => {
  return (
    <div class="flex flex-row space-x-4 items-center max-w-md mx-auto">
      <img class='w-full md:h-24 h-12 md:max-w-[10rem] max-w-[6rem]' src={props.minSrc} alt={props.minAlt} />
      <div class="w-full">
        <img class='w-full md:h-6 h-4 md:max-w-[10rem] max-w-[6rem] mt-4' src={Arrows} alt="The range between minimum and maximum" />
        <div class='text-center md:text-base text-sm leading-5'>{props.value}</div>
      </div>
      <img class='w-full md:h-24 h-12 md:max-w-[10rem] max-w-[6rem]' src={props.maxSrc}alt={props.maxAlt} />
    </div>
  );
};

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
      <Spinner
        imageSrc={TerraOffline}
        textContent='Your session is currently offline. Try refreshing the page or checking back in a few minutes...'
        overlay={true}
        isHidden={!state.isOffline}
      />
      <Spinner textContent='Updating...' overlay={true} isHidden={!isCooling} />
      <div class="flex relative flex-col p-4 space-y-8">
        <Slider
          min={state.meta.minImgSquareSize}
          max={state.meta.maxImgSquareSize}
          value={state.imgSquareSize}
          setValue={imgSquareSizeHandler}
          label={<SliderGraphics value={state.imgSquareSize}
            minSrc={ImageSizeMin} minAlt="The minimum number of pixels in a square"
            maxSrc={ImageSizeMax} maxAlt="The maximum number of pixels in a square"
          />}
        />
        <Slider
          min={state.meta.minNumImagesSqrt}
          max={state.meta.maxNumImagesSqrt}
          value={state.numImagesSqrt}
          setValue={numImagesHandler}
          label={<SliderGraphics value={Math.pow(state.numImagesSqrt, 2)}
            minSrc={NumImagesMin} minAlt="The minimum number of images to sample"
            maxSrc={NumImagesMax} maxAlt="The range between minimum and maximum"
          />}
        />
        <ImageReplacer resizedImageUrls={state.resizedImages} touchHandler={touchHandler} />
      </div>
    </div>
  );
};

export default Controls;
