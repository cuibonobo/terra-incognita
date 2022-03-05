import { h } from 'preact';
import { FullscreenPage } from '../layout';
import { ImageReplacer, Loading } from '../components';
import { useImageData } from '../hooks';

const Controls = () => {
  const {resizedImages} = useImageData();

  if (resizedImages === null) {
    return (
      <FullscreenPage>
        <Loading />
      </FullscreenPage>
    );
  }

  return (
    <FullscreenPage>
      <ImageReplacer resizedImageUrls={resizedImages} />
    </FullscreenPage>
  );
};

export default Controls;
