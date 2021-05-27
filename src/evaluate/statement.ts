import { ESTree } from "meriyah"
import { EvaluateContext } from "./context"
import { EvaluateError } from "./error";
import { evalClassDeclaration, evalClassExpression, evalExpression } from "./expression";

export const evalStatement = (stmt: ESTree.Statement, context: EvaluateContext) => {
  switch(stmt.type) {
    case 'BlockStatement': return evalBlockStatement(stmt, context);
    case 'BreakStatement': return evalBreakStatement(stmt, context);
    case 'ClassDeclaration': return evalClassDeclaration(stmt, context);
    case 'ClassExpression': return evalClassExpression(stmt, context);
    case 'ContinueStatement': return evalContinueStatement(stmt, context);
    case 'DebuggerStatement': return evalDebuggerStatement(stmt, context);
    case 'DoWhileStatement': return evalDoWhileStatement(stmt, context);
    case 'EmptyStatement': return evalEmptyStatement(stmt, context);
    case 'ExportAllDeclaration': return evalExportAllDeclaration(stmt, context);
    case 'ExportDefaultDeclaration': return evalExportDefaultDeclaration(stmt, context);
    case 'ExportNamedDeclaration': return evalExportNamedDeclaration(stmt, context);
    case 'ExpressionStatement': return evalExpressionStatement(stmt, context);
    case 'ForInStatement': return evalForInStatement(stmt, context);
    case 'ForOfStatement': return evalForOfStatement(stmt, context);
    case 'ForStatement': return evalForStatement(stmt, context);
    case 'FunctionDeclaration': return evalFunctionDeclaration(stmt, context);
    case 'IfStatement': return evalIfStatement(stmt, context);
    case 'ImportDeclaration': return evalImportDeclaration(stmt, context);
    case 'LabeledStatement': return evalLabeledStatement(stmt, context);
    case 'ReturnStatement': return evalReturnStatement(stmt, context);
    case 'SwitchStatement': return evalSwitchStatement(stmt, context);
    case 'ThrowStatement': return evalThrowStatement(stmt, context);
    case 'TryStatement': return evalTryStatement(stmt, context);
    case 'VariableDeclaration': return evalVariableDeclaration(stmt, context);
    case 'WhileStatement': return evalWhileStatement(stmt, context);
    case 'WithStatement': return evalWithStatement(stmt, context);
    default:
      throw new EvaluateError('Not implemented statement', stmt, context);
  }
}

export const evalBlockStatement = (stmt: ESTree.BlockStatement, context: EvaluateContext) => {
  stmt.body.forEach((stmt) => {
    evalStatement(stmt, context);
  })
}

const BreakError = new Error('break');
export const evalBreakStatement = (_: ESTree.BreakStatement, __: EvaluateContext) => {
  throw BreakError;
}

const ContinueError = new Error('continue');
export const evalContinueStatement = (_: ESTree.ContinueStatement, __: EvaluateContext) => {
  throw ContinueError;
}

export const evalDebuggerStatement = (_: ESTree.DebuggerStatement, __: EvaluateContext) => {
  debugger;
}

