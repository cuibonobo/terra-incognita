import { h, Fragment } from 'preact';
import { NavLink, Outlet } from 'react-router-dom';

const ContainerRouter = () => {
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
        <Outlet />
      </main>
      <footer id="footer" class="container text-center mx-auto text-sm text-gray-500"></footer>
    </Fragment>
  );
};

export default ContainerRouter;
