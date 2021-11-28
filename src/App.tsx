import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Artwork } from './pages';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Artwork />} />
      </Routes>
    </Router>
  );
};

export default App;
