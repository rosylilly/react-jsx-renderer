import { ESTree } from 'meriyah';
import { ComponentType, ExoticComponent } from 'react';

export type JSXComponent = string | ComponentType<any> | ExoticComponent<any>;

export type JSXProperties = Record<string, any>;

export interface JSXChild {
  props: JSXProperties;
  children: JSXNode[];
}

export interface JSXElement extends JSXChild {
  type: 'element';
  component: JSXComponent;
  loc?: ESTree.Position;
}

export interface JSXFragment extends JSXChild {
  type: 'fragment';
  loc?: ESTree.Position;
}

export type JSXText = string | number;

export type JSXNode = JSXElement | JSXFragment | JSXText | boolean | null | undefined;
