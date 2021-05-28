import 'bulma/bulma.sass';
import { ChangeEventHandler, FC, useCallback, useState } from 'react';
import { render } from 'react-dom';
import { evaluateJSX, JSXElementFilter, JSXRenderer, JSXRendererProps } from '../src';

const Star: FC = ({ children }) => {
  return <p>***{children}***</p>;
};

const exampleHTML = `<h1>Hello, World</h1>
<p>Hi, I'm <b style={{ color: 'red' }}>Sho Kusano</b>.</p>
<video controls src="https://samplelib.com/lib/download/mp4/sample-5s.mp4"></video>
<p>1 + 1 = {1 + 1}</p>
<Star>キラキラ</Star>
<p>Now: {Date.now()}</p>
<unknown>unknown element</unknown>

<h2>XSS Test</h2>
<p>Look your console logs</p>
{1..constructor.constructor('console.log("XSS Now: " + Date.now())')()}
`;

const exampleBinding = {
  name: 'rosylilly',
  library: '@hammerkit/jsx',
  array: [1, 2, 3],
  object: { a: 1, b: 2 },
  number: 128,
  string: 'string',
  boolean: true,
  Date,
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

const defaultOptions: Omit<JSXRendererProps, 'code' | 'nodes'> = {
  disableUnknownHTMLElement: false,
  disableCall: false,
  disableNew: false,
  disableKeyGeneration: false,
};

const App = () => {
  const [_, ticker] = useState(0);
  const [options, updateOptions] = useState(defaultOptions);
  const [state, update] = useState({ jsx: exampleHTML });

  const onChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      update((s) => ({ ...s, jsx: e.target.value }));
    },
    [update],
  );
  const fullOptions = {
    binding: exampleBinding,
    components: exampleComponents,
    elementFilters: exampleFilters,
    ...options,
  };

  const nodes = evaluateJSX(state.jsx, fullOptions);
  const json = JSON.stringify(nodes, null, 2);

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
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label className="label" htmlFor="code">
                  JSX Code
                </label>
                <div className="control">
                  <textarea name="code" className="textarea" rows={30} defaultValue={state.jsx} onChange={onChange} />
                </div>
              </div>

              <div className="field">
                <label className="label">Options</label>
                {Object.keys(options).map((option) => (
                  <div className="control" key={option}>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        defaultChecked={options[option]}
                        onChange={(e) => {
                          updateOptions((opts) => {
                            const update = {};
                            update[option] = e.target.checked;
                            return { ...opts, ...update };
                          });
                        }}
                      />
                      {` ${option}`}
                    </label>
                  </div>
                ))}
              </div>

              <div className="field">
                <div className="control">
                  <button
                    className="button is-info is-fullwidth"
                    onClick={(e) => {
                      e.preventDefault();
                      ticker((t) => t + 1);
                    }}
                  >
                    Redraw
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="column">
            <h2 className="title">Preview</h2>
            <div className="box content">
              <JSXRenderer nodes={nodes} {...fullOptions} />
            </div>
            <h2 className="subtitle">Preview JSON</h2>
            <pre className="box">
              <code>{json}</code>
            </pre>
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
