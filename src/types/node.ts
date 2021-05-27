import { ComponentType, ExoticComponent } from "react";

export type JSXComponent = string | ComponentType<any> | ExoticComponent<any>

export type JSXProperties = Record<string, any>;

export interface JSXChild {
  properties: JSXProperties;
  children: JSXNode[];
}

export interface JSXElement extends JSXChild {
  type: 'element';
  component: JSXComponent;
};

export interface JSXFragment extends JSXChild {
  type: 'fragment';
};

export type JSXText = string | number;

export type JSXNode = JSXElement | JSXFragment | JSXText | boolean | null | undefined
