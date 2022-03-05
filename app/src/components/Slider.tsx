import { h, JSX } from 'preact';
import { useState } from 'preact/hooks';

const Slider = (props: {min: number, max: number, value: number, setValue: (value: number)=>Promise<void>, step?: number}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  return (
    <input type="range" style={{width: "100%"}} disabled={isLoading} min={props.min} max={props.max} value={props.value} step={props.step} onInput={onInput}/>
  );
};

export default Slider;
