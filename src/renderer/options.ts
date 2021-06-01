import { Options } from '../types';
import { JSXElementFilter, JSXFragmentFilter, JSXTextFilter } from './filter';
import { UnknownHTMLElementTagNameFunction } from './isUnknownElementTagName';

export interface RenderingOptions extends Options {
  /**
   * List of filters to be applied to elements.
   */
  elementFilters?: JSXElementFilter[];

  /**
   * List of filters to be applied to fragments.
   */
  fragmentFilters?: JSXFragmentFilter[];

  /**
   * List of filters to be applied to text nodes.
   */
  textFilters?: JSXTextFilter[];

  /**
   * When this option is enabled, non-existent HTML elements will not be rendered.
   */
  disableUnknownHTMLElement?: boolean;

  /**
   * Function to determine Unknown HTML Element
   */
  isUnknownHTMLElementTagName?: UnknownHTMLElementTagNameFunction;
}
