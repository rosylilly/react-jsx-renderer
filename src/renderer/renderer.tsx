import { ESTree } from 'meriyah';
import React, { memo, Ref, useEffect, useMemo, VFC } from 'react';
import { evaluateJSX, EvaluateOptions, parse, ParseOptions } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { renderJSX } from './render';

export type JSXFallbackComponent = VFC<{ error: Error } & JSXRendererProps>;

export interface JSXRendererProps extends ParseOptions, EvaluateOptions, RenderingOptions {
  /**
   * JSX code
   */
  code?: string;

  /**
   * The component that will be displayed instead when an error occurs.
   */
  fallbackComponent?: JSXFallbackComponent;

  /**
   * If you want to receive the parsed result, set a Ref object to this option.
   */
  refNodes?: Ref<JSXNode[]>;
}

const DefaultJSXFallbackComponent: JSXFallbackComponent = (props) => {
  const { error, debug } = props;
  debug && console.error(error);

  return <>{error.message}</>;
};
DefaultJSXFallbackComponent.displayName = 'DefaultJSXFallbackComponent';

const Renderer: VFC<JSXRendererProps> = (props: JSXRendererProps) => {
  const { code, fallbackComponent, refNodes, ...options } = props;
  const { meriyah, debug } = options;
  const Fallback = fallbackComponent ? fallbackComponent : DefaultJSXFallbackComponent;

  let nodes: JSXNode[] = [];

  debug && console.group('JSXRenderer');

  const [program, error] = useMemo(() => {
    let program: ESTree.Program | undefined = undefined;
    let error: Error | undefined = undefined;

    try {
      program = parse(code || '', { meriyah, debug, forceExpression: true });
    } catch (e) {
      error = e instanceof Error ? e : new Error(e);
    }
    return [program, error];
  }, [code, meriyah, debug]);

  useEffect(() => {
    if (typeof refNodes === 'function') refNodes(nodes);
  }, [refNodes, program]);

  try {
    if (program) nodes = evaluateJSX(program, options);

    return (
      <>
        {error && <Fallback error={error} />}
        {nodes.map((node) => renderJSX(node, options))}
      </>
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err);

    return <Fallback {...props} error={error} />;
  } finally {
    debug && console.groupEnd();
  }
};
Renderer.displayName = 'JSXRenderer';

export const JSXRenderer = memo(Renderer);
