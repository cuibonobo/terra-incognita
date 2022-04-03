import { h } from 'preact';
import TerraSpinner from 'url:../media/TerraSpinner.gif';

const Spinner = (props: {textContent?: string, overlay?: boolean}) => {
  const classes = props.overlay ? 'absolute top-0 left-0' : 'relative items-center'
  return (
    <div class={'w-full h-full grid grid-col-1 min-h-[24rem] text-center ' + classes}>
      <div class={'relative z-40 flex flex-col space-y-2 ' + (props.overlay ? 'mt-10' : '')}>
        <img src={TerraSpinner} class='w-8 h-8 relative mx-auto' />
        <div>{props.textContent ? props.textContent : 'Landscaping...'}</div>
      </div>
      <div class='w-full h-full z-10 absolute top-0 left-0 bg-white opacity-80'></div>
    </div>
  );
};

export default Spinner;
