import { ESTree } from 'meriyah';
import { EvaluateContext } from './context';
import { evalStatement } from './statement';

export const evalProgram = (prog: ESTree.Program, context: EvaluateContext) => {
  prog.body.forEach((stmt) => {
    evalStatement(stmt, context);
  });
};
