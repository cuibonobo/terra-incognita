import { h } from 'preact';
import { Base } from '../layout';
import { ImageReplacer } from '../components';
import { useImageData } from '../hooks';

const Controls = () => {
  const {resizedImages} = useImageData();

  if (resizedImages === null) {
    return (
      <Base>
        <div class='mx-auto'>
          Loading...
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <ImageReplacer resizedImageUrls={resizedImages} />
    </Base>
  );
};

export default Controls;
