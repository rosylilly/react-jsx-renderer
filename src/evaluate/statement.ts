import { ESTree } from 'meriyah';
import { Binding, ArrayBinding, evalBindingPattern, IdentifierBinding, ObjectBinding, setBinding } from './bind';
import { EvaluateContext } from './context';
import { EvaluateError, JSXReturn } from './error';
import { evalClassDeclaration, evalClassExpression, evalExpression } from './expression';
import { evalFunction } from './function';

export const evalStatement = (stmt: ESTree.Statement, context: EvaluateContext) => {
  switch (stmt.type) {
    case 'BlockStatement':
      return evalBlockStatement(stmt, context);
    case 'BreakStatement':
      return evalBreakStatement(stmt, context);
    case 'ClassDeclaration':
      return evalClassDeclaration(stmt, context);
    case 'ClassExpression':
      return evalClassExpression(stmt, context);
    case 'ContinueStatement':
      return evalContinueStatement(stmt, context);
    case 'DebuggerStatement':
      return evalDebuggerStatement(stmt, context);
    case 'DoWhileStatement':
      return evalDoWhileStatement(stmt, context);
    case 'EmptyStatement':
      return evalEmptyStatement(stmt, context);
    case 'ExportAllDeclaration':
      return evalExportAllDeclaration(stmt, context);
    case 'ExportDefaultDeclaration':
      return evalExportDefaultDeclaration(stmt, context);
    case 'ExportNamedDeclaration':
      return evalExportNamedDeclaration(stmt, context);
    case 'ExpressionStatement':
      return evalExpressionStatement(stmt, context);
    case 'ForInStatement':
      return evalForInStatement(stmt, context);
    case 'ForOfStatement':
      return evalForOfStatement(stmt, context);
    case 'ForStatement':
      return evalForStatement(stmt, context);
    case 'FunctionDeclaration':
      return evalFunctionDeclaration(stmt, context);
    case 'IfStatement':
      return evalIfStatement(stmt, context);
    case 'ImportDeclaration':
      return evalImportDeclaration(stmt, context);
    case 'LabeledStatement':
      return evalLabeledStatement(stmt, context);
    case 'ReturnStatement':
      return evalReturnStatement(stmt, context);
    case 'SwitchStatement':
      return evalSwitchStatement(stmt, context);
    case 'ThrowStatement':
      return evalThrowStatement(stmt, context);
    case 'TryStatement':
      return evalTryStatement(stmt, context);
    case 'VariableDeclaration':
      return evalVariableDeclaration(stmt, context);
    case 'WhileStatement':
      return evalWhileStatement(stmt, context);
    case 'WithStatement':
      return evalWithStatement(stmt, context);
    default:
      throw new EvaluateError('Not implemented statement', stmt, context);
  }
};

export const evalBlockStatement = (stmt: ESTree.BlockStatement, context: EvaluateContext) => {
  stmt.body.forEach((stmt) => {
    evalStatement(stmt, context);
  });
};

const BreakError = new Error('break');
export const evalBreakStatement = (_: ESTree.BreakStatement, __: EvaluateContext) => {
  throw BreakError;
};

const ContinueError = new Error('continue');
export const evalContinueStatement = (_: ESTree.ContinueStatement, __: EvaluateContext) => {
  throw ContinueError;
};

export const evalDebuggerStatement = (_: ESTree.DebuggerStatement, __: EvaluateContext) => {
  // eslint-disable-next-line no-debugger
  debugger;
};

export const evalDoWhileStatement = (stmt: ESTree.DoWhileStatement, context: EvaluateContext) => {
  do {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  } while (evalExpression(stmt.test, context));
};

export const evalEmptyStatement = (_: ESTree.EmptyStatement, __: EvaluateContext) => {};

export const evalExportAllDeclaration = (stmt: ESTree.ExportAllDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('export all is not supported', stmt, context);
};

export const evalExportDefaultDeclaration = (stmt: ESTree.ExportDefaultDeclaration, context: EvaluateContext) => {
  const value = (() => {
    switch (stmt.declaration.type) {
      case 'FunctionDeclaration':
        return evalFunctionDeclaration(stmt.declaration, context);
      case 'VariableDeclaration':
        return evalVariableDeclaration(stmt.declaration, context);
      default:
        return evalExpression(stmt.declaration, context);
    }
  })();
  context.export('default', value);
};

