import * as meriyah from 'meriyah';
import { Options } from '../types';
import { Binding, ComponentsBinding } from '../types/binding';

export interface ParseOptions extends Options {
  meriyah?: meriyah.Options;
  forceExpression?: boolean;
}

export interface EvaluateOptions extends Options {
  binding?: Binding;
  components?: ComponentsBinding;

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
}
