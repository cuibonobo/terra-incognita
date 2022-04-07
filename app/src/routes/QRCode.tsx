import { h } from 'preact';
import { Link } from 'react-router-dom';
import TerraQRCode from 'url:../media/TerraQRCode.png';

const QRCode = () => {
  return (
    <article class="prose max-w-lg">
      <p>Scan this QR code on your mobile device to be taken to the controls page. Then visit <Link to='/artwork'>this page</Link> to see the artwork in fullscreen.</p>
      <img class="w-full h-full mt-2 border-2 border-black" src={TerraQRCode} alt="QR code for accessing the artwork controls on a mobile phone" />
    </article>
  );
};

export default QRCode;
