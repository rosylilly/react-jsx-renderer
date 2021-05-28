import { ESTree } from 'meriyah';
import { Binding, ComponentsBinding } from '../types/binding';
import { EvaluateOptions } from './options';

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
  public readonly self: any;
  private variables: Map<string, Variable>;

  constructor(self: any, init: Record<string, any> = {}) {
    this.self = self;
    this.variables = new Map();
    for (const [key, value] of Object.entries(init)) {
      const variable = new Variable('const');
      variable.value = value;
      this.variables.set(key, variable);
    }
  }

  public has(name: string): boolean {
    return this.variables.has(name);
  }

  public get(name: string): any {
    return this.variables.get(name);
  }

  public define(kind: VariableKind, name: string) {
    this.variables.set(name, new Variable(kind));
  }

  public set(name: string, value: any) {
    const variable = this.variables.get(name);
    if (!variable) return;
    variable.value = value;
  }
}

const systemVariables = {
  undefined: undefined,
  null: null,
  true: true,
  false: false,
} as const;

export class EvaluateContext {
  public readonly options: EvaluateOptions;
  public readonly keyGenerator: KeyGenerator;
  public readonly binding: Binding;
  public readonly components: ComponentsBinding;
  public readonly stacks: Stack[];
  public readonly exports: Record<string, any>;

  constructor(options: EvaluateOptions) {
    this.options = options;
    this.keyGenerator = new KeyGenerator(options.keyPrefix);

    this.binding = options.binding || {};
    this.components = options.components || {};

    this.stacks = [new Stack(undefined, systemVariables), new Stack(undefined, options.binding || {})];
    this.exports = {};
  }

  public get stack() {
    return this.stacks[this.stacks.length - 1];
  }

  public pushStack(self: any) {
    this.stacks.push(new Stack(self));
  }

  public popStack() {
    this.stacks.pop();
  }

  public defineVariable(kind: VariableKind, name: string) {
    if (this.stack) {
      this.stack.define(kind, name);
    }
  }

  public setVariable(name: string, value: any) {
    const variable = this.resolveIdentifier(name);
    if (variable) {
      variable.value = value;
    }
  }

  public resolveThis(): any {
    return this.stack ? this.stack.self : undefined;
  }

  public resolveIdentifier(name: string): Variable {
    const stack = this.stacks.find((stack) => stack.has(name));
    return stack ? stack.get(name) : undefined;
  }

  public resolveComponent(name: string): any {
    const allComponents = Object.assign({}, this.options.disableSearchCompontsByBinding ? {} : this.binding, this.components);

    return name.split('.').reduce<any>((components, part) => {
      return components[part] || part;
    }, allComponents);
  }

  public export(name: string, value: any) {
    this.exports[name] = value;
  }
}
