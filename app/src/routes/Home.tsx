import { h } from 'preact';
import { useImageData } from '../hooks';
import { Canvas, Loading } from '../components';

const Home = () => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <Loading />
    );
  }
  return (
    <div class='mx-auto flex flex-col'>
      <Canvas
        class='w-full'
        images={resizedImages}
        width={meta.imgWidth}
        height={meta.imgHeight}
        splitSize={imgSquareSize}
        pixelSize={numImagesSqrt}
      />
    </div>
  );
};

export default Home;
