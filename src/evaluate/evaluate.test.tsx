import { evaluateJSX } from './evaluate';
import { Binding, ComponentsBinding } from '../types/binding';
import { FC } from 'react';

describe('evaluateJSX', () => {
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

  test('hello', ['hello']);
  test('{}', [undefined]);
  test('{1}', [1]);
  test('<hr />', [{ type: 'element', component: 'hr', properties: { key: '1' }, children: [] }]);
  test('<p foo={string}>test</p>', [{ type: 'element', component: 'p', properties: { key: '1', foo: 'string' }, children: ['test'] }]);
  test('{...[1, 2, 3]}', [{ type: 'fragment', properties: { key: '1' }, children: [1, 2, 3] }]);
  test('{{ a: 1 }}', [{ a: 1 }]);

  test('<xs:test>test</xs:test>', [{ type: 'element', component: 'xs:test', properties: { key: '1' }, children: ['test'] }]);
  test('<A>test</A>', [{ type: 'element', component: ComponentA, properties: { key: '1' }, children: ['test'] }]);
  test('<components.A>test</components.A>', [{ type: 'element', component: ComponentA, properties: { key: '1' }, children: ['test'] }]);
});
