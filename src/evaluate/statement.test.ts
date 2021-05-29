import { ESTree } from 'meriyah';
import { Binding } from '../types';
import { JSXContext } from './context';
import { JSXEvaluateError } from './error';
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
      f ? f(e) : e.not.toThrow();
    });
  };

  const notSupported = (name: ESTree.Statement['type'], code: string, options: EvaluateOptions = {}) => {
    it(`should not be supported: ${name}`, () => {
      expect(() => evaluate(code, { ...options, binding })).toThrowError(JSXEvaluateError);
    });
  };

  supported('BlockStatement', '{ 1 }');
  supported('BreakStatement', 'for (;;) { break; }');
  supported('ClassDeclaration', 'class Foo {}');
  // notSupported('ClassExpression', 'export default class {}', { meriyah: { module: true }});
  supported('ContinueStatement', 'let i = 0; while (i < 1) { i++; continue }');
  supported('DebuggerStatement', 'debugger;');
  supported('DoWhileStatement', 'do { break; } while(true)');
  supported('EmptyStatement', ';;;;;;;');
  notSupported('ExportAllDeclaration', 'export * from "mod";');
  supported('ExportDefaultDeclaration', 'export default {};');
  supported('ExportNamedDeclaration', 'const a = 1; export { a };');
  supported('ExpressionStatement', '1 + 1;');
  supported('ForInStatement', 'for (const i in [1,2,3]) { break; }');
  supported('ForOfStatement', 'for (const i of [1,2,3]) { break; }');
  supported('ForStatement', 'for (let i = 0; i < 3; i++) { break; }');
  supported('FunctionDeclaration', 'function f() { }');
  supported('IfStatement', 'if(true) { }; if(false) { } else { }');
  notSupported('ImportDeclaration', 'import "mod";');
  supported('LabeledStatement', 'label: { 1 }');
  supported('ReturnStatement', '(() => { return 1; })()');
  supported('SwitchStatement', 'switch(1) { case 2: break }');
  supported('ThrowStatement', 'throw "test";', {}, (m) => m.toThrowError('test'));
  supported('TryStatement', 'try { foo(); } catch(e) { }');
  supported('VariableDeclaration', 'const a = 1');
  supported('WhileStatement', 'while(1) { break; }');
  // notSupported('WithStatement', 'with(1) { foo() }');

  it('should declare variable', () => {
    const check = (context: JSXContext, name: string, val: any) => {
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toStrictEqual(2);
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
    expect(context.stackSize).toEqual(2);
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
    expect(context.stackSize).toEqual(2);
  });

  it('should support label with continue', () => {
    const logs = [];
    const binding = {
      log(line: string) {
        logs.push(line);
      },
    };
    evaluate(
      `
        var i, j;

        loop1:
        for (i = 0; i < 3; i++) {
          loop2:
          for (j = 0; j < 3; j++) {
            if (i === 1 && j === 1) {
              continue loop1;
            }
            log('i = ' + i + ', j = ' + j);
          }
        }
      `,
      { binding },
    );

    expect(logs).toStrictEqual(['i = 0, j = 0', 'i = 0, j = 1', 'i = 0, j = 2', 'i = 1, j = 0', 'i = 2, j = 0', 'i = 2, j = 1', 'i = 2, j = 2']);
  });

  it('should support label with break', () => {
    const logs = [];
    const binding = {
      log(line: string) {
        logs.push(line);
      },
    };
    evaluate(
      `
        var i, j;

        loop1:
        for (i = 0; i < 3; i++) {
          loop2:
          for (j = 0; j < 3; j++) {
            if (i === 1 && j === 1) {
              break loop1;
            }
            log('i = ' + i + ', j = ' + j);
          }
        }
      `,
      { binding },
    );

    expect(logs).toStrictEqual(['i = 0, j = 0', 'i = 0, j = 1', 'i = 0, j = 2', 'i = 1, j = 0']);
  });

  it('should support complex jump', () => {
    const logs = [];
    const binding = {
      log(message: string) {
        logs.push(message);
      },
    };

    evaluate(
      `
        block: {
          let whileCount = 0;
          whileLabel: while (true) {
            whileCount++;
            log("while");

            switch (whileCount) {
              case 1:
                continue whileLabel;
              case 2:
                continue;
              case 3:
                break whileLabel;
            }
          }

          let doWhileCount = 0;
          doWhileLabel: do {
            doWhileCount++;
            log("do while");

            switch (doWhileCount) {
              case 1:
                continue doWhileLabel;
              case 2:
                continue;
              case 3:
                break doWhileLabel;
            }
          } while(true)

          forLabel: for (let forCount = 0; forCount < 4; forCount++) {
            log("for");

            switch (forCount) {
              case 0:
                continue forLabel;
              case 1:
                continue;
              case 2:
                break forLabel;
            }
          }

          forOf: for (const a of [1, 2, 3, 4]) {
            log("for of " + a);

            switch (a) {
              case 1:
                continue forOf;
              case 2:
                continue;
              case 3:
                break forOf;
            }
          }

          forIn: for (const a in [1, 2, 3, 4]) {
            log("for in " + a);

            switch (a) {
              case '0':
                continue forIn;
              case '1':
                continue;
              case '2':
                break forIn;
            }
          }
          break block;

          log("not reached");
        }
      `,
      { binding },
    );

    expect(logs).toStrictEqual([
      'while',
      'while',
      'while',
      'do while',
      'do while',
      'do while',
      'for',
      'for',
      'for',
      'for of 1',
      'for of 2',
      'for of 3',
      'for in 0',
      'for in 1',
      'for in 2',
    ]);
  });

  it('should evaluate complex assignments', () => {
    const context = evaluate(`
      const a = 1;
      const { b } = { b: 2 };
      const [c] = [3];
      const { ['d' + 'd' ]: d } = { dd: 4 };
      const e = ((a) => a)(5);
      const f = (({ a }) => a)({ a: 6 });
      const g = (([a]) => a)([7]);
      const h = (({ ['d' + 'd']: a }) => a)({ dd: 8 });
      const i = (({ a, ...b }) => b)({ a: 9, b: 9 });
      const j = (([a, ...b]) => b)([10, 10, 10]);
      const k = ((a, ...b) => b)(11, 11, 11);
      const [, l] = [11, 12];
      const m = ((a = 13) => a)();
      const [n = 14] = [];
      const { o = 15 } = {};
    `);

    const expects = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: { b: 9 },
      j: [10, 10],
      k: [11, 11],
      l: 12,
      m: 13,
      n: 14,
      o: 15,
    };
    for (const [key, val] of Object.entries(expects)) {
      expect(context.resolveIdentifier(key).value).toStrictEqual(val);
    }
  });

  it('should evaluate complex object', () => {
    evaluate(
      `
        const object = {
          a: 1,
          get b() { return 2 },
          set c(v) {
            this.d = v;
          },
          e(v) { return v + this.b; }
        };
        expect(object.a).toStrictEqual(1);
        expect(object.b).toStrictEqual(2);
        object.c = 3;
        expect(object.d).toStrictEqual(3);
        expect(object.e(2)).toStrictEqual(4);
      `,
      { binding: { expect } },
    );
  });

  it('should evaluate class', () => {
    evaluate(
      `
        class Animal {
          weight = 6;
          #privateProp = 8;
          ['a' + 2] = 10;
          constructor(name) {
            this.name = name;
            this.age = 3;
          }
          foo() {
            return 2;
          }
          get yearsOld() {
            return this.age
          }
          set yearsOld(a) {
            this.age = a;
          }
          static walk() { return 5 }
          publicMethod() {
            return this.#privateMethod();
          }
          #privateMethod() { return 7 }
          get publicProp() {
            return this.#privateProp;
          }
          ['a' + 1]() {
            return 9;
          }
        }

        class Dog extends Animal {
          constructor() {
            super('dog');
          }
        }

        const animal = new Animal('bird');
        expect(animal.name).toStrictEqual('bird');
        expect(animal.foo()).toStrictEqual(2);
        expect(animal.yearsOld).toStrictEqual(3);
        animal.yearsOld = 4;
        expect(animal.yearsOld).toStrictEqual(4);
        expect(Animal.walk()).toStrictEqual(5);
        expect(animal.weight).toStrictEqual(6);
        expect(animal.publicMethod()).toStrictEqual(7);
        expect(animal.publicProp).toStrictEqual(8);
        expect(animal.a1()).toStrictEqual(9);
        expect(animal.a2).toStrictEqual(10);

        const dog = new Dog();
        expect(dog.name).toStrictEqual('dog');
      `,
      {
        meriyah: {
          next: true,
        },
        binding: {
          expect,
          console,
        },
      },
    );
  });
});
