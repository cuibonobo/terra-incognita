import { h } from 'preact';
import { Base } from '../layout';

const Error = () => {
  return (
    <Base>
      <article class="prose">
        <h2>Not Found!</h2>
        <p>I'm not sure where you wanted to go, but the navigation bar above should get you straightened out.</p>
      </article>
    </Base>
  );
};

export default Error;
