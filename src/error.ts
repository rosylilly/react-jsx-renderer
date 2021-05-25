import { Expression } from "acorn-jsx";

export class JSXError extends Error {
  public readonly expression: Expression;

  constructor(message: string, expression: Expression) {
    super(`${message}`);
    this.expression = expression;

    Object.defineProperty(this, 'name', { configurable: true, enumerable: false, value: this.constructor.name, writable: false });
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JSXError);
    }
  }
}
