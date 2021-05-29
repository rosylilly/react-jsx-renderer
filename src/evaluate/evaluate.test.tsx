import { evaluate, evaluateJSX } from './evaluate';
import { Binding, ComponentsBinding } from '../types/binding';
import { FC } from 'react';

describe('evaluateJSX', () => {
  const mockConsoleTime = jest.spyOn(global.console, 'time').mockImplementation();
  const mockConsoleTimeEnd = jest.spyOn(global.console, 'timeEnd').mockImplementation();
  const ComponentA: FC = ({ children }) => <>{children}</>;
  const ComponentB: FC = ({ children }) => <>{children}</>;

  const components: ComponentsBinding = {
    A: ComponentA,
    B: ComponentB,
  };
  const binding: Binding = {
    string: 'string',
    number: 1,
    boolean: true,
    regexp: /.*/,
    undefined: undefined,
    null: null,
    array: [1, 2, 3],
    object: {
      member: 'object-member',
      properties: {
        member: 'properties-member',
      },
    },
    components,
  };

  const test = (code: string, results: any[]) => {
    it(`should evaluate ${code}`, () => {
      const actual = evaluateJSX(code, { binding, components });
      expect(actual).toStrictEqual(results);
    });
  };

  afterEach(() => {
    mockConsoleTime.mockClear();
    mockConsoleTimeEnd.mockClear();
  });

  test('hello', ['hello']);
  test('{}', [undefined]);
  test('{1}', [1]);
  test('<hr />', [{ type: 'element', component: 'hr', props: { key: '1' }, children: [], loc: undefined }]);
  test('<p foo={string}>test</p>', [{ type: 'element', component: 'p', props: { key: '1', foo: 'string' }, children: ['test'], loc: undefined }]);
  test('{...[1, 2, 3]}', [{ type: 'fragment', props: { key: '1' }, children: [1, 2, 3], loc: undefined }]);
  test('{{ a: 1 }}', [{ a: 1 }]);

  test('<xs:test>test</xs:test>', [{ type: 'element', component: 'xs:test', props: { key: '1' }, children: ['test'], loc: undefined }]);
  test('<A>test</A>', [{ type: 'element', component: ComponentA, props: { key: '1' }, children: ['test'], loc: undefined }]);
  test('<components.A>test</components.A>', [{ type: 'element', component: ComponentA, props: { key: '1' }, children: ['test'], loc: undefined }]);

  it('should call console.time on debug mode', () => {
    evaluate('const a = 1', { debug: true });

    expect(mockConsoleTime).toHaveBeenCalledTimes(2);
    expect(mockConsoleTimeEnd).toHaveBeenCalledTimes(2);
  });

  it('should call console.time on debug mode(JSX)', () => {
    evaluateJSX('<p>Hello</p>', { debug: true });

    expect(mockConsoleTime).toHaveBeenCalledTimes(2);
    expect(mockConsoleTimeEnd).toHaveBeenCalledTimes(2);
  });
});
