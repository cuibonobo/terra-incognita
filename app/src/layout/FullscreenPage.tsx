import { h, ComponentChildren } from 'preact';
import { DataInitializer } from '../components';

const FullscreenPage = (props: { children: ComponentChildren }) => {
  return <main class="w-full relative"><DataInitializer>{props.children}</DataInitializer></main>;
};

export default FullscreenPage;
