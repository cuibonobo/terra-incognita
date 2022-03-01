import { h } from 'preact';

const ImageReplacer = (props: {resizedImageUrls: string[]}) => {
  return (
    <div class="grid grid-cols-3 w-full">
      {props.resizedImageUrls.map(x => <div><img src={x} /></div>)}
    </div>
  );
};

export default ImageReplacer;
