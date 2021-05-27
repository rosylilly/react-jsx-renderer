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

export class EvaluateContext {
  public readonly options: EvaluateOptions;
  public readonly keyGenerator: KeyGenerator;
  public binding: Binding;
  public components: ComponentsBinding;

  constructor(options: EvaluateOptions) {
    this.options = options;
    this.keyGenerator = new KeyGenerator(options.keyPrefix);

    this.binding = options.binding || {};
    this.components = options.components || {};
  }

  public resolveIdentifier(name: string): any {
    return this.binding[name];
  }

  public resolveComponent(name: string): any {
    const allComponents = Object.assign({}, this.options.disableSearchCompontsByBinding ? {} : this.binding, this.components);

    return name.split('.').reduce<any>((components, part) => {
      return components[part] || part;
    }, allComponents);
  }
}
