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
        <p>Terra Incognita 2.0 is a digital interactive collage that invites viewers to collaborate to generate/build/create their own landscape.</p>
        <p>To learn more about the piece, visit the <Link to='/about'>about</Link> page. To collaborate with others on the landscape, visit the <Link to='/create'>create</Link> page. To recreate the museum experience, visit <Link to='/artwork'>this page</Link> to see the artwork in fullscreen and scan this <Link to='/qrcode'>this QR code</Link> with a mobile device.</p>
      </article>
    </div>
  );
};

export default Home;
