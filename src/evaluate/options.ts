import { Options } from 'meriyah';
import { Binding, ComponentsBinding } from '../types/binding';

export interface EvaluateOptions {
  meriyah?: Options;

  binding?: Binding;
  components?: ComponentsBinding;

  disableKeyGeneration?: boolean;
  keyPrefix?: string;

  disableSearchCompontsByBinding?: boolean;
  raiseReferenceError?: boolean;

  debug?: boolean;
}
