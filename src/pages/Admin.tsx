import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getResizedImageUrls, getGridStyle, getImageResizeOpts } from '../browserLib/images';
import api, { Meta } from '../browserLib/api';

const Admin = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  const initialize = async () => {
    if (meta === null) {
      const response: unknown = await api.get('/meta');
      setMeta(response as Meta);
      return;
    }
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, meta.numImagesSqrt);
    setResizedImages(await getResizedImageUrls(meta.numImagesSqrt, imgResizeOpts))
  };

  useEffect(() => {
    initialize();
  }, [meta]);

  if (meta === null) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div class="main imageGrid" style={getGridStyle(meta.imgWidth, meta.imgHeight)}>
      {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ""}
    </div>
  );
};

export default Admin;
