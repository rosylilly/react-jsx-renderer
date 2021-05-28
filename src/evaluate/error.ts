import { ESTree } from 'meriyah';
import { EvaluateContext } from './context';

class JSXError extends Error {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXError);
    }
  }
}

export class JSXEvaluateError extends JSXError {
  public readonly node: ESTree.Node;
  public readonly context: EvaluateContext;

  constructor(message: string, node: ESTree.Node, context: EvaluateContext) {
    const { loc: start } = node.loc || {};
    super([start ? `[${start.line}:${start.column}] ` : '', `${message}`].join(''));
    this.node = node;
    this.context = context;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXEvaluateError);
    }
  }
}

export class JSXBreak extends JSXError {
  public readonly label: string | undefined;

  constructor(label?: string) {
    super('break');
    this.label = label;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXBreak);
    }
  }

  public get isLabeled(): boolean {
    return this.label !== undefined;
  }
}

export class JSXContinue extends JSXError {
  public readonly label: string | undefined;

  constructor(label?: string) {
    super('continue');
    this.label = label;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXContinue);
    }
  }

  public get isLabeled(): boolean {
    return this.label !== undefined;
  }
}

export class JSXReturn extends JSXError {
  public readonly value: any;

  constructor(value: any) {
    super('return');
    this.value = value;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXReturn);
    }
  }
}

export const wrapJSXError = (e: any, node: ESTree.Node, context: EvaluateContext): JSXError => {
  if (e instanceof JSXError) return e;
  const error = e instanceof Error ? e : new Error(e);
  const jsxError = new JSXEvaluateError(error.message, node, context);
  return jsxError;
};
