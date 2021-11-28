import { h, render } from 'preact';
import App from './App';

const root = document.getElementById('root');

if (root != null) {
  render(<App />, root);
}
