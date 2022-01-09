import { ESTree } from 'meriyah';
import React, { createContext, FC, memo, Ref, useContext, useEffect, useMemo, VFC } from 'react';
import { evaluate, evaluateJSX, EvaluateOptions, parse, ParseOptions } from '../evaluate';
import { JSXNode } from '../types';
import { RenderingOptions } from './options';
import { renderJSX } from './render';

export interface JSXNodeRendererProps extends RenderingOptions {
  /**
   * JSX nodes
   */
  nodes: JSXNode[];
}

const JSXNodeRenderer: VFC<JSXNodeRendererProps> = (props: JSXNodeRendererProps) => {
  const contextOptions = useContext(JSXRendererContext);
  const { nodes, ...options } = Object.assign({}, contextOptions, props);

  return <>{nodes.map((node) => renderJSX(node, options))}</>;
};
JSXNodeRenderer.displayName = 'JSXNodeRenderer';

export { JSXNodeRenderer };
export { JSXRenderer };

export interface JSXRendererProps extends ParseOptions, EvaluateOptions, Omit<JSXNodeRendererProps, 'nodes'> {
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

  /**
   * Rendering Component name(optional)
   */
  component?: string;

  /**
   * Rendering component props(optional)
   */
  componentProps?: Record<string, any>;
}

export type JSXFallbackComponent = VFC<{ error: Error } & JSXRendererProps>;

const DefaultJSXFallbackComponent: JSXFallbackComponent = (props) => {
  const { error, debug } = props;
  debug && console.error(error);

  return <>{error.message}</>;
};
DefaultJSXFallbackComponent.displayName = 'DefaultJSXFallbackComponent';

const JSXRenderer: VFC<JSXRendererProps> = memo((props: JSXRendererProps) => {
  const contextOptions = useContext(JSXRendererContext);
  const { code, fallbackComponent, refNodes, component, componentProps, ...options } = Object.assign({}, contextOptions, props);
  const { meriyah, debug } = options;
  const Fallback = fallbackComponent ? fallbackComponent : DefaultJSXFallbackComponent;

  let nodes: JSXNode[] = [];

  debug && console.group('JSXRenderer');

  const [program, error] = useMemo<[ESTree.Program, undefined] | [undefined, Error]>(() => {
    try {
      const program = parse(code || '', { meriyah, debug, forceExpression: !component });
      return [program, undefined];
    } catch (e) {
      const error = e as Error;
      return [undefined, error];
    }
  }, [code, meriyah, debug]);

  useEffect(() => {
    if (typeof refNodes === 'function') refNodes(nodes);
  }, [refNodes, program]);

  try {
    if (program) {
      if (component) {
        const context = evaluate(program, options);
        if (typeof context.exports[component] === 'function') {
          nodes = [{ type: 'element', component: context.exports[component], props: componentProps || {}, children: [] }];
        } else {
          nodes = [];
        }
      } else {
        nodes = evaluateJSX(program, options);
      }
    } else {
      throw error;
    }

    return <JSXNodeRenderer {...options} nodes={nodes} />;
  } catch (err) {
    const error = err;

    return <Fallback {...props} error={error} />;
  } finally {
    debug && console.groupEnd();
  }
});
JSXRenderer.displayName = 'JSXRenderer';

const JSXRendererContext = createContext<JSXRendererProps>({});

export const JSXRendererOptionsProvider: FC<JSXRendererProps> = ({ children, ...props }) => {
  return <JSXRendererContext.Provider value={props}>{children}</JSXRendererContext.Provider>;
};
