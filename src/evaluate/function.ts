import { ESTree } from 'meriyah';
import { evalBindingPattern, IdentifierBinding, setBinding } from './bind';
import { JSXContext } from './context';
import { JSXEvaluateError, JSXReturn } from './error';
import { evalExpression } from './expression';
import { AnyFunction } from './options';
import { evalStatement } from './statement';

export const evalFunction = (
  exp: ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ArrowFunctionExpression,
  context: JSXContext,
): [IdentifierBinding | undefined, AnyFunction] => {
  if (exp.async) {
    throw new JSXEvaluateError('async function not supported', exp, context);
  }

  const func = function (...args: any[]): any {
    let retval: any;
    context.pushStack(context.resolveThis());
    exp.params.forEach((param) => {
      const bind = evalBindingPattern(param, context);
      setBinding(bind, bind.type === 'Rest' ? args : args.shift() || bind.default, context, 'let');
    });

    try {
      if (exp.body) {
        switch (exp.body.type) {
          case 'BlockStatement':
            evalStatement(exp.body, context);
            break;
          default:
            retval = evalExpression(exp.body, context);
        }
      }
    } catch (err) {
      if (err instanceof JSXReturn) {
        retval = err.value;
      } else {
        throw err;
      }
    }

    context.popStack();
    return retval;
  };

  let bind: IdentifierBinding | undefined = undefined;
  if (exp.type === 'FunctionDeclaration' || exp.type === 'FunctionExpression') {
    if (exp.id) {
      bind = evalBindingPattern(exp.id, context) as IdentifierBinding;
      setBinding(bind, func, context, 'let');
    }
  }

  return [bind, func];
};

export const bindFunction = (func: AnyFunction, self: any, context: JSXContext): AnyFunction => {
  return (...args: any[]) => {
    context.pushStack(self);
    const retval = func(...args);
    context.popStack();
    return retval;
  };
};
