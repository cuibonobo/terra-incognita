import { h } from 'preact';
import TerraSpinner from 'url:../media/TerraSpinner.gif';

const Spinner = (props: {imageSrc?: string, textContent?: string, overlay?: boolean, isHidden?: boolean}) => {
  let classes = props.overlay ? 'absolute top-0 left-0' : 'relative items-center';
  if (props.isHidden) {
    classes += " hidden";
  }
  return (
    <div class={'w-full h-full grid grid-col-1 min-h-[24rem] text-center ' + classes}>
      <div class={'relative z-40 flex flex-col space-y-2 ' + (props.overlay ? 'mt-10' : '')}>
        <img src={props.imageSrc ? props.imageSrc : TerraSpinner} class='w-8 h-8 relative mx-auto' alt="Loading spinner" />
        <div>{props.textContent ? props.textContent : 'Landscaping...'}</div>
      </div>
      <div class='w-full h-full z-10 absolute top-0 left-0 bg-white opacity-80'></div>
    </div>
  );
};

export default Spinner;
