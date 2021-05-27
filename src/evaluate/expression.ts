import { ESTree } from 'meriyah';
import { EvaluateContext } from './context';
import { JSXComponent, JSXElement, JSXFragment, JSXNode, JSXProperties, JSXText } from '../types/node';
import { EvaluateError } from './error';

export const evalExpression = (exp: ESTree.Expression, context: EvaluateContext): any => {
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
      throw new EvaluateError('Not implemented expression', exp, context);
  }
};

export const evalArrayExpression = (exp: ESTree.ArrayExpression, context: EvaluateContext): Array<any> => {
  return exp.elements.map((element) => (element ? evalExpression(element, context) : null));
};

export const evalArrayPattern = (exp: ESTree.ArrayPattern, context: EvaluateContext) => {
  return exp.elements.map((element) => evalExpression(element, context));
};

export const evalArrowFunctionExpression = (exp: ESTree.ArrowFunctionExpression, context: EvaluateContext) => {
  throw new EvaluateError('arrow function is not supported', exp, context);
};

export const evalAssignmentExpression = (exp: ESTree.AssignmentExpression, context: EvaluateContext) => {
  throw new EvaluateError('assignment is not supported', exp, context);
};

export const evalAwaitExpression = (exp: ESTree.AwaitExpression, context: EvaluateContext) => {
  throw new EvaluateError('await is not supported', exp, context);
};

export const evalBinaryExpression = (exp: ESTree.BinaryExpression, context: EvaluateContext) => {
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
      throw new EvaluateError(`Unknown binary operator: ${exp.operator}`, exp, context);
  }
};

export const evalCallExpression = (exp: ESTree.CallExpression, context: EvaluateContext) => {
  const { callee } = exp;
  const receiver = callee.type === 'MemberExpression' ? evalExpression(callee.object, context) : undefined;
  const method = evalExpression(callee, context) as (...args: any[]) => any;
  const args = exp.arguments.map((arg) => evalExpression(arg, context));
  return method.call(receiver, ...args);
};

export const evalChainExpression = (exp: ESTree.ChainExpression, context: EvaluateContext) => {
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
};

export const evalClassDeclaration = (exp: ESTree.ClassDeclaration, context: EvaluateContext) => {
  throw new EvaluateError('class is not supported', exp, context);
};

export const evalClassExpression = (exp: ESTree.ClassExpression, context: EvaluateContext) => {
  throw new EvaluateError('class is not supported', exp, context);
};

export const evalConditionalExpression = (exp: ESTree.ConditionalExpression, context: EvaluateContext) => {
  return evalExpression(exp.test, context) ? evalExpression(exp.consequent, context) : evalExpression(exp.alternate, context);
};

export const evalFunctionExpression = (exp: ESTree.FunctionExpression, context: EvaluateContext) => {
  throw new EvaluateError('function is not supported', exp, context);
};

export const evalIdentifier = (exp: ESTree.Identifier, context: EvaluateContext) => {
  return context.resolveIdentifier(exp.name);
};

export const evalImport = (exp: ESTree.Import, context: EvaluateContext) => {
  throw new EvaluateError('import is not supported', exp, context);
};

export const evalImportExpression = (exp: ESTree.ImportExpression, context: EvaluateContext) => {
  throw new EvaluateError('import is not supported', exp, context);
};

export const evalLiteral = (exp: ESTree.Literal, _context: EvaluateContext): ESTree.Literal['value'] => {
  return exp.value;
};

export const evalLogicalExpression = (exp: ESTree.LogicalExpression, context: EvaluateContext) => {
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
      throw new EvaluateError(`Unknown logical operator: ${exp.operator}`, exp, context);
  }
};

export const evalMemberExpression = (exp: ESTree.MemberExpression, context: EvaluateContext) => {
  const { object, property } = exp;

  const key = property.type === 'Identifier' ? property.name : property.type === 'PrivateIdentifier' ? property.name : evalExpression(property, context);

  return evalExpression(object, context)[key];
};

export const evalMetaProperty = (exp: ESTree.MetaProperty, context: EvaluateContext) => {
  throw new EvaluateError('meta property is not supported', exp, context);
};

