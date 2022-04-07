import { h, Fragment } from 'preact';
import { NavLink, Outlet } from 'react-router-dom';
import { DataInitializer, Footer } from '../components';
import TerraLogo from 'url:../icons/TerraLogo-96.png';

const ContainerRouter = () => {
  return (
    <Fragment>
      <header
        id="top-bar"
        class="container flex flex-row mx-auto my-4 space-x-4 items-center"
      >
        <img style={{width: '35px', height: '35px'}} src={TerraLogo} alt="Terra Incognita 2.0 logo" />
        <nav class="space-x-4">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main id="main" class="container bg-white mx-auto">
        <DataInitializer><Outlet /></DataInitializer>
      </main>
      <Footer />
    </Fragment>
  );
};

export default ContainerRouter;