export const evalDoWhileStatement = (stmt: ESTree.DoWhileStatement, context: EvaluateContext) => {
  do {
    try {
      evalStatement(stmt.body, context);
    } catch(err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  } while(evalExpression(stmt.test, context))
}

export const evalEmptyStatement = (_: ESTree.EmptyStatement, __: EvaluateContext) => {}

export const evalExportAllDeclaration = (stmt: ESTree.ExportAllDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('export is not supported', stmt, context);
}

export const evalExportDefaultDeclaration = (stmt: ESTree.ExportDefaultDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('export is not supported', stmt, context);
}

export const evalExportNamedDeclaration = (stmt: ESTree.ExportNamedDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('export is not supported', stmt, context);
}

export const evalExpressionStatement = (stmt: ESTree.ExpressionStatement, context: EvaluateContext) => {
  evalExpression(stmt.expression, context);
}

export const evalForInStatement = (stmt: ESTree.ForInStatement, context: EvaluateContext) => {
  switch (stmt.left.type) {
    case 'VariableDeclaration':
      evalVariableDeclaration(stmt.left, context);
      break;
    default:
      evalExpression(stmt.left, context);
  }
  const right = evalExpression(stmt.right, context);

  for(const _ in right) {
    try {
      evalStatement(stmt.body, context);
    } catch(err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
}

export const evalForOfStatement = (stmt: ESTree.ForOfStatement, context: EvaluateContext) => {
  switch (stmt.left.type) {
    case 'VariableDeclaration':
      evalVariableDeclaration(stmt.left, context);
      break;
    default:
      evalExpression(stmt.left, context);
  }
  const right = evalExpression(stmt.right, context);

  for(const _ of right) {
    try {
      evalStatement(stmt.body, context);
    } catch(err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
}

export const evalForStatement = (stmt: ESTree.ForStatement, context: EvaluateContext) => {
  if (stmt.init) {
    switch (stmt.init.type) {
      case 'VariableDeclaration':
        evalVariableDeclaration(stmt.init, context);
        break;
      default:
        evalExpression(stmt.init, context);
    }
  }
  while (stmt.test ? evalExpression(stmt.test, context) : true) {
    try {
      evalStatement(stmt.body, context);
    } catch(err) {
      if (err === ContinueError) {
        stmt.update && evalExpression(stmt.update, context);
        continue;
      }
      throw err;
    }
  }
}

export const evalFunctionDeclaration = (stmt: ESTree.FunctionDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('fuction is not supported', stmt, context);
}

export const evalIfStatement = (stmt: ESTree.IfStatement, context: EvaluateContext) => {
  if (evalExpression(stmt.test, context)) {
    evalStatement(stmt.consequent, context);
  } else {
    stmt.alternate && evalStatement(stmt.alternate, context);
  }
}

export const evalImportDeclaration = (stmt: ESTree.ImportDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('import is not supported', stmt, context);
}

export const evalLabeledStatement = (stmt: ESTree.LabeledStatement, context: EvaluateContext) => {
  throw new EvaluateError('label is not supported', stmt, context);
}

export const evalReturnStatement = (stmt: ESTree.ReturnStatement, context: EvaluateContext) => {
  throw new EvaluateError('return is not supported', stmt, context);
}

export const evalSwitchStatement = (stmt: ESTree.SwitchStatement, context: EvaluateContext) => {
  const discriminant = evalExpression(stmt.discriminant, context);
  stmt.cases.forEach((caseStmt) => {
    const match = caseStmt.test ? evalExpression(caseStmt.test, context) === discriminant : true
    if (match) {
      caseStmt.consequent.forEach((stmt) => evalStatement(stmt, context)), context
    }
  })
}

export const evalThrowStatement = (stmt: ESTree.ThrowStatement, context: EvaluateContext) => {
  throw evalExpression(stmt.argument, context);
}

export const evalTryStatement = (stmt: ESTree.TryStatement, context: EvaluateContext) => {
  try {
    evalStatement(stmt.block, context)
  } catch(error) {
    if (stmt.handler) {
      // TODO
      stmt.handler.param
      evalStatement(stmt.handler.body, context);
    } else {
      throw error;
    }
  } finally {
    stmt.finalizer && evalStatement(stmt.finalizer, context);
  }
}

export const evalVariableDeclaration = (stmt: ESTree.VariableDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('variable is not supported', stmt, context);
}

export const evalWhileStatement = (stmt: ESTree.WhileStatement, context: EvaluateContext) => {
  while (evalExpression(stmt.test, context)) {
    try {
      evalStatement(stmt.body, context);
    } catch(err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
}

export const evalWithStatement = (stmt: ESTree.WithStatement, context: EvaluateContext) => {
  throw new EvaluateError('with is not supported', stmt, context);
}
