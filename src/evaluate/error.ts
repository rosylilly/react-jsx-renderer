import { ESTree } from 'meriyah';
import { EvaluateContext } from './context';

export class EvaluateError extends Error {
  public readonly node: ESTree.Node;
  public readonly context: EvaluateContext;

  constructor(message: string, node: ESTree.Node, context: EvaluateContext) {
    super(`${message}`);
    this.node = node;
    this.context = context;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvaluateError);
    }
  }
}

export class JSXBreak extends Error {
  public readonly label: string | undefined;

  constructor(label?: string) {
    super('break');
    this.label = label;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvaluateError);
    }
  }
}

export class JSXContinue extends Error {
  public readonly label: string | undefined;

  constructor(label?: string) {
    super('continue');
    this.label = label;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvaluateError);
    }
  }
}

export class JSXReturn extends Error {
  public readonly value: any;

  constructor(value: any) {
    super('return');
    this.value = value;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvaluateError);
    }
  }
}
