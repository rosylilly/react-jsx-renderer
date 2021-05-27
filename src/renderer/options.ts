import { JSXElementFilter, JSXFragmentFilter, JSXTextFilter } from "./filter";

export interface RenderingOptions {
  disableUnknownHTMLElement?: boolean;

  elementFilters?: JSXElementFilter[];
  fragmentFilters?: JSXFragmentFilter[];
  textFilters?: JSXTextFilter[];
}
