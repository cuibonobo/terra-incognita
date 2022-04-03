import { h } from 'preact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from './components'
import { ContainerRouter } from './layout';
import { About, Create, Error, Home, QRCode } from './routes';
import { ArtworkPage, ControlsPage } from './pages';

const App = () => {
  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/" element={<ContainerRouter />}>
            <Route index element={<Home />} />
            <Route path="create" element={<Create />} />
            <Route path="about" element={<About />} />
            <Route path="qrcode" element={<QRCode />} />
            <Route path="*" element={<Error />} />
          </Route>
          <Route path="/artwork" element={<ArtworkPage />} />
          <Route path="/controls" element={<ControlsPage />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
