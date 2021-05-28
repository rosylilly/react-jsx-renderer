import { ESTree } from 'meriyah';
import { JSXContext } from './context';
import { evalExpression } from './expression';

export interface IdentifierBinding {
  type: 'Identifier';
  name: string;
  default?: any;
}

export interface PathBinding {
  [key: string]: Binding;
}

export interface ObjectBinding {
  type: 'Object';
  binds: PathBinding;
  rest: IdentifierBinding | null;
  default?: any;
}

export interface ArrayBinding {
  type: 'Array';
  binds: (Binding | null)[];
  rest: IdentifierBinding | null;
  default?: any;
}

export type Binding = IdentifierBinding | ObjectBinding | ArrayBinding;

export const evalBindingPattern = (bind: ESTree.BindingPattern | ESTree.AssignmentPattern | ESTree.Expression, context: JSXContext): Binding => {
  switch (bind.type) {
    case 'Identifier':
      return evalIdentifierBinding(bind, context);
    case 'ObjectPattern':
      return evalObjectBinding(bind, context);
    case 'ArrayPattern':
      return evalArrayBinding(bind, context);
    case 'AssignmentPattern': {
      const binding = evalBindingPattern(bind.left, context);
      binding.default = bind.right ? evalExpression(bind.right, context) : undefined;
      return binding;
    }
    default:
      return evalExpression(bind, context);
  }
};

const evalIdentifierBinding = (bind: ESTree.Identifier, _: JSXContext): IdentifierBinding => {
  return {
    type: 'Identifier',
    name: bind.name,
  };
};

const evalObjectBinding = (bind: ESTree.ObjectPattern, context: JSXContext): ObjectBinding => {
  const binding: ObjectBinding = {
    type: 'Object',
    binds: {},
    rest: null,
  };

  bind.properties.forEach((prop) => {
    switch (prop.type) {
      case 'Property': {
        const key = prop.key.type === 'Identifier' ? prop.key.name : '';
        const val = evalBindingPattern(prop.value as ESTree.BindingPattern, context);
        binding.binds[key] = val;
        break;
      }
      case 'RestElement': {
        binding.rest = prop.argument.type === 'Identifier' ? evalIdentifierBinding(prop.argument, context) : null;
      }
    }
  });

  return binding;
};

const evalArrayBinding = (bind: ESTree.ArrayPattern, context: JSXContext): ArrayBinding => {
  const binding: ArrayBinding = {
    type: 'Array',
    binds: [],
    rest: null,
  };

  bind.elements.forEach((element) => {
    if (element === null) {
      binding.binds.push(null);
      return;
    }

    switch (element.type) {
      case 'RestElement':
        binding.rest = element.argument.type === 'Identifier' ? evalIdentifierBinding(element.argument, context) : null;
        break;
      default:
        binding.binds.push(evalBindingPattern(element, context));
    }
  });

  return binding;
};

type DefineKind = ESTree.VariableDeclaration['kind'];
export const setBinding = (bind: Binding, val: any, context: JSXContext, define?: DefineKind) => {
  switch (bind.type) {
    case 'Identifier':
      return setId(bind, val, context, define);
    case 'Object':
      return setObj(bind, val, context, define);
    case 'Array':
      return setAry(bind, val, context, define);
  }
};

const setId = (id: IdentifierBinding, val: any, context: JSXContext, define?: DefineKind) => {
  if (define) {
    context.defineVariable(define, id.name);
  }
  context.setVariable(id.name, val);
  return val;
};

const setObj = (obj: ObjectBinding, val: any, context: JSXContext, define?: DefineKind) => {
  val = Object.assign({}, val);
  for (const [key, bind] of Object.entries(obj.binds)) {
    setBinding(bind, val[key], context, define);
    delete val[key];
  }
  if (obj.rest) {
    setBinding(obj.rest, val, context, define);
  }
  return val;
};

const setAry = (ary: ArrayBinding, val: any, context: JSXContext, define?: DefineKind) => {
  val = [...val];
  let last = 0;
  for (let idx = 0; idx < ary.binds.length; idx++) {
    const bind = ary.binds[idx];
    last = idx;
    if (!bind) continue;

    setBinding(bind, val[idx], context, define);
  }

  if (ary.rest) {
    setBinding(ary.rest, val.slice(last + 1), context, define);
  }
  return val;
};
