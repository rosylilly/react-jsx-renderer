import * as meriyah from 'meriyah';
import { Options } from '../types';
import { Binding, ComponentsBinding } from '../types/binding';

export type AnyFunction = (...args: any[]) => any;

export interface ParseOptions extends Options {
  /**
   * Options of parser
   */
  meriyah?: meriyah.Options;

  /**
   * When this option is enabled, always parse as an expression.
   */
  forceExpression?: boolean;
}

export interface EvaluateOptions extends Options {
  /**
   * binding
   */
  binding?: Binding;

  /**
   * components
   */
  components?: ComponentsBinding;

  /**
   * Prefix of generated keys.
   */
  keyPrefix?: string;

  /**
   * When this option is enabled, no key will be generated
   */
  disableKeyGeneration?: boolean;

  /**
   * When this option is enabled, bindings will be excluded from the component search.
   */
  disableSearchCompontsByBinding?: boolean;

  /**
   * When this option is enabled, Call Expression and New Expression will always return undefined.
   */
  disableCall?: boolean;

  /**
   * When this option is enabled, New Expression will always return undefined.
   */
  disableNew?: boolean;

  /**
   * When this option is enabled, access to undefined variables will raise an exception.
   */
  raiseReferenceError?: boolean;

  /**
   * List of functions allowed to be executed.
   *
   * If empty, all functions will be allowed to execute.
   */
  allowedFunctions?: AnyFunction[];

  /**
   * Add user-defined functions to the allowed list.
   */
  allowUserDefinedFunction?: boolean;

  /**
   * List of functions denied to be executed.
   *
   * If empty, all functions will be allowed to execute.
   */
  deniedFunctions?: AnyFunction[];
}
