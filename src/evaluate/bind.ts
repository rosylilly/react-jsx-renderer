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
  rest: RestBinding | null;
  default?: any;
}

export interface ArrayBinding {
  type: 'Array';
  binds: (Binding | null)[];
  rest: RestBinding | null;
  default?: any;
}

export interface RestBinding {
  type: 'Rest';
  bind: Binding;
  default?: any;
}

export interface MemberBinding {
  type: 'Member';
  object: any;
  property: string;
  default?: any;
}

export type Binding = IdentifierBinding | ObjectBinding | ArrayBinding | RestBinding | MemberBinding;

export const evalBindingPattern = (bind: ESTree.BindingPattern | ESTree.AssignmentPattern | ESTree.Expression, context: JSXContext): Binding => {
  switch (bind.type) {
    case 'Identifier':
      return evalIdentifierBinding(bind, context);
    case 'AssignmentPattern':
      return evalAssignmentPattern(bind, context);
    case 'MemberExpression':
      return evalMemberBinding(bind, context);
    default:
      return evalExpression(bind, context);
  }
};

export const evalIdentifierBinding = (bind: ESTree.Identifier, _: JSXContext): IdentifierBinding => {
  return {
    type: 'Identifier',
    name: bind.name,
  };
};

export const evalObjectPattern = (bind: ESTree.ObjectPattern, context: JSXContext): ObjectBinding => {
  const binding: ObjectBinding = {
    type: 'Object',
    binds: {},
    rest: null,
  };

  bind.properties.forEach((prop) => {
    switch (prop.type) {
      case 'Property': {
        const key = prop.key.type === 'Identifier' ? prop.key.name : evalExpression(prop.key, context);
        const val = evalBindingPattern(prop.value, context);
        binding.binds[key] = val;
        break;
      }
      case 'RestElement': {
        binding.rest = evalRestElement(prop, context);
      }
    }
  });

  return binding;
};

export const evalArrayPattern = (bind: ESTree.ArrayPattern, context: JSXContext): ArrayBinding => {
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
        binding.rest = evalRestElement(element, context);
        break;
      default:
        binding.binds.push(evalBindingPattern(element, context));
    }
  });

  return binding;
};

export const evalAssignmentPattern = (bind: ESTree.AssignmentPattern, context: JSXContext) => {
  const binding = evalBindingPattern(bind.left, context);
  binding.default = bind.right ? evalExpression(bind.right, context) : undefined;
  return binding;
};

export const evalRestElement = (bind: ESTree.RestElement, context: JSXContext): RestBinding => {
  return {
    type: 'Rest',
    bind: evalBindingPattern(bind.argument, context),
    default: undefined,
  };
};

export const evalMemberBinding = (bind: ESTree.MemberExpression, context: JSXContext): MemberBinding => {
  const property =
    bind.property.type === 'Identifier' ? bind.property.name : bind.property.type === 'PrivateIdentifier' ? bind.property.name : evalExpression(bind.property, context);

  return {
    type: 'Member',
    object: evalExpression(bind.object, context),
    property,
  };
};

type DefineKind = ESTree.VariableDeclaration['kind'];

export const setBinding = (bind: Binding, val: any, context: JSXContext, define?: DefineKind) => {
  switch (bind.type) {
    case 'Identifier':
      return setIdentifierBinding(bind, val, context, define);
    case 'Object':
      return setObjectBinding(bind, val, context, define);
    case 'Array':
      return setArrayBinding(bind, val, context, define);
    case 'Rest':
      return setBinding(bind.bind, val, context, define);
    case 'Member':
      return setMemberBinding(bind, val, context, define);
  }
};

const setIdentifierBinding = (id: IdentifierBinding, val: any, context: JSXContext, define?: DefineKind) => {
  if (define) context.defineVariable(define, id.name);
  val !== undefined && context.setVariable(id.name, val);
  return val;
};

const setObjectBinding = (obj: ObjectBinding, val: any, context: JSXContext, define?: DefineKind) => {
  val = Object.assign({}, val);
  for (const [key, bind] of Object.entries(obj.binds)) {
    const value = val[key] === undefined ? bind.default : val[key];
    setBinding(bind, value, context, define);
    delete val[key];
  }
  if (obj.rest) {
    setBinding(obj.rest, val, context, define);
  }
  return val;
};

const setArrayBinding = (ary: ArrayBinding, val: any, context: JSXContext, define?: DefineKind) => {
  const values = [...val] as any[];
  for (let idx = 0; idx < ary.binds.length; idx++) {
    const bind = ary.binds[idx];
    const value = values.shift();
    if (!bind) continue;

    setBinding(bind, value === undefined ? bind.default : value, context, define);
  }

  if (ary.rest) {
    setBinding(ary.rest, values, context, define);
  }
  return val;
};

const setMemberBinding = (binding: MemberBinding, val: any, context: JSXContext, _define?: DefineKind) => {
  context.pushStack(binding.object);
  binding.object[binding.property] = val;
  context.popStack();
  return val;
};
