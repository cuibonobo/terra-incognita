import { h } from 'preact';
import { FullscreenPage } from '../layout';
import { Artwork } from '../components';
import { useEffect } from 'preact/hooks';
import { reloadIfOnline } from '../lib/api';

// Refresh the artwork page every hour
const RELOAD_TIMEOUT = 1 * 60 * 60;
const RELOAD_RETRIES = 24;

const ArtworkPage = () => {
  useEffect(() => {
    // Reload the artwork every hour if the API is online
    reloadIfOnline(RELOAD_TIMEOUT, RELOAD_RETRIES);
  }, []);

  // TODO: Remove the `w-full` class for the museum user
  return (
    <FullscreenPage>
      <Artwork canvasClass='w-full' />
    </FullscreenPage>
  );
};

export default ArtworkPage;
