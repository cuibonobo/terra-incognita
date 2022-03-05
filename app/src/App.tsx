import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContainerRouter } from './layout';
import { About, Create, Error, Home } from './routes';
import { Artwork, Controls } from './pages';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ContainerRouter />}>
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Error />} />
        </Route>
        <Route path="/artwork" element={<Artwork />} />
        <Route path="/controls" element={<Controls />} />
      </Routes>
    </Router>
  );
};

export default App;
