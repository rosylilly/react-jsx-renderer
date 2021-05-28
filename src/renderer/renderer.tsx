import { ESTree } from 'meriyah';
import { memo, Ref, useEffect, useMemo, VFC } from 'react';
import { evaluateJSX, EvaluateOptions, parse } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { renderJSX } from './render';

export type JSXFallbackComponent = VFC<{ error: Error }>;

export interface JSXRendererProps extends EvaluateOptions, RenderingOptions {
  code?: string;
  fallbackComponent?: JSXFallbackComponent;
  refNodes?: Ref<JSXNode[]>;
}

const Renderer: VFC<JSXRendererProps> = (props) => {
  const { code, fallbackComponent, refNodes, ...options } = props;
  const { meriyah, debug } = options;
  const Fallback = fallbackComponent ? fallbackComponent : ({ error }) => <>{error.message}</>;

  try {
    debug && console.group('JSXRenderer');
    useEffect(() => {
      if (typeof refNodes === 'function') {
        refNodes(children || []);
      }
    }, [refNodes]);

    const [program, error] = useMemo(() => {
      let program: ESTree.Program | undefined = undefined;
      let error: Error | undefined = undefined;

      try {
        program = parse(code || '', true, { meriyah, debug });
      } catch (e) {
        error = e instanceof Error ? e : new Error(e);
      }
      return [program, error];
    }, [code, meriyah, debug]);
    const children = program ? evaluateJSX(program, options) : [];

    return (
      <>
        {error && <Fallback error={error} />}
        {children.map((child) => renderJSX(child, options))}
      </>
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err);
    return <Fallback error={error} />;
  } finally {
    debug && console.groupEnd();
  }
};
Renderer.displayName = 'JSXRenderer';

export const JSXRenderer = memo(Renderer);
