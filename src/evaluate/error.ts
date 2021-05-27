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
