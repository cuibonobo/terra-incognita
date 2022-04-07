import { h, Fragment } from 'preact';
import Pic from 'url:../media/JenBio.jpg';

const BioJen = () => {
  return (
    <Fragment>
      <h3>cuibonobo</h3>
      <img class="w-full max-w-lg m-0" src={Pic} alt="Photo of Jen Garcia getting licked in the face by a dog" />
      <p><a href="https://cuibonobo.com" target='blank'>cuibonobo</a> (née Jen Garcia) is a Puerto Rican artist, engineer, and organizer. Her work sets out to amplify voices and connect disparate disciplines so that people can feel empowered and connected. As a result, she rarely works alone. Her skills in computer graphics, electronics, augmented reality, and other engineering fields have added life and reach to many artistic projects: gallery installations with rhythmic glow, murals that can dance, sculptures powered by the sun. cuibonobo&rsquo;s favorite moment is when someone asks, &ldquo;Is this possible?&rdquo; and she can say, &ldquo;Yes, and let me show you how.&rdquo;</p>
    </Fragment>
  );
};

export default BioJen;
