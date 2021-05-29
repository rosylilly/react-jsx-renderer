import { ReactElement } from 'react';
import renderer from 'react-test-renderer';
import { JSXRenderer } from '.';
import { JSXElementFilter, JSXFragmentFilter, JSXTextFilter } from './filter';
import { JSXFallbackComponent } from './renderer';

describe('JSXRenderer', () => {
  const mockConsoleError = jest.spyOn(global.console, 'error').mockImplementation();
  const mockConsoleGroup = jest.spyOn(global.console, 'group').mockImplementation();
  const mockConsoleGroupEnd = jest.spyOn(global.console, 'groupEnd').mockImplementation();
  const mockConsoleTime = jest.spyOn(global.console, 'time').mockImplementation();
  const mockConsoleTimeEnd = jest.spyOn(global.console, 'timeEnd').mockImplementation();

  afterEach(() => {
    mockConsoleError.mockClear();
    mockConsoleGroup.mockClear();
    mockConsoleGroupEnd.mockClear();
    mockConsoleTime.mockClear();
    mockConsoleTimeEnd.mockClear();
  });

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

  it('should call console.error on debug mode', () => {
    const tree = renderer.create(<JSXRenderer code="<span>{foo()}</span>" debug />).toJSON();
    expect(tree).toMatchSnapshot();

    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    expect(mockConsoleGroup).toHaveBeenCalledTimes(1);
    expect(mockConsoleGroupEnd).toHaveBeenCalledTimes(1);
    expect(mockConsoleTime).toHaveBeenCalledTimes(2);
    expect(mockConsoleTimeEnd).toHaveBeenCalledTimes(2);
  });

  it('should call console.group on debug mode', () => {
    const tree = renderer.create(<JSXRenderer code="<p>{1}</p>" debug />).toJSON();
    expect(tree).toMatchSnapshot();

    expect(mockConsoleGroup).toHaveBeenCalledTimes(1);
    expect(mockConsoleGroupEnd).toHaveBeenCalledTimes(1);
    expect(mockConsoleTime).toHaveBeenCalledTimes(2);
    expect(mockConsoleTimeEnd).toHaveBeenCalledTimes(2);
  });

  it('should call refNodes with node list', () => {
    const refNodes = jest.fn(() => {});
    const { act } = renderer;
    act(() => {
      renderer.create(<JSXRenderer code="{1} is 1" refNodes={refNodes} />).toJSON();
    });

    expect(refNodes).toBeCalledWith([1, ' is 1']);
  });

  it('should call Fallback Component on parse error', () => {
    const fallbackComponent = jest.fn(({ error }) => <>{error.message}</>);
    const tree = renderer.create(<JSXRenderer code="{notFound()}" fallbackComponent={fallbackComponent} />).toJSON();
    expect(tree).toMatchSnapshot();

    expect(fallbackComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        code: '{notFound()}',
        fallbackComponent,
        error: expect.any(Error),
      }),
      {},
    );
  });
});
