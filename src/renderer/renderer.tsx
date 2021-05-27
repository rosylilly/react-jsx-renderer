import { memo, VFC } from "react";
import { evaluateJSX, EvaluateOptions } from "../evaluate";
import { RenderingOptions } from "./options";
import { render } from "./render";

export type JSXFallbackComponent = VFC<{ error: Error }>;

export interface JSXRendererProps extends EvaluateOptions, RenderingOptions {
  code: string;
  fallbackComponent?: JSXFallbackComponent;
}

export const JSXRenderer: VFC<JSXRendererProps> = memo((props) => {
  const { code, ...options } = props;

  try {
    const children = evaluateJSX(code, options);
    return <>{children.map((child) => render(child, options))}</>;
  } catch(err) {
    const error = err instanceof Error ? err : new Error(err);
    const Fallback = options.fallbackComponent ? options.fallbackComponent : ({ error }) => <>{error.message}</>;
    return <Fallback error={error} />
  }
})
