import { Component, createElement, ReactNode } from "react";
import { JSXElement, JSXEvaluator, JSXEvaluatorOption } from "./evaluator";

export interface JSXRendererProps extends Partial<JSXEvaluatorOption> {
  code: string;
  fallback?: (error: Error) => JSX.Element | undefined;
}

interface State {}

export class JSXRenderer extends Component<JSXRendererProps, State> {
  static displayName = 'JSX';

  constructor(props: Readonly<JSXRendererProps>) {
    super(props);

    this.state = {};
  }

  public render() {
    try {
      const chidlren = this.eval(this.props.code);
      return <>{chidlren}</>;
    } catch(err) {
      const error = err instanceof Error ? err : new Error(err.toString());
      return this.props.fallback ? this.props.fallback(error) : <>{error.message}</>;
    }
  }

  private eval(code: string): ReactNode[] {
    const evaluator = new JSXEvaluator({
      binding: this.props.binding || {},
      components: this.props.components || {},
      filters: this.props.filters || [],
    });
    return evaluator.eval(code).map((element) => this.toReactNode(element))
  }

  private toReactNode(element: JSXElement | string | number | boolean): ReactNode {
    if (typeof element === 'object') {
      return createElement(element.component, element.props, element.children.map((child) => this.toReactNode(child)))
    }
    return element;
  }
}
