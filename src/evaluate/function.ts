import { ESTree } from 'meriyah';
import { evalBindingPattern, IdentifierBinding, setBinding } from './bind';
import { JSXContext } from './context';
import { JSXReturn } from './error';
import { evalStatement } from './statement';

export const evalFunction = (exp: ESTree.FunctionDeclaration | ESTree.FunctionExpression, context: JSXContext) => {
  const func = function (...args: any[]): any {
    let retval: any;
    context.pushStack(context.resolveThis());
    exp.params.forEach((param, idx) => {
      const bind = evalBindingPattern(param, context);
      const val = args[idx] === undefined ? bind.default : args[idx];
      setBinding(bind, val, context, 'let');
    });

    try {
      exp.body && evalStatement(exp.body, context);
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
  if (exp.id) {
    bind = evalBindingPattern(exp.id, context) as IdentifierBinding;
    setBinding(bind, func, context, 'let');
  }

  return [bind, func];
};
