import { ESTree } from 'meriyah';
import { JSXComponent, JSXElement, JSXFragment, JSXNode, JSXProperties, JSXText } from '../types/node';
import { evalArrayPattern, evalBindingPattern, evalObjectPattern, evalRestElement, setBinding } from './bind';
import { evalClassDeclaration, evalClassExpression } from './class';
import { JSXContext } from './context';
import { evalMethodDefinition } from './definition';
import { JSXEvaluateError, wrapJSXError } from './error';
import { bindFunction, evalFunction } from './function';

export const evalExpression = (exp: ESTree.Expression, context: JSXContext): any => {
  try {
    switch (exp.type) {
      case 'ArrayExpression':
        return evalArrayExpression(exp, context);
      case 'ArrayPattern':
        return evalArrayPattern(exp, context);
      case 'ArrowFunctionExpression':
        return evalArrowFunctionExpression(exp, context);
      case 'AssignmentExpression':
        return evalAssignmentExpression(exp, context);
      case 'AwaitExpression':
        return evalAwaitExpression(exp, context);
      case 'BinaryExpression':
        return evalBinaryExpression(exp, context);
      case 'CallExpression':
        return evalCallExpression(exp, context);
      case 'ChainExpression':
        return evalChainExpression(exp, context);
      case 'ClassDeclaration':
        return evalClassDeclaration(exp, context);
      case 'ClassExpression':
        return evalClassExpression(exp, context);
      case 'ConditionalExpression':
        return evalConditionalExpression(exp, context);
      case 'FunctionExpression':
        return evalFunctionExpression(exp, context);
      case 'Identifier':
        return evalIdentifier(exp, context);
      case 'Import':
        return evalImport(exp, context);
      case 'ImportExpression':
        return evalImportExpression(exp, context);
      case 'JSXClosingElement':
        return evalJSXClosingElement(exp, context);
      case 'JSXClosingFragment':
        return evalJSXClosingFragment(exp, context);
      case 'JSXElement':
        return evalJSXElement(exp, context);
      case 'JSXExpressionContainer':
        return evalJSXExpressionContainer(exp, context);
      case 'JSXFragment':
        return evalJSXFragment(exp, context);
      case 'JSXOpeningElement':
        return evalJSXOpeningElement(exp, context);
      case 'JSXOpeningFragment':
        return evalJSXOpeningFragment(exp, context);
      case 'JSXSpreadChild':
        return evalJSXSpreadChild(exp, context);
      case 'Literal':
        return evalLiteral(exp, context);
      case 'LogicalExpression':
        return evalLogicalExpression(exp, context);
      case 'MemberExpression':
        return evalMemberExpression(exp, context);
      case 'MetaProperty':
        return evalMetaProperty(exp, context);
      case 'NewExpression':
        return evalNewExpression(exp, context);
      case 'ObjectExpression':
        return evalObjectExpression(exp, context);
      case 'ObjectPattern':
        return evalObjectPattern(exp, context);
      case 'RestElement':
        return evalRestElement(exp, context);
      case 'SequenceExpression':
        return evalSequenceExpression(exp, context);
      case 'SpreadElement':
        return evalSpreadElement(exp, context);
      case 'Super':
        return evalSuper(exp, context);
      case 'TaggedTemplateExpression':
        return evalTaggedTemplateExpression(exp, context);
      case 'TemplateLiteral':
        return evalTemplateLiteral(exp, context);
      case 'ThisExpression':
        return evalThisExpression(exp, context);
      case 'UnaryExpression':
        return evalUnaryExpression(exp, context);
      case 'UpdateExpression':
        return evalUpdateExpression(exp, context);
      case 'YieldExpression':
        return evalYieldExpression(exp, context);
      default:
        throw new JSXEvaluateError('Not implemented expression', exp, context);
    }
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalArrayExpression = (exp: ESTree.ArrayExpression, context: JSXContext): Array<any> => {
  return exp.elements.map((element) => (element ? evalExpression(element, context) : null));
};

export const evalArrowFunctionExpression = (exp: ESTree.ArrowFunctionExpression, context: JSXContext) => {
  const self = context.resolveThis();
  const func = bindFunction(evalFunction(exp, context)[1], self, context);

  return func;
};

export const evalAssignmentExpression = (exp: ESTree.AssignmentExpression, context: JSXContext) => {
  const binding = evalBindingPattern(exp.left, context);

  const { operator } = exp;
  if (operator === '=') {
    const val = evalExpression(exp.right, context);
    setBinding(binding, val, context);
    return val;
  } else {
    const val = evalBinaryExpression(
      {
        type: 'BinaryExpression',
        operator: operator.slice(0, operator.length - 1),
        left: exp.left,
        right: exp.right,
      },
      context,
    );
    setBinding(binding, val, context);
    return val;
  }
};

export const evalAwaitExpression = (exp: ESTree.AwaitExpression, context: JSXContext) => {
  throw new JSXEvaluateError('await is not supported', exp, context);
};

export const evalBinaryExpression = (exp: ESTree.BinaryExpression, context: JSXContext) => {
  const left = () => evalExpression(exp.left, context);
  const right = () => evalExpression(exp.right, context);
  switch (exp.operator) {
    case '+':
      return left() + right();
    case '-':
      return left() - right();
    case '/':
      return left() / right();
    case '*':
      return left() * right();
    case '%':
      return left() % right();
    case '**':
      return left() ** right();
    // relational operators
    case 'in':
      return left() in right();
    case 'instanceof':
      return left() instanceof right();
    case '<':
      return left() < right();
    case '>':
      return left() > right();
    case '<=':
      return left() <= right();
    case '>=':
      return left() >= right();
    // equality operators
    case '==':
      return left() == right();
    case '!=':
      return left() != right();
    case '===':
      return left() === right();
    case '!==':
      return left() !== right();
    // bitwise shift operators
    case '<<':
      return left() << right();
    case '>>':
      return left() >> right();
    case '>>>':
      return left() >>> right();
    // binary bitwise operators
    case '&':
      return left() & right();
    case '|':
      return left() | right();
    case '^':
      return left() ^ right();
    default:
      throw new JSXEvaluateError(`Unknown binary operator: ${exp.operator}`, exp, context);
  }
};

export const evalCallExpression = (exp: ESTree.CallExpression, context: JSXContext) => {
  if (context.options.disableCall) return undefined;

  try {
    const callee = exp.callee as ESTree.Expression;
    const receiver = callee.type === 'MemberExpression' ? evalExpression(callee.object, context) : context.resolveThis();
    const getName = (callee: ESTree.Expression | ESTree.PrivateIdentifier) => {
      return callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? getName(callee.property) : null;
    };

    const method = evalExpression(callee, context) as (...args: any[]) => any;

    if (!context.isAllowedFunction(method)) {
      throw new JSXEvaluateError(`${getName(callee) || 'f'} is not allowed function`, exp, context);
    }

    const args = exp.arguments.map((arg) => evalExpression(arg, context));

    if (typeof method !== 'function') {
      throw new JSXEvaluateError(`${getName(callee) || 'f'} is not a function`, exp, context);
    }

    context.pushStack(receiver);
    const retval = method.call(receiver, ...args);
    context.popStack();
    return retval;
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalChainExpression = (exp: ESTree.ChainExpression, context: JSXContext) => {
  try {
    switch (exp.expression.type) {
      case 'CallExpression': {
        const callee = evalExpression(exp.expression.callee, context);
        return callee ? evalCallExpression(exp.expression, context) : undefined;
      }
      case 'MemberExpression': {
        const object = evalExpression(exp.expression.object, context);
        return object ? evalMemberExpression(exp.expression, context) : undefined;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('is undefined')) {
      return undefined;
    }
    throw err;
  }
};

export const evalConditionalExpression = (exp: ESTree.ConditionalExpression, context: JSXContext) => {
  return evalExpression(exp.test, context) ? evalExpression(exp.consequent, context) : evalExpression(exp.alternate, context);
};

export const evalFunctionExpression = (exp: ESTree.FunctionExpression, context: JSXContext) => {
  return evalFunction(exp, context)[1];
};

export const evalIdentifier = (exp: ESTree.Identifier, context: JSXContext) => {
  const variable = context.resolveIdentifier(exp.name);
  if (!variable) {
    if (context.options.raiseReferenceError) {
      throw new JSXEvaluateError(`${exp.name} is not defined`, exp, context);
    } else {
      return undefined;
    }
  }
  return variable.value;
};

export const evalImport = (exp: ESTree.Import, context: JSXContext) => {
  throw new JSXEvaluateError('import is not supported', exp, context);
};

export const evalImportExpression = (exp: ESTree.ImportExpression, context: JSXContext) => {
  throw new JSXEvaluateError('import is not supported', exp, context);
};

export const evalLiteral = (exp: ESTree.Literal, _context: JSXContext): ESTree.Literal['value'] => {
  return exp.value;
};

export const evalLogicalExpression = (exp: ESTree.LogicalExpression, context: JSXContext) => {
  const left = () => evalExpression(exp.left, context);
  const right = () => evalExpression(exp.right, context);
  switch (exp.operator) {
    case '&&':
      return left() && right();
    case '||':
      return left() || right();
    case '??':
      return left() ?? right();
    default:
      throw new JSXEvaluateError(`Unknown logical operator: ${exp.operator}`, exp, context);
  }
};

export const evalMemberExpression = (exp: ESTree.MemberExpression, context: JSXContext) => {
  try {
    const { object, property } = exp;

    const receiver = evalExpression(object, context);
    const key = property.type === 'Identifier' ? property.name : property.type === 'PrivateIdentifier' ? property.name : evalExpression(property, context);

    context.pushStack(receiver);
    const retval = receiver[key];
    context.popStack();
    return retval;
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalMetaProperty = (exp: ESTree.MetaProperty, context: JSXContext) => {
  throw new JSXEvaluateError('meta property is not supported', exp, context);
};

export const evalNewExpression = (exp: ESTree.NewExpression, context: JSXContext) => {
  try {
    if (context.options.disableCall || context.options.disableNew) return undefined;

    const callee = evalExpression(exp.callee, context);
    const arugments = exp.arguments.map((arg) => evalExpression(arg, context));
    return new callee(...arugments);
  } catch (e) {
    throw wrapJSXError(e, exp, context);
  }
};

export const evalObjectExpression = (exp: ESTree.ObjectExpression, context: JSXContext) => {
  const object: Record<any, any> = {};
  exp.properties.forEach((property) => {
    evalObjectLiteralElementLike(object, property, context);
  });
  return object;
};

export const evalSequenceExpression = (exp: ESTree.SequenceExpression, context: JSXContext) => {
  return exp.expressions.reduce((_, e) => evalExpression(e, context), undefined);
};

export const evalSpreadElement = (exp: ESTree.SpreadElement, context: JSXContext) => {
  return evalExpression(exp.argument, context);
};

export const evalSuper = (_: ESTree.Super, context: JSXContext) => {
  const ctor = context.resolveThis().constructor;
  return ctor.super;
};

export const evalTaggedTemplateExpression = (exp: ESTree.TaggedTemplateExpression, context: JSXContext) => {
  const { quasi } = exp;
  const tag = evalExpression(exp.tag, context);
  const quasis = quasi.quasis.map((q) => q.value.cooked);
  const expressions = quasi.expressions.map((e) => evalExpression(e, context));
  return tag(quasis, ...expressions);
};

export const evalTemplateLiteral = (exp: ESTree.TemplateLiteral, context: JSXContext) => {
  return [...exp.expressions, ...exp.quasis]
    .sort((a, b) => (a.start || 0) - (b.start || 0))
    .map((e) => {
      switch (e.type) {
        case 'TemplateElement':
          return e.value.cooked;
        default:
          return evalExpression(e, context);
      }
    })
    .join('');
};

export const evalThisExpression = (_: ESTree.ThisExpression, context: JSXContext) => {
  return context.resolveThis();
};

export const evalUnaryExpression = (exp: ESTree.UnaryExpression, context: JSXContext) => {
  switch (exp.operator) {
    case '+':
      return +evalExpression(exp.argument, context);
    case '-':
      return -evalExpression(exp.argument, context);
    case '~':
      return ~evalExpression(exp.argument, context);
    case '!':
      return !evalExpression(exp.argument, context);
    case 'void':
      return void evalExpression(exp.argument, context);
    // case 'delete': return delete this.evalExpression(expression.argument);
    case 'typeof':
      return typeof evalExpression(exp.argument, context);
    default:
      throw new JSXEvaluateError(`Unknown unary operator: ${exp.operator}`, exp, context);
  }
};

export const evalUpdateExpression = (exp: ESTree.UpdateExpression, context: JSXContext) => {
  const binding = evalBindingPattern(exp.argument, context);
  const current = evalExpression(exp.argument, context);
  switch (exp.operator) {
    case '++':
      return setBinding(binding, current + 1, context);
    case '--':
      return setBinding(binding, current - 1, context);
    default:
      throw new JSXEvaluateError(`Unknown update operator: ${exp.operator}`, exp, context);
  }
};

export const evalYieldExpression = (exp: ESTree.YieldExpression, context: JSXContext) => {
  throw new JSXEvaluateError('yield is not supported', exp, context);
};

// ObjectLiteralElementLike

const evalObjectLiteralElementLike = (object: any, exp: ESTree.ObjectLiteralElementLike, context: JSXContext) => {
  switch (exp.type) {
    case 'MethodDefinition':
      evalMethodDefinition(exp, context);
      break;
    case 'Property': {
      evalProperty(object, exp, context);
      break;
    }
    case 'SpreadElement': {
      Object.assign(object, evalSpreadElement(exp, context));
      break;
    }
  }
};

export const evalProperty = (object: any, exp: ESTree.Property, context: JSXContext) => {
  let key: any;
  if (exp.computed) {
    key = evalExpression(exp.key, context);
  } else {
    switch (exp.key.type) {
      case 'Literal':
        key = evalLiteral(exp.key, context);
        break;
      case 'Identifier':
        key = exp.key.name;
        break;
    }
  }

  const value = ((exp: ESTree.Property['value']) => {
    switch (exp.type) {
      case 'AssignmentPattern':
      case 'ArrayPattern':
      case 'ObjectPattern':
        return undefined;
      default:
        return evalExpression(exp, context);
    }
  })(exp.value);

  switch (exp.kind) {
    case 'init':
      object[key] = value;
      break;
    case 'get':
      Object.defineProperty(object, key, { get: bindFunction(value, object, context) });
      break;
    case 'set':
      Object.defineProperty(object, key, { set: bindFunction(value, object, context) });
      break;
  }
};

/// JSXChild

export const evalJSXChild = (jsx: ESTree.JSXChild, context: JSXContext): JSXNode => {
  switch (jsx.type) {
    case 'JSXEmptyExpression':
      return evalJSXEmptyExpression(jsx, context);
    case 'JSXText':
      return evalJSXText(jsx, context);
    // case 'JSXElement': return evalJSXElement(jsx, context);
    // case 'JSXExpressionContainer': return evalJSXExpressionContainer(jsx, context);
    // case 'JSXFragment': return evalJSXFragment(jsx, context);
    // case 'JSXSpreadChild': return evalJSXSpreadChild(jsx, context);
    default:
      return evalExpression(jsx, context);
  }
};

export const evalJSXElement = (jsx: ESTree.JSXElement, context: JSXContext): JSXElement => {
  const { openingElement } = jsx;
  const [component, properties] = evalExpression(openingElement, context);
  const children = jsx.children.map((child) => evalJSXChild(child, context));

  jsx.closingElement && evalExpression(jsx.closingElement, context);

  const { start: loc } = Object.assign({}, { start: undefined }, jsx.loc);

  return {
    type: 'element',
    component,
    props: properties,
    children,
    loc,
  };
};

export const evalJSXEmptyExpression = (_jsx: ESTree.JSXEmptyExpression, _context: JSXContext): JSXNode => {
  return undefined;
};

export const evalJSXSpreadChild = (jsx: ESTree.JSXSpreadChild, context: JSXContext): JSXFragment | undefined => {
  const { expression } = jsx;
  const fragment = evalJSXFragment(
    {
      type: 'JSXFragment',
      openingFragment: {
        type: 'JSXOpeningFragment',
      },
      closingFragment: {
        type: 'JSXClosingFragment',
      },
      children: [],
    },
    context,
  );

  fragment.children = Array.from(evalJSXExpressionContainer({ type: 'JSXExpressionContainer', expression }, context));
  return fragment;
};

export const evalJSXExpressionContainer = (jsx: ESTree.JSXExpressionContainer, context: JSXContext): any => {
  const { expression } = jsx;
  switch (expression.type) {
    case 'JSXEmptyExpression':
      return evalJSXEmptyExpression(expression, context);
    default:
      return evalExpression(expression, context);
  }
};

export const evalJSXFragment = (jsx: ESTree.JSXFragment, context: JSXContext): JSXFragment => {
  const { openingFragment } = jsx;
  const [, properties] = evalExpression(openingFragment, context);
  const children = jsx.children.map((child) => evalJSXChild(child, context));

  evalExpression(jsx.closingFragment, context);

  const { start: loc } = Object.assign({}, { start: undefined }, jsx.loc);

  return {
    type: 'fragment',
    props: properties,
    children,
    loc,
  };
};

export const evalJSXText = (jsx: ESTree.JSXText, _context: JSXContext): JSXText => {
  return jsx.value;
};

export const evalJSXClosingElement = (_jsx: ESTree.JSXClosingElement, context: JSXContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXClosingFragment = (_jsx: ESTree.JSXClosingFragment, context: JSXContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXOpeningElement = (jsx: ESTree.JSXOpeningElement, context: JSXContext): [JSXComponent, JSXProperties] => {
  const { attributes } = jsx;

  const name = evalJSXTagNameExpression(jsx.name, context);
  const component = context.resolveComponent(name);

  const properties: JSXProperties = {};
  attributes.forEach((attribute) => {
    switch (attribute.type) {
      case 'JSXAttribute': {
        const [key, value] = evalJSXAttribute(attribute, context);
        properties[key] = value;
        break;
      }
      case 'JSXSpreadAttribute': {
        Object.assign(properties, evalJSXSpreadAttribute(attribute, context));
        break;
      }
    }
  });
  if (!context.options.disableKeyGeneration && properties['key'] === undefined) {
    const key = context.keyGenerator.generate();
    properties['key'] = key;
  }

  context.keyGenerator.openingElement();
  if (jsx.selfClosing) context.keyGenerator.closingElement();

  return [component, properties];
};

export const evalJSXOpeningFragment = (_jsx: ESTree.JSXOpeningFragment, context: JSXContext): [undefined, JSXProperties] => {
  const properties: JSXProperties = {};

  if (!context.options.disableKeyGeneration && properties['key'] === undefined) {
    properties['key'] = context.keyGenerator.generate();
  }

  context.keyGenerator.openingElement();
  return [undefined, properties];
};

/// JSXTagNameExpression

export const evalJSXTagNameExpression = (jsx: ESTree.JSXTagNameExpression, context: JSXContext): string => {
  switch (jsx.type) {
    case 'JSXIdentifier':
      return evalJSXIdentifier(jsx, context);
    case 'JSXMemberExpression':
      return evalJSXMemberExpression(jsx, context);
    case 'JSXNamespacedName':
      return evalJSXNamespacedName(jsx, context);
  }
};

export const evalJSXIdentifier = (jsx: ESTree.JSXIdentifier, _context: JSXContext): string => {
  const { name } = jsx;
  return name;
};

export const evalJSXMemberExpression = (jsx: ESTree.JSXMemberExpression, context: JSXContext): string => {
  const { object, property } = jsx;
  return `${evalJSXTagNameExpression(object, context)}.${evalJSXIdentifier(property, context)}`;
};

export const evalJSXNamespacedName = (jsx: ESTree.JSXNamespacedName, context: JSXContext): string => {
  const { namespace, name } = jsx;
  return `${evalJSXTagNameExpression(namespace, context)}:${evalJSXIdentifier(name, context)}`;
};

/// JSXAttribute

export const evalJSXAttribute = (jsx: ESTree.JSXAttribute, context: JSXContext): [string, any] => {
  const name = evalJSXTagNameExpression(jsx.name, context);
  const value = evalJSXAttributeValue(jsx.value, context);
  return [name, value];
};

export const evalJSXSpreadAttribute = (jsx: ESTree.JSXSpreadAttribute, context: JSXContext) => {
  return evalExpression(jsx.argument, context);
};

/// JSXAttributeValue

export const evalJSXAttributeValue = (jsx: ESTree.JSXAttributeValue, context: JSXContext) => {
  if (!jsx) return true;

  switch (jsx.type) {
    case 'JSXIdentifier':
      return evalJSXIdentifier(jsx, context);
    case 'Literal':
      return evalLiteral(jsx, context);
    case 'JSXElement':
      return evalJSXElement(jsx, context);
    case 'JSXFragment':
      return evalJSXFragment(jsx, context);
    case 'JSXExpressionContainer':
      return evalJSXExpressionContainer(jsx, context);
    case 'JSXSpreadChild':
      return evalJSXSpreadChild(jsx, context);
  }
};
