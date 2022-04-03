import { h } from 'preact';
import { ArtistStatement, BioJen, BioRon } from '../components';

const About = () => {
  return (
    <article class="prose max-w-3xl">
      <ArtistStatement />
      <hr />
      <BioRon />
      <BioJen />
    </article>
  );
};

export default About;
