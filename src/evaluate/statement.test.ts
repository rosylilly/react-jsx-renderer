import { ESTree } from 'meriyah';
import { Binding } from '../types';
import { EvaluateError } from './error';
import { evaluate } from './evaluate';
import { EvaluateOptions } from './options';

describe('Statement', () => {
  const binding: Binding = {
    name: 'rosylilly',
    object: {
      foo: 'foo',
      bar: 'bar',
    },
    Array,
    tag: (parts: string[]) => {
      return parts.join(' + ');
    },
    nop: (...args) => args,
  };

  const supported = (name: ESTree.Statement['type'], code: string, options: EvaluateOptions = {}, f?: (matcher: jest.Matchers<any>) => void) => {
    it(`should be supported:  ${name}`, () => {
      const e = expect(() => evaluate(`{${code}}`, { ...options, binding })[0]);
      f && f(e);
    });
  };

  const notSupported = (name: ESTree.Statement['type'], code: string, options: EvaluateOptions = {}) => {
    it(`should not be supported: ${name}`, () => {
      expect(() => evaluate(`{${code}}`, { ...options, binding })).toThrowError(EvaluateError);
    });
  };

  supported('BlockStatement', '{ 1 }');
  supported('BreakStatement', 'while(true) { break }');
  notSupported('ClassDeclaration', 'class Foo {}');
  // notSupported('ClassExpression', 'export default class {}', { meriyah: { module: true }});
  // supported('ContinueStatement', 'do { i++; i < 2; continue } while(i)')
  supported('DebuggerStatement', 'debugger');
  supported('DoWhileStatement', 'do { break } while(true)');
  supported('EmptyStatement', ';;;;;;;');
  // supported('ExportAllDeclaration', '; export default 1', { meriyah: { module: true, next: true, directives: true  }})
  // notSupported('ExportDefaultDeclaration', 'export default {};');
  // notSupported('ExportNamedDeclaration', '')
  supported('ExpressionStatement', '1');
  notSupported('ForInStatement', 'for (const i in [1,2,3]) {}');
  notSupported('ForOfStatement', 'for (const i of [1,2,3]) {}');
  notSupported('ForStatement', 'for (let i = 0; i < 3; i++) {}');
  notSupported('FunctionDeclaration', 'function f() { }');
  supported('IfStatement', 'if(true) { }');
  // supported('ImportDeclaration', 'import "mod";')
  notSupported('LabeledStatement', 'label: { foo() }');
  notSupported('ReturnStatement', '() => { return 1; }');
  supported('SwitchStatement', 'switch(1) { case 2: break }');
  supported('ThrowStatement', 'throw "test";', {}, (m) => m.toThrowError('test'));
  supported('TryStatement', 'try { foo(); }');
  notSupported('VariableDeclaration', 'const a = 1');
  supported('WhileStatement', 'while(1) { break; }');
  // notSupported('WithStatement', 'with(1) { foo() }');
});
