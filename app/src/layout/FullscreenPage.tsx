import { h, ComponentChildren } from 'preact';

const FullscreenPage = (props: { children: ComponentChildren }) => {
  return <main class="w-full">{props.children}</main>;
};

export default FullscreenPage;
