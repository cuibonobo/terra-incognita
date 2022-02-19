import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getResizedImageUrls, getGridStyle, getImageResizeOpts } from '../lib/images';
import { Meta, getMeta, getNumImagesSqrt } from '../lib/api';

const Admin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [numImagesSqrt, setNumImagesSqrt] = useState<number | null>(null);
  const [resizedImages, setResizedImages] = useState<string[] | null>(null);

  const loadData = async () => {
    try {
      setMeta(await getMeta());
      setNumImagesSqrt(await getNumImagesSqrt());
      setIsLoading(false);
    } catch(e) {
      setErrors([...errors, `${e}`]);
    }
  };

  const loadImages = async () => {
    if (meta === null || numImagesSqrt === null) {
      return;
    }
    const imgResizeOpts = getImageResizeOpts(meta.imgWidth, meta.imgHeight, numImagesSqrt);
    setResizedImages(await getResizedImageUrls(numImagesSqrt, imgResizeOpts));
  };

  useEffect(() => {
    if (isLoading) {
      loadData();
      return;
    }
    loadImages();
  }, [isLoading, errors]);

  if (errors.length > 1) {
    return errors.map((error:string) => <p>{error}</p>);
  }

  if (meta === null) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div class='main imageGrid' style={getGridStyle(meta.imgWidth, meta.imgHeight)}>
      {resizedImages ? resizedImages.map(x => <div><img src={x} /></div>) : ''}
    </div>
  );
};

export default Admin;
