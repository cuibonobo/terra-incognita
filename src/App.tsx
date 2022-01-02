import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Admin, Artwork } from './pages';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Artwork />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
