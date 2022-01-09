import { ESTree } from 'meriyah';
import { Binding, ComponentsBinding } from '../types/binding';
import { AnyFunction, EvaluateOptions } from './options';

class KeyGenerator {
  private readonly prefix: string;
  private readonly counter: number[];

  constructor(prefix?: string) {
    this.prefix = prefix || '';
    this.counter = [0];
  }

  public increment() {
    this.counter[this.counter.length - 1]++;
  }

  public openingElement() {
    this.counter.push(0);
  }

  public closingElement() {
    this.counter.pop();
  }

  public generate(): string {
    this.increment();
    const key = this.counter.map((counter) => counter.toFixed(0)).join('-');
    return this.prefix ? `${this.prefix}-${key}` : key;
  }
}

type VariableKind = ESTree.VariableDeclaration['kind'];

class Variable {
  public readonly kind: VariableKind;
  private init = false;
  private stored: any = undefined;

  constructor(kind: VariableKind) {
    this.kind = kind;
  }

  get value(): any {
    return this.stored;
  }

  set value(val: any) {
    if (this.init && this.kind === 'const') return;
    this.stored = val;
    this.init = true;
  }
}

class Stack {
  public readonly parent: Stack | undefined;
  public readonly self: any;
  private variables: Map<string, Variable>;

  constructor(parent: Stack | undefined, self: any, init: Record<string, any>) {
    this.parent = parent;
    this.self = self;
    this.variables = new Map();
    for (const [key, value] of Object.entries(init)) {
      const variable = new Variable('const');
      variable.value = value;
      this.variables.set(key, variable);
    }
  }

  public get(name: string): Variable | undefined {
    return this.variables.get(name) || (this.parent ? this.parent.get(name) : undefined);
  }

  public define(kind: VariableKind, name: string) {
    this.variables.set(name, new Variable(kind));
  }

  public set(name: string, value: any) {
    const variable = this.variables.get(name);
    if (!variable) return this.parent ? this.parent.set(name, value) : undefined;
    variable.value = value;
  }
}

const systemVariables = {
  undefined: undefined,
  null: null,
  true: true,
  false: false,
} as const;

export class JSXContext {
  public readonly options: EvaluateOptions;
  public readonly keyGenerator: KeyGenerator;
  public readonly binding: Binding;
  public readonly components: ComponentsBinding;
  public readonly allowedFunctions: AnyFunction[];
  public readonly deniedFunctions: AnyFunction[];
  public readonly exports: Record<string, any>;

  public stack: Stack;

  constructor(options: EvaluateOptions) {
    this.options = options;
    this.keyGenerator = new KeyGenerator(options.keyPrefix);

    this.binding = options.binding || {};
    this.components = options.components || {};

    this.allowedFunctions = [...(options.allowedFunctions || [])];
    this.deniedFunctions = [...(options.deniedFunctions || [])];

    this.stack = new Stack(new Stack(undefined, undefined, systemVariables), undefined, this.binding);
    this.exports = {};
  }

  public get stackSize(): number {
    const getStackSize = (stack: Stack, num: number): number => (stack.parent ? getStackSize(stack.parent, num) + 1 : num);

    return getStackSize(this.stack, 1);
  }

  public pushStack(self: any) {
    this.stack = new Stack(this.stack, self, {});
  }

  public popStack() {
    this.stack = this.stack.parent as Stack;
  }

  public defineVariable(kind: VariableKind, name: string) {
    this.stack.define(kind, name);
  }

  public setVariable(name: string, value: any) {
    this.stack.set(name, value);
  }

  public resolveThis(): any {
    return this.stack ? this.stack.self : undefined;
  }

  public resolveIdentifier(name: string): Variable | undefined {
    return this.stack.get(name);
  }

  public resolveComponent(name: string): any {
    const component = this.resolveIdentifier(name);
    if (component) return component.value;

    const allComponents = Object.assign({}, this.options.disableSearchCompontsByBinding ? {} : this.binding, this.components);

    return name.split('.').reduce<any>((components, part) => {
      return components[part] || part;
    }, allComponents);
  }

  public export(name: string, value: any) {
    this.exports[name] = value;
  }

  private _label: string | undefined;
  public get label(): string | undefined {
    const label = this._label;
    this._label = undefined;
    return label;
  }

  public set label(l: string | undefined) {
    this._label = l;
  }

  public isAllowedFunction(func: AnyFunction): boolean {
    return !this.isDeniedFunc(func) && this.isAllowedFunc(func);
  }

  private isAllowedFunc(func: AnyFunction): boolean {
    if (!this.hasAllowedFunctions) return true;

    const match = this.allowedFunctions.reduce((match, f) => match || f === func, false);
    return match;
  }

  private isDeniedFunc(func: AnyFunction): boolean {
    const match = this.deniedFunctions.reduce((match, f) => match || f === func, false);
    return match;
  }

  public get hasAllowedFunctions(): boolean {
    return !!this.options.allowedFunctions;
  }
}
