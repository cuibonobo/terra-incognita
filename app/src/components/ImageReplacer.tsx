import { h } from 'preact';

const ImageReplacer = (props: {resizedImageUrls: string[]}) => {
  return (
    <div class="grid grid-cols-3 gap-4 justify-around">
      {props.resizedImageUrls.map(x => <div class="mx-auto"><img src={x} /></div>)}
    </div>
  );
};

export default ImageReplacer;
