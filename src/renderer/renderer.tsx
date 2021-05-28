import { memo, VFC } from 'react';
import { evaluateJSX, EvaluateOptions } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { renderJSX } from './render';

export type JSXFallbackComponent = VFC<{ error: Error }>;

export interface JSXRendererProps extends EvaluateOptions, RenderingOptions {
  code?: string;
  nodes?: JSXNode[];
  fallbackComponent?: JSXFallbackComponent;
}

export const JSXRenderer: VFC<JSXRendererProps> = memo((props) => {
  const { code, nodes, fallbackComponent, ...options } = props;

  try {
    const children = nodes ? nodes : evaluateJSX(code || '', options);
    return <>{children.map((child) => renderJSX(child, options))}</>;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err);
    const Fallback = fallbackComponent ? fallbackComponent : ({ error }) => <>{error.message}</>;
    return <Fallback error={error} />;
  }
});
