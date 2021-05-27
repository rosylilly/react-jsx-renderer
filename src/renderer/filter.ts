import { JSXElement, JSXFragment, JSXText } from "../types";

export type JSXElementFilter = (node: JSXElement) => JSXElement | undefined;
export type JSXFragmentFilter = (node: JSXFragment) => JSXFragment | undefined;
export type JSXTextFilter = (node: JSXText) => JSXText | undefined;