export const evalNewExpression = (exp: ESTree.NewExpression, context: EvaluateContext) => {
  const callee = evalExpression(exp.callee, context);
  const arugments = exp.arguments.map((arg) => evalExpression(arg, context));
  return new callee(...arugments);
};

export const evalObjectExpression = (exp: ESTree.ObjectExpression, context: EvaluateContext) => {
  const object: Record<any, any> = {};
  exp.properties.forEach((property) => {
    switch (property.type) {
      case 'MethodDefinition':
        evalMethodDefinition(property, context);
        break;
      case 'Property': {
        const [key, value] = evalProperty(property, context);

        switch (property.kind) {
          case 'init':
            object[key] = value;
            break;
          case 'get': // TODO: Implement here
          case 'set': // TODO: Implement here
        }
        break;
      }
      case 'RestElement': {
        Object.assign(object, evalRestElement(property, context));
        break;
      }
      case 'SpreadElement': {
        Object.assign(object, evalSpreadElement(property, context));
        break;
      }
    }
  });
  return object;
};

export const evalObjectPattern = (exp: ESTree.ObjectPattern, context: EvaluateContext) => {
  const object: Record<any, any> = {};
  exp.properties.forEach((property) => {
    switch (property.type) {
      case 'MethodDefinition':
        evalMethodDefinition(property, context);
        break;
      case 'Property': {
        const [key, value] = evalProperty(property, context);

        switch (property.kind) {
          case 'init':
            object[key] = value;
            break;
          case 'get': // TODO: Implement here
          case 'set': // TODO: Implement here
        }
        break;
      }
      case 'RestElement': {
        Object.assign(object, evalRestElement(property, context));
        break;
      }
      case 'SpreadElement': {
        Object.assign(object, evalSpreadElement(property, context));
        break;
      }
    }
  });
  return object;
};

export const evalRestElement = (exp: ESTree.RestElement, context: EvaluateContext) => {
  return evalExpression(exp.argument, context);
};

export const evalSequenceExpression = (exp: ESTree.SequenceExpression, context: EvaluateContext) => {
  return exp.expressions.reduce((_, e) => evalExpression(e, context), undefined);
};

export const evalSpreadElement = (exp: ESTree.SpreadElement, context: EvaluateContext) => {
  return evalExpression(exp.argument, context);
};

export const evalSuper = (exp: ESTree.Super, context: EvaluateContext) => {
  throw new EvaluateError('super is not supported', exp, context);
};

export const evalTaggedTemplateExpression = (exp: ESTree.TaggedTemplateExpression, context: EvaluateContext) => {
  const { quasi } = exp;
  const tag = evalExpression(exp.tag, context);
  const quasis = quasi.quasis.map((q) => q.value.cooked);
  const expressions = quasi.expressions.map((e) => evalExpression(e, context));
  return tag(quasis, ...expressions);
};

export const evalTemplateLiteral = (exp: ESTree.TemplateLiteral, context: EvaluateContext) => {
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

export const evalThisExpression = (exp: ESTree.ThisExpression, context: EvaluateContext) => {
  throw new EvaluateError('this is not supported', exp, context);
};

export const evalUnaryExpression = (exp: ESTree.UnaryExpression, context: EvaluateContext) => {
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
      throw new EvaluateError(`Unknown unary operator: ${exp.operator}`, exp, context);
  }
};

export const evalUpdateExpression = (exp: ESTree.UpdateExpression, context: EvaluateContext) => {
  switch (exp.operator) {
    case '++': // TODO: Implement
    case '--': // TODO: Implement
    default:
      throw new EvaluateError(`Unknown update operator: ${exp.operator}`, exp, context);
  }
};

export const evalYieldExpression = (exp: ESTree.YieldExpression, context: EvaluateContext) => {
  throw new EvaluateError('yield is not supported', exp, context);
};

// ObjectLiteralElementLike

export const evalMethodDefinition = (exp: ESTree.MethodDefinition, context: EvaluateContext) => {
  throw new EvaluateError('method definition is not supported', exp, context);
};

export const evalProperty = (exp: ESTree.Property, context: EvaluateContext) => {
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

  return [key, value];
};

/// JSXChild

