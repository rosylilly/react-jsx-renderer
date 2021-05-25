import { JSXRenderer } from '../src';
import { render } from 'react-dom';
import { ChangeEventHandler, FC, useCallback, useState } from 'react';
import { JSXElement } from '../src/evaluator';

const bulma = document.createElement('link');
bulma.setAttribute('rel', 'stylesheet');
bulma.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bulma@0.9.2/css/bulma.min.css');
document.head.appendChild(bulma);

const Star: FC = ({ children }) => {
  return <p>***{children}***</p>
}

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
}

const exampleComponents = {
  Star,
}

const exampleFilters = [
  (element: JSXElement) => {
    if (element.component === 'a') {
      const { props, ...other } = element;
      if (props.href) {
        props.href = 'だ〜め♥'
      }
      return { props, ...other }
    } else {
      return element;
    }
  }
]

const App = () => {
  const [state, update] = useState({ jsx: exampleHTML });

  const onChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    update((s) => ({ ...s, jsx: e.target.value }))
  }, [update])

  return (
    <div className='container section'>
      <div className='columns'>
        <div className='column'>
          <div className='box content'>
            <JSXRenderer code={state.jsx} binding={exampleBinding} components={exampleComponents} filters={exampleFilters} />
          </div>
        </div>
        <div className='column'>
          <textarea className='textarea' rows={30} defaultValue={state.jsx}  onChange={onChange} />
        </div>
      </div>
    </div>
  )
}

const main = () => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  render(<App />, root);
}

export default main();
