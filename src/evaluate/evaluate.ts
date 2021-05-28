import { ESTree, Options, parseModule } from 'meriyah';
import { JSXNode } from '../types/node';
import { JSXContext } from './context';
import { evalJSXChild } from './expression';
import { EvaluateOptions } from './options';
import { evalProgram } from './program';

const meriyahForceOptions: Options = {
  module: true,
  loc: true,
  jsx: true,
};

export const parse = (code: string, forceExpression: boolean, options: EvaluateOptions = {}) => {
  const { meriyah, debug } = options;
  try {
    const parserOptions = Object.assign({}, meriyah || {}, meriyahForceOptions);
    debug && console.time('JSX parse');
    const program = parseModule(forceExpression ? `<>${code}</>` : code, parserOptions);
    return program;
  } finally {
    debug && console.timeEnd('JSX parse');
  }
};

export const evaluate = (program: string | ESTree.Program, options: EvaluateOptions = {}) => {
  if (typeof program === 'string') {
    program = parse(program, false, options);
  }
  const context = new JSXContext(options);
  evalProgram(program, context);
  return context;
};

export const evaluateJSX = (program: string | ESTree.Program, options: EvaluateOptions = {}): JSXNode[] => {
  if (typeof program === 'string') {
    program = parse(program, true, options);
  }
  const [fragmentExpression] = program.body;
  if (!fragmentExpression || fragmentExpression.type !== 'ExpressionStatement') {
    return [];
  }

  const fragment = fragmentExpression.expression;
  if (!fragment || fragment.type !== 'JSXFragment') {
    return [];
  }

  const context = new JSXContext(options);

  try {
    options.debug && console.time('JSX eval ');
    const nodes = fragment.children.map((child) => evalJSXChild(child, context));
    return nodes;
  } finally {
    options.debug && console.timeEnd('JSX eval ');
  }
};