export const evalExportNamedDeclaration = (stmt: ESTree.ExportNamedDeclaration, context: EvaluateContext) => {
  stmt.specifiers.map((specifier) => {
    context.export(specifier.exported.name, evalExpression(specifier.local, context));
  });

  if (!stmt.declaration) return undefined;

  switch (stmt.declaration.type) {
    case 'FunctionDeclaration': {
      const [bind, func] = evalFunctionDeclaration(stmt.declaration, context);
      if (bind) {
        context.export(bind.name, func);
      }
      break;
    }
    case 'VariableDeclaration': {
      const binds = evalVariableDeclaration(stmt.declaration, context);
      const exportBind = (bind: Binding) => {
        switch (bind.type) {
          case 'Identifier':
            return context.export(bind.name, evalExpression(bind, context));
          case 'Object':
            return Object.values(bind.binds).map((b) => exportBind(b));
          case 'Array':
            return bind.binds.map((bind) => bind && exportBind(bind));
        }
      };
      return binds.forEach((bind) => exportBind(bind));
    }
    default:
      return evalExpression(stmt.declaration, context);
  }
};

export const evalExpressionStatement = (stmt: ESTree.ExpressionStatement, context: EvaluateContext) => {
  evalExpression(stmt.expression, context);
};

export const evalForInStatement = (stmt: ESTree.ForInStatement, context: EvaluateContext) => {
  const right = evalExpression(stmt.right, context);

  context.pushStack(context.resolveThis());
  for (const iter in right) {
    context.popStack();
    context.pushStack(context.resolveThis());

    switch (stmt.left.type) {
      case 'VariableDeclaration': {
        const [bind] = evalVariableDeclaration(stmt.left, context);
        if (bind) {
          setBinding(bind, iter, context);
        }
        break;
      }
      default:
        evalExpression(stmt.left, context);
    }

    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
  context.popStack();
};

export const evalForOfStatement = (stmt: ESTree.ForOfStatement, context: EvaluateContext) => {
  const right = evalExpression(stmt.right, context);

  context.pushStack(context.resolveThis());
  for (const iter of right) {
    context.popStack();
    context.pushStack(context.resolveThis());

    switch (stmt.left.type) {
      case 'VariableDeclaration': {
        const [bind] = evalVariableDeclaration(stmt.left, context);
        if (bind) {
          setBinding(bind, iter, context);
        }
        break;
      }
      default:
        evalExpression(stmt.left, context);
    }

    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
  context.popStack();
};

export const evalForStatement = (stmt: ESTree.ForStatement, context: EvaluateContext) => {
  context.pushStack(undefined);
  const init = () => {
    if (stmt.init) {
      switch (stmt.init.type) {
        case 'VariableDeclaration':
          evalVariableDeclaration(stmt.init, context);
          break;
        default:
          evalExpression(stmt.init, context);
      }
    }
  };
  const test = () => {
    return stmt.test ? evalExpression(stmt.test, context) : true;
  };
  const update = () => {
    stmt.update && evalExpression(stmt.update, context);
  };
  for (init(); test(); update()) {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err === ContinueError) continue;
      throw err;
    }
  }
  context.popStack();
};

export const evalFunctionDeclaration = (stmt: ESTree.FunctionDeclaration, context: EvaluateContext) => {
  return evalFunction(stmt, context);
};

export const evalIfStatement = (stmt: ESTree.IfStatement, context: EvaluateContext) => {
  if (evalExpression(stmt.test, context)) {
    evalStatement(stmt.consequent, context);
  } else {
    stmt.alternate && evalStatement(stmt.alternate, context);
  }
};

export const evalImportDeclaration = (stmt: ESTree.ImportDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('import is not supported', stmt, context);
};

export const evalLabeledStatement = (stmt: ESTree.LabeledStatement, context: EvaluateContext) => {
  throw new EvaluateError('label is not supported', stmt, context);
};

export const evalReturnStatement = (stmt: ESTree.ReturnStatement, context: EvaluateContext) => {
  const val = stmt.argument ? evalExpression(stmt.argument, context) : undefined;
  throw new JSXReturn(val);
};

