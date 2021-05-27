import 'bulma/bulma.sass';
import { ChangeEventHandler, FC, useCallback, useState } from 'react';
import { render } from 'react-dom';
import { JSXElementFilter, JSXRenderer } from '../src';

const Star: FC = ({ children }) => {
  return <p>***{children}***</p>;
};

const exampleHTML = `<h1>Hello, World</h1>
<p>Hi, I'm <b style={{ color: 'red' }}>Sho Kusano</b>.</p>
<video controls src="https://samplelib.com/lib/download/mp4/sample-5s.mp4"></video>
<p>1 + 1 = {1 + 1}</p>
<Star>キラキラ</Star>
`;

const exampleBinding = {
  name: 'rosylilly',
  library: '@hammerkit/jsx',
  array: [1, 2, 3],
  object: { a: 1, b: 2 },
  number: 128,
  string: 'string',
  boolean: true,
};

const exampleComponents = {
  Star,
};

const exampleFilters: JSXElementFilter[] = [
  (element) => {
    if (element.component === 'a') {
      const { props, ...other } = element;
      if (props.href) {
        props.href = 'だ〜め♥';
      }
      return { props: props, ...other };
    } else {
      return element;
    }
  },
];

const App = () => {
  const [state, update] = useState({ jsx: exampleHTML });

  const onChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      update((s) => ({ ...s, jsx: e.target.value }));
    },
    [update],
  );

  return (
    <>
      <div className="hero is-dark">
        <div className="hero-body">
          <div className="container">
            <div className="columns">
              <div className="column">
                <h1 className="title">React JSX Renderer</h1>
                <p className="subtitle">A React component for Rendering JSX</p>
              </div>
              <div className="column has-text-right">
                <p>
                  <a className="button is-medium is-white" href="https://github.com/rosylilly/react-jsx-renderer">
                    View on GitHub
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="columns section">
          <div className="column">
            <h2 className="title">JSX</h2>
            <textarea className="textarea" rows={30} defaultValue={state.jsx} onChange={onChange} />
          </div>
          <div className="column">
            <h2 className="title">Preview</h2>
            <div className="box content">
              <JSXRenderer code={state.jsx} binding={exampleBinding} components={exampleComponents} elementFilters={exampleFilters} />
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="content has-text-centered">
          <p>
            <a href="https://github.com/rosylilly/react-jsx-renderer/blob/main/example/index.tsx">Source code on GitHub</a>
          </p>
          <p>&copy; 2021 Sho Kusano</p>
        </div>
      </div>
    </>
  );
};

const main = () => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  render(<App />, root);
};

export default main();
