import { JSXEvaluator } from "./evaluator";

describe('Evaluator', () => {
  const binding = {
    object: {
      foo: {
        bar: 'Hello',
      },
    },
    p: {
      className: 'jest',
      style: {
        color: 'red',
      },
    },
    JSON,
    Object,
  };

  const evalator = new JSXEvaluator({ binding, components: {}, filters: [] });

  it('should evaluate empty', () => {
    expect(evalator.eval('{}')).toEqual([]);
  });

  it('should evaluate number literal', () => {
    expect(evalator.eval('{1}')).toEqual([1]);
  });

  it('should evaluate boolean literal', () => {
    expect(evalator.eval('{true}')).toEqual([true]);
  });

  it('should evaluate string literal', () => {
    expect(evalator.eval('{"HI"}')).toEqual(['HI']);
  });

  it('should evaluate float literal', () => {
    expect(evalator.eval('{1.54}')).toEqual([1.54]);
  });

  it('should evaluate array literal', () => {
    expect(evalator.eval('{[1, 2, 3]}')).toEqual([[1, 2, 3]]);
  });

  it('should evaluate array literal with index', () => {
    expect(evalator.eval('{[1, 2, 3][1]}')).toEqual([2]);
  });

  it('should evaluate array literal with join', () => {
    expect(evalator.eval('{[3, 4, 5].join("-")}')).toEqual(['3-4-5']);
  });

  it('should evaluate object literal', () => {
    expect(evalator.eval('{({ a: 1, "b": 2 })}')).toEqual([{ a: 1, b: 2 }]);
  })

  it('should evaluate object spread literal', () => {
    expect(evalator.eval('{({ ...object.foo, c: 2 })}')).toEqual([{ bar: 'Hello', c: 2 }]);
  })

  it('should evaluate template literal', () => {
    expect(evalator.eval('{`literal`}')).toEqual(['literal']);
    expect(evalator.eval('{`literal + ${object.foo.bar} + string`}')).toEqual(['literal + Hello + string']);
  })

  it('should evaluate condition expression', () => {
    expect(evalator.eval('{ false ? "a" : true ? "b" : "c" }')).toEqual(['b']);
  })

  it('should evaluate comment', () => {
    expect(evalator.eval('{/* test */ 1}')).toEqual([1]);
  })

  it('should evaluate binary expression', () => {
    const sample = {
      '+': 3+7,
      '-': 3-7,
      '/': 3/7,
      '*': 3*7,
      '%':  3 % 7,
      '**':  3 ** 7,
      '<':  3 < 7,
      '>':  3 > 7,
      '<=':  3 <= 7,
      '>=':  3 >= 7,
      '==':  false, // 3 == 7,
      '!=':  true, // 3 != 7,
      '===':  false, // 3 === 7,
      '!==':  true, // 3 !== 7,
      '<<':  3 << 7,
      '>>':  3 >> 7,
      '>>>':  3 >>> 7,
      '&':  3 & 7,
      '|':  3 | 7,
      '^':  3 ^ 7,
      '&&':  3 && 7,
      '||':  3 || 7,
      '??':  3 ?? 7,
    };
    for (const [op, val] of Object.entries(sample)) {
      expect(evalator.eval(`{3 ${op} 7}`)).toStrictEqual([val].filter(Boolean));
    }

    expect(evalator.eval('{"stringify" in JSON}')).toStrictEqual([true]);
    expect(evalator.eval('{object instanceof Object}')).toStrictEqual([true]);
  })

  it('should evaluate unary expression', () => {
    const sample = {
      '+': +7,
      '-': -7,
      '~': ~7,
      '!': !7,
      'void': void 7,
    };
    for (const [op, val] of Object.entries(sample)) {
      expect(evalator.eval(`{${op}(7)}`)).toStrictEqual([val].filter(Boolean));
    }

    expect(evalator.eval('{"stringify" in JSON}')).toStrictEqual([true]);
    expect(evalator.eval('{object instanceof Object}')).toStrictEqual([true]);
  })

  it('should evaluate member expression', () => {
    expect(evalator.eval('{object.foo.bar}')).toEqual(['Hello']);
  });

  it('should evaluate HTML element', () => {
    expect(evalator.eval('<p {...p} />')).toMatchSnapshot();
  })
})
