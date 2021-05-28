import { Options } from '../types';
import { JSXElementFilter, JSXFragmentFilter, JSXTextFilter } from './filter';

export interface RenderingOptions extends Options {
  elementFilters?: JSXElementFilter[];
  fragmentFilters?: JSXFragmentFilter[];
  textFilters?: JSXTextFilter[];

  /**
   * When this option is enabled, non-existent HTML elements will not be rendered.
   */
  disableUnknownHTMLElement?: boolean;
}
