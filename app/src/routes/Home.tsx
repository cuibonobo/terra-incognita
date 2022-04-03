import { h } from 'preact';
import { Link } from 'react-router-dom';
import { Artwork } from '../components';

const Home = () => {
  return (
    <div class='mx-auto flex flex-col space-y-6'>
      <Artwork canvasClass='w-full' />
      <article class='prose'>
        <blockquote class="italic text-gray-500 quote">
          <p class="my-2 text-3xl">A sort of luminous, geometric, incandescent immensity.</p>
          <cite><span class="text-base">Jean Baudrillard</span></cite>
        </blockquote>
        <p><Link to='/about'>Terra Incognita 2.0</Link> is a digital interactive collage that invites viewers to collaborate to <Link to='/create'>create</Link> their own interactive image.</p>
      </article>
    </div>
  );
};

export default Home;
