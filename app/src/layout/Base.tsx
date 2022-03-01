import { h, ComponentChildren, Fragment } from 'preact';
import { NavLink } from 'react-router-dom';

const baseTitle = 'Terra Incognita';

const ContainerApp = (props: { children: ComponentChildren }) => {
  return (
    <Fragment>
      <header
        id="top-bar"
        class="container justify-between md:flex-row mx-auto my-4"
      >
        <nav class="space-x-4">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main id="main" class="container bg-white mx-auto">
        {props.children}
      </main>
      <footer id="footer" class="container text-center mx-auto text-sm text-gray-500"></footer>
    </Fragment>
  );
};

const FullScreenApp = (props: { children: ComponentChildren }) => {
  return <main class="bg-white w-screen h-screen flex flex-row">{props.children}</main>;
};

const Base = (props: { title?: string; isFullScreen?: boolean; children: ComponentChildren }) => {
  if (props.title) {
    document.title = `${props.title} | ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
  return (
    <div id="base" class="w-screen h-screen flex flex-col">
      {props.isFullScreen ? (
        <FullScreenApp>{props.children}</FullScreenApp>
      ) : (
        <ContainerApp>{props.children}</ContainerApp>
      )}
    </div>
  );
};

export default Base;