export const evalJSXChild = (jsx: ESTree.JSXChild, context: EvaluateContext): JSXNode => {
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

export const evalJSXElement = (jsx: ESTree.JSXElement, context: EvaluateContext): JSXElement => {
  const { openingElement } = jsx;
  const [component, properties] = evalExpression(openingElement, context);
  const children = jsx.children.map((child) => evalJSXChild(child, context));

  jsx.closingElement && evalExpression(jsx.closingElement, context);

  return {
    type: 'element',
    component,
    props: properties,
    children,
  };
};

export const evalJSXEmptyExpression = (_jsx: ESTree.JSXEmptyExpression, _context: EvaluateContext): JSXNode => {
  return undefined;
};

export const evalJSXSpreadChild = (jsx: ESTree.JSXSpreadChild, context: EvaluateContext): JSXFragment | undefined => {
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

export const evalJSXExpressionContainer = (jsx: ESTree.JSXExpressionContainer, context: EvaluateContext): any => {
  const { expression } = jsx;
  switch (expression.type) {
    case 'JSXEmptyExpression':
      return evalJSXEmptyExpression(expression, context);
    default:
      return evalExpression(expression, context);
  }
};

export const evalJSXFragment = (jsx: ESTree.JSXFragment, context: EvaluateContext): JSXFragment => {
  const { openingFragment } = jsx;
  const [, properties] = evalExpression(openingFragment, context);
  const children = jsx.children.map((child) => evalJSXChild(child, context));

  evalExpression(jsx.closingFragment, context);

  return {
    type: 'fragment',
    props: properties,
    children,
  };
};

export const evalJSXText = (jsx: ESTree.JSXText, _context: EvaluateContext): JSXText => {
  return jsx.value;
};

export const evalJSXClosingElement = (_jsx: ESTree.JSXClosingElement, context: EvaluateContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXClosingFragment = (_jsx: ESTree.JSXClosingFragment, context: EvaluateContext) => {
  context.keyGenerator.closingElement();
  return undefined;
};

export const evalJSXOpeningElement = (jsx: ESTree.JSXOpeningElement, context: EvaluateContext): [JSXComponent, JSXProperties] => {
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

export const evalJSXOpeningFragment = (_jsx: ESTree.JSXOpeningFragment, context: EvaluateContext): [undefined, JSXProperties] => {
  const properties: JSXProperties = {};

  if (!context.options.disableKeyGeneration && properties['key'] === undefined) {
    properties['key'] = context.keyGenerator.generate();
  }

  context.keyGenerator.openingElement();
  return [undefined, properties];
};

/// JSXTagNameExpression

export const evalJSXTagNameExpression = (jsx: ESTree.JSXTagNameExpression, context: EvaluateContext): string => {
  switch (jsx.type) {
    case 'JSXIdentifier':
      return evalJSXIdentifier(jsx, context);
    case 'JSXMemberExpression':
      return evalJSXMemberExpression(jsx, context);
    case 'JSXNamespacedName':
      return evalJSXNamespacedName(jsx, context);
  }
};

export const evalJSXIdentifier = (jsx: ESTree.JSXIdentifier, _context: EvaluateContext): string => {
  const { name } = jsx;
  return name;
};

export const evalJSXMemberExpression = (jsx: ESTree.JSXMemberExpression, context: EvaluateContext): string => {
  const { object, property } = jsx;
  return `${evalJSXTagNameExpression(object, context)}.${evalJSXIdentifier(property, context)}`;
};

export const evalJSXNamespacedName = (jsx: ESTree.JSXNamespacedName, context: EvaluateContext): string => {
  const { namespace, name } = jsx;
  return `${evalJSXTagNameExpression(namespace, context)}:${evalJSXIdentifier(name, context)}`;
};

/// JSXAttribute

export const evalJSXAttribute = (jsx: ESTree.JSXAttribute, context: EvaluateContext): [string, any] => {
  const name = evalJSXTagNameExpression(jsx.name, context);
  const value = evalJSXAttributeValue(jsx.value, context);
  return [name, value];
};

export const evalJSXSpreadAttribute = (jsx: ESTree.JSXSpreadAttribute, context: EvaluateContext) => {
  return evalExpression(jsx.argument, context);
};

/// JSXAttributeValue

export const evalJSXAttributeValue = (jsx: ESTree.JSXAttributeValue, context: EvaluateContext) => {
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
