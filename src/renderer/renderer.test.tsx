import { ReactElement } from 'react';
import renderer from 'react-test-renderer';
import { JSXRenderer } from '.';
import { JSXElementFilter, JSXFragmentFilter, JSXTextFilter } from './filter';
import { JSXFallbackComponent } from './renderer';

describe('JSX', () => {
  it('should render JSX', () => {
    const tree = renderer
      .create(
        <JSXRenderer
          code={`
      <h1>Hello, JSX World</h1>
      <p>This is paragraph.</p>
      <ul className="Hello">
        <li>first</li>
        <li>second</li>
      </ul>
      <>Fragment</>
    `}
          keyPrefix="html"
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should catch error of syntax', () => {
    const tree = renderer.create(<JSXRenderer disableKeyGeneration code={`<p ...`} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should catch error with number object', () => {
    const tree = renderer
      .create(
        <JSXRenderer
          disableKeyGeneration
          code={`<p>{raise()}</p><p />`}
          binding={{
            raise: () => {
              throw 1;
            },
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should catch error with object', () => {
    const tree = renderer
      .create(
        <JSXRenderer
          disableKeyGeneration
          code={`<p>{raise()}</p>`}
          binding={{
            raise: () => {
              throw { foo: 1 };
            },
          }}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  const elementFilters: JSXElementFilter[] = [(e) => (e.component === 'link' ? undefined : e), (e) => (e.component === 'script' ? undefined : e)];
  const fragmentFilters: JSXFragmentFilter[] = [
    (fragment) => {
      return fragment.children[0] === 'delete' ? undefined : fragment;
    },
  ];
  const textFilters: JSXTextFilter[] = [(text) => (text === 'ban' ? undefined : text)];
  const fallback: JSXFallbackComponent = ({ error }) => <div>{error.message} is raised</div>;
  const test = (code: string, expected: ReactElement) => {
    it(`should render ${code}`, () => {
      const actual = renderer
        .create(
          <JSXRenderer
            code={code}
            binding={{
              exception() {
                throw new Error('Hello');
              },
            }}
            elementFilters={elementFilters}
            fragmentFilters={fragmentFilters}
            textFilters={textFilters}
            fallbackComponent={fallback}
            disableSearchCompontsByBinding
            disableUnknownHTMLElement
          />,
        )
        .toJSON();
      expect(actual).toStrictEqual(renderer.create(expected).toJSON());
    });
  };

  test('', <></>);
  test('<p>Hoge</p>', <p>Hoge</p>);
  test('<p>{true}</p>', <p>{true}</p>);
  test('<p>{null}</p>', <p>{null}</p>);
  test('<p>{undefined}</p>', <p>{undefined}</p>);
  test(
    '<p><>frag</></p>',
    <p>
      <>frag</>
    </p>,
  );
  test('<p><>delete</></p>', <p></p>);
  test('<p><script src="./index.js" /></p>', <p></p>);
  test('<p><link href="./index" /></p>', <p></p>);
  test('<p><unknown>this is removed</unknown>element</p>', <p>element</p>);
  test(
    '<p><b>ban</b>word</p>',
    <p>
      <b />
      word
    </p>,
  );
  test('<p>{exception()}</p>', <div>{'Hello'} is raised</div>);
});
