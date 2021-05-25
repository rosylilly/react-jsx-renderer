import renderer from 'react-test-renderer';
import { JSXRenderer } from './renderer';

describe('JSX', () => {
  it('should render JSX', () => {
    const tree = renderer.create(<JSXRenderer code={`
      <h1>Hello, JSX World</h1>
      <p>This is paragraph.</p>
      <ul className="Hello">
        <li>first</li>
        <li>second</li>
      </ul>
      <>Fragment</>
    `} />).toJSON();
    expect(tree).toMatchSnapshot();
  })

  it('should catch error syntax error', () => {
    const tree = renderer.create(<JSXRenderer code={`<p ...`} />).toJSON();
    expect(tree).toMatchSnapshot();
  })

  it('should catch error with number object', () => {
    const tree = renderer.create(<JSXRenderer code={`<p>{raise()}</p>`} binding={{ raise: () => { throw 1; }}} />).toJSON();
    expect(tree).toMatchSnapshot();
  })

  it('should catch error with object', () => {
    const tree = renderer.create(<JSXRenderer code={`<p>{raise()}</p>`} binding={{ raise: () => { throw { foo: 1 }; }}} />).toJSON();
    expect(tree).toMatchSnapshot();
  })
})
