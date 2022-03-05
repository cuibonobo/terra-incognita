import { h } from 'preact';
import { Artwork, Loading } from '../components';

const Home = () => {
  return (
    <div class='mx-auto flex flex-col'>
      <Artwork canvasClass='w-full' />
    </div>
  );
};

export default Home;
