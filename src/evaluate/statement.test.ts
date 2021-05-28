import { ESTree } from 'meriyah';
import { Binding } from '../types';
import { EvaluateContext } from './context';
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
      const e = expect(() => evaluate(code, { ...options, binding }));
      f && f(e);
    });
  };

  const notSupported = (name: ESTree.Statement['type'], code: string, options: EvaluateOptions = {}) => {
    it(`should not be supported: ${name}`, () => {
      expect(() => evaluate(code, { ...options, binding })).toThrowError(EvaluateError);
    });
  };

  supported('BlockStatement', '{ 1 }');
  supported('BreakStatement', 'while(true) { break }');
  notSupported('ClassDeclaration', 'class Foo {}');
  // notSupported('ClassExpression', 'export default class {}', { meriyah: { module: true }});
  supported('ContinueStatement', 'let i = 0; while (i < 1) { i++; continue }');
  supported('DebuggerStatement', 'debugger');
  supported('DoWhileStatement', 'do { break } while(true)');
  supported('EmptyStatement', ';;;;;;;');
  notSupported('ExportAllDeclaration', 'export * from "mod";');
  supported('ExportDefaultDeclaration', 'export default {};');
  supported('ExportNamedDeclaration', 'export { a };');
  supported('ExpressionStatement', '1');
  supported('ForInStatement', 'for (const i in [1,2,3]) { break; }');
  supported('ForOfStatement', 'for (const i of [1,2,3]) { break; }');
  supported('ForStatement', 'for (let i = 0; i < 3; i++) { break; }');
  supported('FunctionDeclaration', 'function f() { }');
  supported('IfStatement', 'if(true) { }');
  supported('ImportDeclaration', 'import "mod";');
  notSupported('LabeledStatement', 'label: { foo() }');
  // supported('ReturnStatement', '() => { return 1; }');
  supported('SwitchStatement', 'switch(1) { case 2: break }');
  supported('ThrowStatement', 'throw "test";', {}, (m) => m.toThrowError('test'));
  supported('TryStatement', 'try { foo(); }');
  supported('VariableDeclaration', 'const a = 1');
  supported('WhileStatement', 'while(1) { break; }');
  // notSupported('WithStatement', 'with(1) { foo() }');

  it('should declare variable', () => {
    const check = (context: EvaluateContext, name: string, val: any) => {
      const attr = context.resolveIdentifier(name);
      expect(attr).toBeDefined();
      expect(attr.value).toStrictEqual(val);
    };

    const context = evaluate('const a = 1, { b, c: { d, ...e }, ...f } = { b: 2, c: { d: 3, e: 4 }, f: 5 }, [g, h, , i, ...j] = [6, 7, 8, 9, 10, 11]');
    check(context, 'a', 1);
    check(context, 'b', 2);
    check(context, 'd', 3);
    check(context, 'e', { e: 4 });
    check(context, 'f', { f: 5 });
    check(context, 'g', 6);
    check(context, 'h', 7);
    check(context, 'i', 9);
    check(context, 'j', [10, 11]);

    const withDefault = evaluate('const { a = 1 } = { b: 2 }');
    check(withDefault, 'a', 1);
  });

  it('should run for loop', () => {
    let counter = 0;
    const binding = {
      call() {
        counter++;
      },
    };

    const context = evaluate('for (let i = 0; i < 10; i++) { call(); if(i >= 9) { continue }; call(); }', { binding });
    expect(counter).toEqual(19);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should run for of loop', () => {
    const called = [];
    const binding = {
      call(arg: number) {
        called.push(arg);
      },
    };

    const context = evaluate('for (const num of [1, 2, 3]) { call(num) }', { binding });
    expect(called).toStrictEqual([1, 2, 3]);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should run for in loop', () => {
    const called = [];
    const binding = {
      call(arg: string) {
        called.push(arg);
      },
    };

    const context = evaluate('for (const num in [1, 2, 3]) { call(num) }', { binding });
    expect(called).toStrictEqual(['0', '1', '2']);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should run switch', () => {
    let counter = 0;
    const binding = {
      incr() {
        counter++;
      },
      decr() {
        counter--;
      },
    };
    const context = evaluate(
      `
    for(let i = 0; i < 3; i++) {
      switch (i) {
        case 0:
          incr();
        case 1:
          incr();
          break;
        case 2:
          decr();
      }
    }
    `,
      { binding },
    );
    expect(counter).toEqual(2);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should support export', () => {
    const context = evaluate(
      `
    const a = 1;
    export default 'def';
    export { a };
    export { a as b };
    export const c = 3;
    `,
      {},
    );
    expect(context.exports.default).toEqual('def');
    expect(context.exports.a).toEqual(1);
    expect(context.exports.b).toEqual(1);
    expect(context.exports.c).toEqual(3);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should support while', () => {
    let coutner = 0;
    const binding = {
      call() {
        return coutner++;
      },
    };
    const context = evaluate('let i = 0; while(i < 3 && call() >= 0) { call(); i++ }', { binding });

    expect(coutner).toEqual(6);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should support do while', () => {
    let coutner = 0;
    const binding = {
      call() {
        return coutner++;
      },
    };
    const context = evaluate('let i = 0; do { call(); i++ } while(i < 3 && call() > 0)', { binding });

    expect(coutner).toEqual(5);
    expect(context.stacks.length).toStrictEqual(2);
  });

  it('should support try catch finally', () => {
    let coutner = 0;
    let error: any = undefined;
    const binding = {
      call() {
        coutner++;
      },
      collectError(err: any) {
        error = err;
      },
    };

    const context = evaluate(
      `
      try {
        call();
        throw "test";
        call();
      } catch (err) {
        collectError(err);
      } finally {
        call();
      }
    `,
      { binding },
    );

    expect(coutner).toEqual(2);
    expect(error).toEqual('test');
    expect(context.stacks.length).toEqual(2);
  });

  it('should support function', () => {
    const binding = {
      console,
    };
    const context = evaluate(
      `
        let i = 0;

        function incr() {
          i++;
        }

        const decr = function() { i-- };

        incr();
        incr();
        decr();
        export { i };
      `,
      { binding },
    );

    expect(context.exports['i']).toEqual(1);
    expect(context.stacks.length).toEqual(2);
  });
});
