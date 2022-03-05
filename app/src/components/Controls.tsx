import { h } from 'preact';
import { ImageReplacer, Loading } from '../components';
import { useImageData } from '../hooks';

const Controls = () => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (resizedImages === null || meta === null || numImagesSqrt === null || imgSquareSize === null) {
    return (
      <Loading />
    );
  }

  return (
    <div>
      <div>
        Number of images
      </div>
      <div>
        Image square size
      </div>
      <ImageReplacer resizedImageUrls={resizedImages} touchHandler={async (x)=> {console.log(`${x} touched!`)}} />
    </div>
  );
};

export default Controls;
