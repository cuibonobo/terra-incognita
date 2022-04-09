import { h } from 'preact';
import { FullscreenPage } from '../layout';
import { Controls } from '../components';
import { Link } from 'react-router-dom';
import { useState } from 'preact/hooks';

const ControlsPage = () => {
  const [showAbout, setShowAbout] = useState(false);

  const toggleModal = () => {
    setShowAbout(!showAbout);
  };

  return (
    <FullscreenPage>
      <div class={`fixed top-0 left-0 w-full h-full z-20 ${showAbout ? '' : 'hidden'}`}>
        <div class="relative md:w-4/5 w-full h-screen max-w-3xl md:p-8 p-4 mx-auto">
          <div class="relative w-full h-content bg-white md:p-8 p-4 overflow-auto drop-shadow-md rounded z-30">
            <div title="Close" class={"absolute top-4 right-4 w-7 h-7 text-3xl leading-6 text-center align-middle text-white cursor-pointer bg-black"} onClick={toggleModal}>&#xd7;</div>
            <div class="prose">
              <h2>Terra Incognita 2.0</h2>
              <p>Terra Incognita 2.0 is a digital interactive collage that invites viewers to generate/build/create their own landscape. The work is a collaboration between <a href="https://ronlsaunders.com/" target='blank'>Ron Saunders</a> and <a href="https://cuibonobo.com" target='blank'>cuibonobo</a> to algorithmically generate a visual corpus of Instagram images tagged with the <code>#landscape</code> hashtag.</p>
              <p>To learn more, visit the its <Link to="/">homepage</Link>.</p>
            </div>
          </div>
        </div>
        <div class="absolute w-full h-full top-0 left-0 bg-gray-200 opacity-80" onClick={toggleModal}>&nbsp;</div>
      </div>
      <div title="More Information" class={"fixed bottom-4 right-4 w-8 h-8 z-10 text-xl font-bold leading-7 text-center font-serif align-middle cursor-pointer text-white bg-sky-500 rounded-full border-2 border-sky-600 opacity-70 hover:opacity-100"} onClick={toggleModal}>i</div>
      <Controls />
    </FullscreenPage>
  );
};

export default ControlsPage;
