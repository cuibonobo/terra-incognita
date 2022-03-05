import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContainerRouter } from './layout';
import { About, Create, Error, Home } from './routes';
import { ArtworkPage, ControlsPage } from './pages';

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
        <Route path="/artwork" element={<ArtworkPage />} />
        <Route path="/controls" element={<ControlsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
