import { Options, parseModule } from "meriyah"
import { EvaluateContext } from "./context"
import { JSXNode } from "../types/node"
import { EvaluateOptions } from "./options"
import { evalProgram } from "./program"
import { evalJSXChild } from "./expression"

const meriyahForceOptions: Options = {
  module: true,
  loc: true,
  jsx: true,
}

export const evaluate = (code: string, options: EvaluateOptions = {}) => {
  const { meriyah } = options;
  const parserOptions = Object.assign({}, meriyah || {}, meriyahForceOptions);
  const program = parseModule(code, parserOptions);
  const context = new EvaluateContext(options);
  evalProgram(program, context);
  return context;
}

export const evaluateJSX = (code: string, options: EvaluateOptions = {}): JSXNode[] => {
  const { meriyah } = options;
  const parserOptions = Object.assign({}, meriyah || {}, meriyahForceOptions);
  const program = parseModule(`<>${code}</>`, parserOptions);

  const [fragmentExpression] = program.body
  if (!fragmentExpression || fragmentExpression.type !== 'ExpressionStatement') {
    return []
  }

  const fragment = fragmentExpression.expression;
  if (!fragment || fragment.type !== 'JSXFragment') {
    return [];
  }

  const context = new EvaluateContext(options);
  return fragment.children.map((child) => evalJSXChild(child, context));
}
