import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { About, Artwork, Controls, Create, Error, Home } from './pages';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/about" element={<About />} />
        <Route path="/controls" element={<Controls />} />
        <Route path="/artwork" element={<Artwork />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
};

export default App;
