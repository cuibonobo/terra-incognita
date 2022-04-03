import { h, Fragment } from 'preact';
import Pic from 'url:../media/RonBio.jpg';

const BioRon = () => {
  return (
    <Fragment>
      <h3>Ron Saunders</h3>
      <article>
        <img class="w-full max-w-lg m-0" src={Pic} />
        <p><a href="https://ronlsaunders.com/" target='blank'>Ron</a> is a multidisciplinary artist based in Atlanta GA. After earning his MFA in Painting and Drawing at Ohio University, he has since exhibited and taught across North America, Asia, and Europe. He has participated in numerous artist residencies including The Windsong Project in Mangel Halto, Aruba, RaumaArs AIR in Rauma Finland, Popps Packing in Detroit Michigan, KunstDoc in South Korea, and Het Wilde Weten in Rotterdam Netherlands.</p>
        <p>Along with travel, collaborating across disciplines is central to his work. Through this process, he has worked with biomedical engineers in China, linguists at USC, and astrophysicists at CalTech. His work has been supported by a number of granting organizations that have furthered his mission to increase access to the arts. Ultimately, Ron finds joy in the theoretical aspects of contemporary art in tandem with material explorations leading to the realization of an object, environment, or an event.</p>
      </article>
    </Fragment>
  );
};

export default BioRon;
