import { h } from 'preact';
import { FullscreenPage } from '../layout';
import { Artwork } from '../components';

const ArtworkPage = () => {
  // TODO: Remove the `w-full` class for the museum user
  return (
    <FullscreenPage>
      <Artwork canvasClass='w-full' />
    </FullscreenPage>
  );
};

export default ArtworkPage;
