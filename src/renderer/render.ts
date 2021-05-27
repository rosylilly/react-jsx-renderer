import { createElement, Fragment, ReactNode } from 'react';
import { JSXNode, JSXElement, JSXFragment, JSXText } from '../types';
import { RenderingOptions } from './options';

const unknownElementCache = new Map<string, boolean>();

export const render = (node: JSXNode, options: RenderingOptions): ReactNode => {
  if (node === null) return node;
  if (node === undefined) return node;

  switch (typeof node) {
    case 'boolean':
      return node;
    case 'string':
    case 'number':
      return renderJSXText(node, options);
    default:
      return renderJSXNode(node, options);
  }
};

const renderJSXText = (text: JSXText, options: RenderingOptions): ReactNode => {
  return applyFilter(options.textFilters || [], text);
};

const renderJSXNode = (node: JSXElement | JSXFragment, options: RenderingOptions): ReactNode => {
  switch (node.type) {
    case 'element':
      return renderJSXElement(node, options);
    case 'fragment':
      return renderJSXFragment(node, options);
  }
};

const renderJSXElement = (element: JSXElement, options: RenderingOptions): ReactNode => {
  const filtered = applyFilter(options.elementFilters || [], element);
  if (!filtered) return undefined;

  if (options.disableUnknownHTMLElement && typeof filtered.component === 'string') {
    const { component } = filtered;
    if (!unknownElementCache.has(component)) {
      unknownElementCache.set(component, document.createElement(component) instanceof HTMLUnknownElement);
    }
    if (unknownElementCache.get(component)) return undefined;
  }

  return createElement(filtered.component, filtered.props, ...filtered.children.map((child) => render(child, options)));
};

const renderJSXFragment = (fragment: JSXFragment, options: RenderingOptions): ReactNode => {
  const filtered = applyFilter(options.fragmentFilters || [], fragment);

  if (filtered) {
    return createElement(Fragment, filtered.props, ...filtered.children.map((child) => render(child, options)));
  } else {
    return undefined;
  }
};

const applyFilter = <T extends JSXNode>(filters: ((target: T) => T | undefined)[], node: T): T | undefined => {
  return filters.reduce<T | undefined>((prev, filter) => (prev ? filter(prev) : undefined), node);
};
