import { h } from 'preact';
import { useState } from 'preact/hooks';

const Image = (props: {idx: number, src: string, touchHandler: (imgIndex: number) => Promise<void>}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const touchHandler = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    await props.touchHandler(props.idx);
    setIsLoading(false);
  };

  return (
    <img class={`w-full h-full ${isLoading ? 'opacity-50' : ''}`} src={props.src} data-key={props.idx} onClick={touchHandler} />
  );
};

export default Image;
