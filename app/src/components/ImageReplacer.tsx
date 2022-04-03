import { h } from 'preact';
import Image from './Image';

const ImageReplacer = (props: {resizedImageUrls: string[], touchHandler: (imgIndex: number) => Promise<void>}) => {
  return (
    <div class="grid grid-cols-3 xl:gap-6 md:gap-4 gap-2 justify-around">
      {props.resizedImageUrls.map((src: string, idx: number) => (
        // <div class="mx-auto" key={i}><img src={x} data-key={i} onClick={touchHandler} /></div>
        <Image src={src} idx={idx} touchHandler={props.touchHandler} key={idx} />
      ))}
    </div>
  );
};

export default ImageReplacer;
