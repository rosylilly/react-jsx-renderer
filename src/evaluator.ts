import * as Acorn from 'acorn';
import * as AcornJSX from 'acorn-jsx';
import { ComponentType, ExoticComponent, Fragment } from 'react';
import { JSXError } from './error';

type Component = string | ComponentType | ExoticComponent;

interface Components {
  [key: string]: Component | Components;
}

interface Binding {
  [key: string]: any;
}

type Properties = Record<string, any>;

export type JSXElement = {
  component: Component;
  props: Properties;
  children: JSXElement[];
}

export type JSXFilter = (element: JSXElement) => JSXElement | undefined;

export interface JSXEvaluatorOption {
  binding: Binding;
  components: Components;
  filters: JSXFilter[];
}

export class JSXEvaluator {
  private parser: typeof Acorn.Parser;
  private binding: Binding;
  private components: Components;
  private filters: JSXFilter[];
  private elementCounter = 0;

  constructor(option: JSXEvaluatorOption) {
    this.binding = option.binding;
    this.components = option.components;
    this.filters = option.filters;
    this.parser = Acorn.Parser.extend(AcornJSX.default({
      autoCloseVoidElements: true,
    }));
  }

  public parse(jsx: string): Acorn.Node {
    return this.parser.parse(`<root>${jsx}</root>`, { ecmaVersion: 'latest' })
  }

  public eval(jsx: string): JSXElement[] {
    this.elementCounter = 0;
    const root = this.parse(jsx);
    // @ts-ignore
    return root.body[0].expression.children.map((child: any) => this.evalExpression(child)).filter(Boolean);
  }

  private evalExpression(expression: AcornJSX.Expression): any {
    switch (expression.type) {
      case 'JSXAttribute':
        if (expression.value === null) return true;
        return this.evalExpression(expression.value);
      case 'JSXExpressionContainer':
        return this.evalExpression(expression.expression);
      case 'JSXElement':
        return this.evalJSXElement(expression);
      case 'JSXFragment':
        return this.evalJSXElement(expression);
      case 'JSXText':
        return expression.value;
      case 'JSXEmptyExpression':
        return undefined;
      case 'ArrayExpression':
        return expression.elements.map((element) => this.evalExpression(element));
      case 'BinaryExpression':
        return this.evalBinary(expression);
      case 'CallExpression':
        return this.evalCall(expression);
      case 'ConditionalExpression':
        return this.evalExpression(expression.test) ? this.evalExpression(expression.consequent) : this.evalExpression(expression.alternate);
      case 'ExpressionStatement':
        return this.evalExpression(expression.expression);
      case 'Identifier':
        return this.evalIdentifier(expression);
      case 'Literal':
        return expression.value;
      case 'LogicalExpression':
        return this.evalBinary(expression);
      case 'MemberExpression':
        return this.evalMember(expression);
      case 'ObjectExpression':
        return this.evalObject(expression);
      case 'TemplateElement':
        return expression.value.cooked;
      case 'TemplateLiteral':
        return [...expression.expressions, ...expression.quasis].sort((a, b) => a.start - b.start).map((exp) => this.evalExpression(exp)).join('');
      case 'UnaryExpression':
        return this.evalUnary(expression);
      default:
        throw new JSXError(`Unexected expression: ${expression.type}`, expression);
    }
  }

  private evalIdentifier(expression: AcornJSX.Identifier) {
    return this.binding[expression.name];
  }

  private evalUnary(expression: AcornJSX.UnaryExpression) {
    switch (expression.operator) {
      case '+': return +(this.evalExpression(expression.argument));
      case '-': return -(this.evalExpression(expression.argument));
      case '~': return ~(this.evalExpression(expression.argument));
      case '!': return !(this.evalExpression(expression.argument));
      case 'void': return void(this.evalExpression(expression.argument));
      // case 'delete': return delete this.evalExpression(expression.argument);
      // case 'typeof': return typeof this.evalExpression(expression.argument);
      default:
        throw new JSXError(`Unexpected operator: ${expression.operator}`, expression);
    }
  }

