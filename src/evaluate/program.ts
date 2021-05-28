import { ESTree } from 'meriyah';
import { JSXContext } from './context';
import { evalStatement } from './statement';

export const evalProgram = (prog: ESTree.Program, context: JSXContext) => {
  prog.body.forEach((stmt) => {
    evalStatement(stmt, context);
  });
};
