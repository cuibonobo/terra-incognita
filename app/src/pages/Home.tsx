import { h } from 'preact';
import { useImageData } from '../hooks';
import { Base } from '../layout';
import { Canvas } from '../components';

const Home = () => {
  const {resizedImages, meta, numImagesSqrt, imgSquareSize} = useImageData();

  if (meta === null || numImagesSqrt === null || resizedImages === null || imgSquareSize === null) {
    return (
      <Base>
        <div class='mx-auto'>
          Loading...
        </div>
      </Base>
    );
  }
  return (
    <Base>
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
    </Base>
  );
};

export default Home;
