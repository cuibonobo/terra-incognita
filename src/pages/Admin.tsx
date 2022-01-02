import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getResizedImageUrls, getGridStyle } from '../lib/images';

const Admin = () => {
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      setResizedImages(await getResizedImageUrls())
    })();
  }, []);

  return (
    <div class="main imageGrid" style={getGridStyle()}>
      {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ""}
    </div>
  );
};

export default Admin;
