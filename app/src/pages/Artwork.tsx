import { h } from 'preact';
import { FullscreenPage } from '../layout';
import { Artwork } from '../components';

const ArtworkPage = () => {
  return (
    <FullscreenPage>
      <Artwork canvasClass='w-full' />
    </FullscreenPage>
  );
};

export default ArtworkPage;
