import { h, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { getRandomString } from '../../../shared';

const ID_LENGTH = 6;

const Slider = (props: {min: number, max: number, value: number, setValue: (value: number)=>Promise<void>, step?: number, label?: JSX.Element}) => {
  const [sliderId] = useState<string>(getRandomString(ID_LENGTH, 'slider-'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const step = props.step ? props.step : 1;

  const onInput: JSX.GenericEventHandler<HTMLInputElement> = async (event: JSX.TargetedEvent) => {
    if (!event.target) {
      return;
    }
    if (isLoading) {
      return;
    }
    const inputEl = event.target as HTMLInputElement;
    setIsLoading(true);
    await props.setValue(parseInt(inputEl.value, 10));
    setIsLoading(false);
  };

  if (props.min > props.max) {
    throw new Error("Min must be less than max!");
  }

  return (
    <div>
      {props.label ? <label for={sliderId}>{props.label}</label> : ''}
      <div class='flex justify-between select-none text-[0.5rem] -mb-4'>
        {Array.from({length: props.max - props.min + 1}).map((_, i) => <span key={i} value={props.min + i * step}>|</span>)}
      </div>
      <input
        id={sliderId}
        type="range"
        style={{width: "100%"}}
        disabled={isLoading}
        min={props.min}
        max={props.max}
        step={step}
        value={props.value}
        onInput={onInput}
      />
    </div>
  );
};

export default Slider;
