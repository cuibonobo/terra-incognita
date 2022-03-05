import { h } from 'preact';
import { useState } from 'preact/hooks';

const Image = (props: {idx: number, src: string, touchHandler: (imgIndex: number) => Promise<void>}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const touchHandler = async () => {
    setIsLoading(true);
    await props.touchHandler(props.idx);
    setIsLoading(false);
  };

  return (
    <div class="mx-auto" >
      <img class={isLoading ? 'opacity-50' : ''} src={props.src} data-key={props.idx} onClick={() => touchHandler()} />
    </div>
  );
};

export default Image;