  private evalBinary(expression: AcornJSX.BinaryExpression | AcornJSX.LogicalExpression) {
    const left = () => this.evalExpression(expression.left);
    const right = () => this.evalExpression(expression.right);
    switch (expression.operator) {
      // arithmetic operators
      case '+': return left() + right();
      case '-': return left() - right();
      case '/': return left() / right();
      case '*': return left() * right();
      case '%': return left() % right();
      case '**': return left() ** right();
      // relational operators
      case 'in': return left() in right();
      case 'instanceof': return left() instanceof right();
      case '<': return left() < right();
      case '>': return left() > right();
      case '<=': return left() <= right();
      case '>=': return left() >= right();
      // equality operators
      case '==': return left() == right();
      case '!=': return left() != right();
      case '===': return left() === right();
      case '!==': return left() !== right();
      // bitwise shift operators
      case '<<': return left() << right();
      case '>>': return left() >> right();
      case '>>>': return left() >>> right();
      // binary bitwise operators
      case '&': return left() & right();
      case '|': return left() | right();
      case '^': return left() ^ right();
      // binary logical operators
      case '&&': return left() && right();
      case '||': return left() || right();
      case '??': return left() ?? right();
      default:
        throw new JSXError(`Unexpected operator: ${expression.operator}`, expression);
    }
  }

  private evalCall(expression: AcornJSX.CallExpression): any {
    const { callee } = expression;

    const receiver = callee.type === 'MemberExpression' ? this.evalExpression(callee.object) : undefined;
    const method = this.evalExpression(callee) as Function | undefined;

    if (typeof method !== 'function') {
      throw new JSXError(`not a function`, expression);
    } else {
      const args = expression.arguments.map((arg) => this.evalExpression(arg))
      return method.call(receiver, args);
    }
  }

  private evalMember(expression: AcornJSX.MemberExpression): any {
    const { object, property } = expression;
    const key = property.type === 'Identifier' ? property.name : this.evalExpression(property);
    return this.evalExpression(object)[key];
  }

  private evalObject(expression: AcornJSX.ObjectExpression): Record<any, any> {
    const object: Record<any, any> = {};

    expression.properties.forEach((prop) => {
      switch (prop.kind) {
        case 'init': {
          const key = prop.key.type === 'Identifier' ? prop.key.name : this.evalExpression(prop.key);
          const value = this.evalExpression(prop.value);
          object[key] = value;
          break;
        }
        case undefined: {
          Object.assign(object, this.evalExpression(prop.argument));
          break;
        }
      }
    })

    return object;
  }

  private evalJSXElement(expression: AcornJSX.JSXElement | AcornJSX.JSXFragment) {
    const { children } = expression;
    const opening = expression.type === 'JSXElement' ? expression.openingElement : expression.openingFragment;
    const { attributes } = opening;
    const name = expression.type === 'JSXElement' ? this.evalElementName(opening.name) : '';
    const props: Record<string, any> = {};

    const component = this.resolveComponent(name);

    attributes.forEach((attribute: AcornJSX.JSXAttribute | AcornJSX.JSXSpreadAttribute) => {
      switch (attribute.type) {
        case 'JSXAttribute': {
          const name = attribute.name.name;
          const value = this.evalExpression(attribute);
          props[name] = value;
          break;
        }
        case 'JSXSpreadAttribute': {
          Object.assign(props, this.evalExpression(attribute.argument));
          break;
        }
      }
    });
    props['key'] = this.generateKey();

    const element = {
      component,
      props,
      children: children.map((child) => this.evalExpression(child)),
    };

    return this.filters.reduce<JSXElement | undefined>((element, filter) => element ? filter(element) : element, element);
  }

  private evalElementName(name: AcornJSX.JSXIdentifier | AcornJSX.JSXMemberExpression): string {
    if (name.type === 'JSXIdentifier') return name.name;
    return `${this.evalElementName(name.object)}.${this.evalElementName(name.property)}`;
  }

  private resolveComponent(name: string): Component {
    if (name === '') {
      return Fragment;
    }
    const parts = name.split('.');
    const components = Object.assign({}, this.components) as any;
    const tagName = (parts[parts.length - 1] || '').toLowerCase();
    return parts.reduce((components, n) => components ? components[n] : undefined, components) || tagName;
  }

  private generateKey(): string {
    return `key-${this.elementCounter++}`;
  }
}