export const evalSwitchStatement = (stmt: ESTree.SwitchStatement, context: EvaluateContext) => {
  const discriminant = evalExpression(stmt.discriminant, context);
  let match = false;
  for (const caseStmt of stmt.cases) {
    try {
      match = match || (caseStmt.test ? evalExpression(caseStmt.test, context) === discriminant : true);
      if (match) {
        caseStmt.consequent.forEach((stmt) => evalStatement(stmt, context)), context;
      }
    } catch (err) {
      if (err === BreakError) break;
      throw err;
    }
  }
};

export const evalThrowStatement = (stmt: ESTree.ThrowStatement, context: EvaluateContext) => {
  throw evalExpression(stmt.argument, context);
};

export const evalTryStatement = (stmt: ESTree.TryStatement, context: EvaluateContext) => {
  try {
    evalStatement(stmt.block, context);
  } catch (error) {
    if (stmt.handler) {
      context.pushStack(context.resolveThis());
      if (stmt.handler.param) {
        const binding = evalBindingPattern(stmt.handler.param, context);
        setBinding(binding, error, context, 'let');
      }
      evalStatement(stmt.handler.body, context);
      context.popStack();
    } else {
      throw error;
    }
  } finally {
    stmt.finalizer && evalStatement(stmt.finalizer, context);
  }
};

export const evalVariableDeclaration = (stmt: ESTree.VariableDeclaration, context: EvaluateContext) => {
  const { kind } = stmt;

  type Path = string | number;
  const define = (id: IdentifierBinding, paths?: Path[], init?: any) => {
    context.defineVariable(kind, id.name);
    if (paths) {
      const val = paths.reduce((val, name, idx) => {
        const ret = val[name];
        if (idx === paths.length - 1) delete val[name];
        return ret;
      }, init);
      context.setVariable(id.name, val !== undefined ? val : id.default);
    } else {
      id.default && context.setVariable(id.name, id.default);
    }
  };

  const defineObj = (binding: ObjectBinding, init: any, prefixes: Path[] = []) => {
    for (const [key, bind] of Object.entries(binding.binds)) {
      switch (bind.type) {
        case 'Identifier':
          define(bind, [...prefixes, key], init);
          break;
        case 'Object':
          defineObj(bind, init, [...prefixes, key]);
          break;
        case 'Array':
          defineAry(bind, init, [...prefixes, key]);
      }
    }
    if (binding.rest) {
      define(binding.rest, [...prefixes], init);
    }
  };

  const defineAry = (binding: ArrayBinding, init: any, prefixes: Path[] = []) => {
    let lastIdx = 0;
    for (let idx = 0; idx < binding.binds.length; idx++) {
      const bind = binding.binds[idx];
      lastIdx = idx;
      if (!bind) continue;

      switch (bind.type) {
        case 'Identifier':
          define(bind, [...prefixes, idx], init);
          break;
        case 'Object':
          defineObj(bind, init, [...prefixes, idx]);
          break;
        case 'Array':
          defineAry(bind, init, [...prefixes, idx]);
          break;
      }
    }
    if (binding.rest) {
      const array = Array.from(prefixes.reduce((val, part) => val[part], init));
      define(binding.rest, [], array.slice(lastIdx + 1));
    }
  };

  return stmt.declarations.map((declaration) => {
    const binding = evalBindingPattern(declaration.id, context);
    switch (binding.type) {
      case 'Identifier': {
        if (declaration.init) {
          define(binding, [], evalExpression(declaration.init, context));
        } else {
          define(binding);
        }
        break;
      }
      case 'Object': {
        const init = Object.assign({}, declaration.init ? evalExpression(declaration.init, context) : {});
        defineObj(binding, init);
        break;
      }
      case 'Array': {
        const init = declaration.init ? [...evalExpression(declaration.init, context)] : [];
        defineAry(binding, init);
        break;
      }
    }
    return binding;
  });
};

export const evalWhileStatement = (stmt: ESTree.WhileStatement, context: EvaluateContext) => {
  while (evalExpression(stmt.test, context)) {
    try {
      evalStatement(stmt.body, context);
    } catch (err) {
      if (err === BreakError) break;
      if (err === ContinueError) continue;
      throw err;
    }
  }
};

export const evalWithStatement = (stmt: ESTree.WithStatement, context: EvaluateContext) => {
  throw new EvaluateError('with is not supported', stmt, context);
};
