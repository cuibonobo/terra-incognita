import { h, JSX } from 'preact';

const ImageReplacer = (props: {resizedImageUrls: string[], touchHandler: (imgIndex: number) => Promise<void>}) => {
  const touchHandler = (event: JSX.TargetedMouseEvent<HTMLImageElement>) => {
    if (event.target === null) {
      return;
    }
    const imageEl = event.target as HTMLImageElement;
    props.touchHandler(parseInt(imageEl.getAttribute('data-key')!, 10));
  };

  return (
    <div class="grid grid-cols-3 gap-4 justify-around">
      {props.resizedImageUrls.map((x: string, i: number) => (
        <div class="mx-auto" key={i}><img src={x} data-key={i} onClick={touchHandler} /></div>
      ))}
    </div>
  );
};

export default ImageReplacer;
