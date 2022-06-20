import { ESTree } from 'meriyah';
import { Binding } from '../types';
import { JSXEvaluateError } from './error';
import { evaluateJSX } from './evaluate';
import { AnyFunction, EvaluateOptions, ParseOptions } from './options';

describe('Expression', () => {
  const binding: Binding = {
    name: 'rosylilly',
    object: {
      foo: 'foo',
      bar: 'bar',
    },
    Array,
    Object,
    JSON,
    tag: (parts: string[]) => {
      return parts.join(' + ');
    },
    nop: (...args) => args,
  };

  const supported = (name: ESTree.Expression['type'], code: string, result: any, options: ParseOptions & EvaluateOptions = {}) => {
    it(`should be supported:  ${name}`, () => {
      expect(evaluateJSX(`{${code}}`, { ...options, binding })[0]).toStrictEqual(result);
    });
  };

  const notSupported = (name: ESTree.Expression['type'], code: string, options: ParseOptions & EvaluateOptions = {}) => {
    it(`should not be supported: ${name}`, () => {
      expect(() => evaluateJSX(`{${code}}`, { ...options, binding })).toThrowError(JSXEvaluateError);
    });
  };

  supported('ArrayExpression', '[1, 2, 3, , 5]', [1, 2, 3, null, 5]);
  // supported('ArrayPattern')
  // supported('ArrowFunctionExpression', '() => {}', Function);
  supported('AssignmentExpression', 'a += 1', NaN);
  // notSupported('AwaitExpression', 'await promise()')
  supported('BinaryExpression', '1 + 1', 2);
  supported('CallExpression', '[1,2].join("-")', '1-2');
  supported('ChainExpression', 'test?.foo', undefined);
  supported('ChainExpression', 'test?.()', undefined);
  // notSupported('ClassDeclaration', 'class {}');
  // supported('ClassExpression', 'class {}');
  supported('ConditionalExpression', 'true ? false ? 1 : 2 : 3', 2);
  // supported('FunctionExpression', 'function() { }');
  supported('Identifier', 'name', 'rosylilly');
  // notSupported('Import', 'import test as "test";');
  notSupported('ImportExpression', 'import("test")');
  supported('JSXElement', '<p>test</p>', { type: 'element', component: 'p', props: { key: '1' }, children: ['test'], loc: { column: 3, line: 1 } });
  supported('JSXFragment', '<>test</>', { type: 'fragment', props: { key: '1' }, children: ['test'], loc: { column: 3, line: 1 } });
  supported('JSXSpreadChild', '...[1, 2, 3]', { children: [1, 2, 3], props: { key: '1' }, type: 'fragment', loc: undefined });
  supported('Literal', '1.45', 1.45);
  supported('LogicalExpression', 'true && false || true', true);
  supported('MemberExpression', 'object.foo', 'foo');
  notSupported('MetaProperty', 'import.meta', { meriyah: { module: true } });
  supported('NewExpression', 'new Array()', []);
  supported('ObjectExpression', '{ a: 1 }', { a: 1 });
  // supported('RestElement')
  // supported('SequenceExpression')
  supported('SpreadElement', 'nop({ ...object })', [binding.object]);
  // notSupported('Super', '() => { super() }()')
  supported('TaggedTemplateExpression', 'tag`this ${is} a ${pen}`', 'this  +  a  + ');
  supported('TemplateLiteral', '`${object.foo} san`', 'foo san');
  notSupported('ThisExpression', 'this.name');
  supported('UnaryExpression', '~7.8', -8);
  supported('UpdateExpression', 'i++', NaN);
  // notSupported('YieldExpression', 'yield index')

  it('should raise exception undefined identifier', () => {
    expect(() => {
      evaluateJSX('{test}', { raiseReferenceError: true });
    }).toThrowError('test is not defined');

    expect(() => {
      evaluateJSX('{undefined}', { raiseReferenceError: true });
    }).not.toThrowError('undefined is not defined');

    expect(() => {
      evaluateJSX('{null}', { raiseReferenceError: true });
    }).not.toThrowError('null is not defined');
  });

  it('should evaluate binary expression', () => {
    const sample = {
      '+': 3 + 7,
      '-': 3 - 7,
      '/': 3 / 7,
      '*': 3 * 7,
      '%': 3 % 7,
      '**': 3 ** 7,
      '<': 3 < 7,
      '>': 3 > 7,
      '<=': 3 <= 7,
      '>=': 3 >= 7,
      '==': false, // 3 == 7,
      '!=': true, // 3 != 7,
      '===': false, // 3 === 7,
      '!==': true, // 3 !== 7,
      '<<': 3 << 7,
      '>>': 3 >> 7,
      '>>>': 3 >>> 7,
      '&': 3 & 7,
      '|': 3 | 7,
      '^': 3 ^ 7,
      '&&': 3 && 7,
      '||': 3 || 7,
      '??': 3 ?? 7,
    };
    for (const [op, val] of Object.entries(sample)) {
      expect(evaluateJSX(`{3 ${op} 7}`)).toStrictEqual([val]);
    }

    expect(evaluateJSX('{"stringify" in JSON}', { binding })).toStrictEqual([true]);
    expect(evaluateJSX('{object instanceof Object}', { binding })).toStrictEqual([true]);
  });

  it('should evaluate unary expression', () => {
    const sample = {
      '+': +7,
      '-': -7,
      '~': ~7,
      '!': !7,
      void: void 7,
    };
    for (const [op, val] of Object.entries(sample)) {
      expect(evaluateJSX(`{${op}(7)}`, { binding })).toStrictEqual([val]);
    }

    expect(evaluateJSX('{typeof "hello"}')).toStrictEqual(['string']);
  });

  it('should evaluate arrow function', () => {
    const func = evaluateJSX('{() => {}}')[0];
    expect(func).toBeInstanceOf(Function);

    const expRet = evaluateJSX('{(() => 100)()}')[0];
    expect(expRet).toStrictEqual(100);

    const argRet = evaluateJSX('{((a) => a)(200)}')[0];
    expect(argRet).toStrictEqual(200);

    const zeroRet = evaluateJSX('{((a) => a)(0)}')[0];
    expect(zeroRet).toStrictEqual(0);

    const undefinedRet = evaluateJSX('{((a) => a)()}')[0];
    expect(undefinedRet).toStrictEqual(undefined);

    const stmtRet = evaluateJSX('{((a) => { return a + 100 })(200)}')[0];
    expect(stmtRet).toStrictEqual(300);

    const defaultParamRet = evaluateJSX('{((a, b = 2) => { return a + b + 100 })(200)}')[0];
    expect(defaultParamRet).toStrictEqual(302);
  });

  it('should evaluate function', () => {
    const func = evaluateJSX('{function() {}}')[0];
    expect(func).toBeInstanceOf(Function);

    const expRet = evaluateJSX('{(function() { return 100 })()}')[0];
    expect(expRet).toStrictEqual(100);

    const zeroRet = evaluateJSX('{(function (a) { return a })(0)}')[0];
    expect(zeroRet).toStrictEqual(0);

    const undefinedRet = evaluateJSX('{(function (a) { return a })()}')[0];
    expect(undefinedRet).toStrictEqual(undefined);

    const argRet = evaluateJSX('{(function (a) { return a })(200)}')[0];
    expect(argRet).toStrictEqual(200);

    const stmtRet = evaluateJSX('{(function (a) { return a + 100 })(200)}')[0];
    expect(stmtRet).toStrictEqual(300);

    const defaultParamRet = evaluateJSX('{(function (a, b = 2) { return a + b + 100 })(200)}')[0];
    expect(defaultParamRet).toStrictEqual(302);
  });

  it('should be activatable disable call', () => {
    expect(evaluateJSX('{(() => 1)()}', { disableCall: true })[0]).toBeUndefined();
    expect(evaluateJSX('{"hello".toString()}', { disableCall: true })[0]).toBeUndefined();
    expect(evaluateJSX('{new Date()}', { disableCall: true })[0]).toBeUndefined();
  });

  it('should avoid function call with allowed list', () => {
    const allowedFunctions: AnyFunction[] = [''.toUpperCase];
    expect(evaluateJSX('{"Hello"}', { allowedFunctions })[0]).toStrictEqual('Hello');
    expect(evaluateJSX('{"Hello".toUpperCase()}', { allowedFunctions })[0]).toStrictEqual('HELLO');
    expect(() => evaluateJSX('{"Hello".toLowerCase()}', { allowedFunctions })[0]).toThrowError('toLowerCase is not allowed function');
  });

  it('should avoid function call with denied list', () => {
    const deniedFunctions: AnyFunction[] = [''.toLowerCase];
    expect(evaluateJSX('{"Hello"}', { deniedFunctions })[0]).toStrictEqual('Hello');
    expect(evaluateJSX('{"Hello".toUpperCase()}', { deniedFunctions })[0]).toStrictEqual('HELLO');
    expect(() => evaluateJSX('{"Hello".toLowerCase()}', { deniedFunctions })[0]).toThrowError('toLowerCase is not allowed function');
  });

  it('should automated allow function', () => {
    const allowedFunctions = [String.prototype.toLowerCase, Array.prototype.map];
    expect(evaluateJSX('{"Hello".toLowerCase()}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toStrictEqual('hello');
    expect(() => evaluateJSX('{"Hello".toUpperCase()}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toThrowError('toUpperCase is not allowed function');
    expect(evaluateJSX('{(() => "Hello")()}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toStrictEqual('Hello');
    expect(() => evaluateJSX('{(() => "Hello")()}', { allowedFunctions, allowUserDefinedFunction: false })[0]).toThrowError('f is not allowed function');
    expect(evaluateJSX('{(function() { return "Hello" })()}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toStrictEqual('Hello');
    expect(() => evaluateJSX('{(function() { return "Hello" })()}', { allowedFunctions, allowUserDefinedFunction: false })[0]).toThrowError('f is not allowed function');
    expect(evaluateJSX('{["A", "B", "C"].map((char) => char.toLowerCase())}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toStrictEqual(['a', 'b', 'c']);
    expect(evaluateJSX('{["A", "B", "C"].map(function(char) { return char.toLowerCase() })}', { allowedFunctions, allowUserDefinedFunction: true })[0]).toStrictEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('should valid template literal', () => {
    expect(evaluateJSX('{((a, b) => `template: ${b} and ${a}`)("Hello", "World")}')[0]).toStrictEqual('template: World and Hello');
  });
});
