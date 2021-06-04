# React JSX Renderer

[![npm (latest)](https://img.shields.io/npm/v/react-jsx-renderer/latest)](https://www.npmjs.org/package/react-jsx-renderer)
[![npm (nightlyt)](https://img.shields.io/npm/v/react-jsx-renderer/nightly)](https://www.npmjs.com/package/react-jsx-renderer/v/nightly)

[![demo](https://img.shields.io/badge/LIVE%20DEMO-available-success)](https://aduca.org/react-jsx-renderer/)
[![Coverage Status](https://codecov.io/gh/rosylilly/react-jsx-renderer/branch/main/graph/badge.svg?token=notleiwHZC)](https://codecov.io/gh/rosylilly/react-jsx-renderer)
[![Dependencies Status](https://status.david-dm.org/gh/rosylilly/react-jsx-renderer.svg)](https://david-dm.org/rosylilly/react-jsx-renderer)
[![Install size](https://packagephobia.com/badge?p=react-jsx-renderer)](https://packagephobia.com/result?p=react-jsx-renderer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![latest](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/latest.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/latest.yml)
[![nightly](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/nightly.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/nightly.yml)
[![build](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/build.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/build.yml)
[![test](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/test.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/test.yml)
[![lint](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/lint.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/lint.yml)

A React Component for Rendering JSX.

## Description

React JSX Renderer is a React Component for rendering JSX to React nodes.

It has a JavaScript Runtime inside, and can execute the user's JSX with controlled behavior.

[Launch Demo](https://aduca.org/react-jsx-renderer/)

## Features

- [x] Rendering JSX as React nodes
- [x] TypeScritpt ready
- [x] Provides CommonJS and ES Modules
- [x] JavaScript syntax and featues
  - without async, await and generator
- [x] Injectable custom React components
- [x] Pass binding variables
- [x] Applicable filters to parsed nodes
  - You can create allowlist / denylist filters to tagName, attributes or properties
- [x] Avoid user's call expressions
- [x] Avoid user's new expressions
- [x] Parse with [meriyah](https://github.com/meriyah/meriyah)

## Installation

1. `npm install -s react-jsx-renderer` (or `yarn add react-jsx-renderer`)
2. Add `import { JSXRenderer } from 'react-jsx-renderer';`
3. `<JSXRenderer code="Hello, World" />` to render `Hello, World`

## Requirements

- **React**: >= 16.0.0

## Options

```typescript
interface ParseOptions {
  /**
   * Options of parser
   */
  meriyah?: meriyah.Options;

  /**
   * When this option is enabled, always parse as an expression.
   */
  forceExpression?: boolean;
}

interface EvaluateOptions {
  /**
   * binding
   */
  binding?: Binding;

  /**
   * components
   */
  components?: ComponentsBinding;

  /**
   * Prefix of generated keys.
   */
  keyPrefix?: string;

  /**
   * When this option is enabled, no key will be generated
   */
  disableKeyGeneration?: boolean;

  /**
   * When this option is enabled, bindings will be excluded from the component search.
   */
  disableSearchCompontsByBinding?: boolean;

  /**
   * When this option is enabled, Call Expression and New Expression will always return undefined.
   */
  disableCall?: boolean;

  /**
   * When this option is enabled, New Expression will always return undefined.
   */
  disableNew?: boolean;

  /**
   * When this option is enabled, access to undefined variables will raise an exception.
   */
  raiseReferenceError?: boolean;

  /**
   * List of functions allowed to be executed.
   *
   * If empty, all functions will be allowed to execute.
   */
  allowedFunctions?: AnyFunction[];

  /**
   * Add user-defined functions to the allowed list.
   */
  allowUserDefinedFunction?: boolean;

  /**
   * List of functions denied to be executed.
   *
   * If empty, all functions will be allowed to execute.
   */
  deniedFunctions?: AnyFunction[];
}

interface RenderingOptions {
  /**
   * List of filters to be applied to elements.
   */
  elementFilters?: JSXElementFilter[];

  /**
   * List of filters to be applied to fragments.
   */
  fragmentFilters?: JSXFragmentFilter[];

  /**
   * List of filters to be applied to text nodes.
   */
  textFilters?: JSXTextFilter[];

  /**
   * When this option is enabled, non-existent HTML elements will not be rendered.
   */
  disableUnknownHTMLElement?: boolean;

  /**
   * Function to determine Unknown HTML Element
   */
  isUnknownHTMLElementTagName?: UnknownHTMLElementTagNameFunction;
}

interface RendererOptions extends {
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
```

## Usage

### Using like a simple HTML template engine

input:

```javascript
import { render } from 'react-dom';
import { JSXRenderer } from 'react-jsx-renderer';

const root = document.getElementById('root');

render(
  <JSXRenderer
    binding={{ name: 'Sho Kusano' }}
    code={'<p>Hello, {name}</p>'}
  />,
  root
);
```

to:

```html
<p>Hello, Sho Kusano</p>
```

### Using JSX with JavaScript expressions

input:

```javascript
render(
  <JSXRenderer
    binding={{
      three: 3,
      seven: 7,
    }}
    code={
      '<p>+ {three + seven}</p>' +
      '<p>- {three - seven}</p>' +
      '<p>bitwise shift {three << seven}</p>'
    }
  />,
  root
);
```

to:

```html
<p>+ 10</p>
<p>- -4</p>
<p>bitwise shift 384</p>
```

### Using JSX with your favorite custom components

```javascript
const Red = ({ children }) => <b style={{ color: 'red' }}>{children}</b>

render(
  <JSXRenderer
    components={{ RedColor: Red }}
    code={'<p><RedColor>red</RedColor></p>'}
  />,
  root
);
```

to:

```html
<p><b style="color: red">red</b></p>
```

### Convert JSX with filters

```javascript
const hrefFilter = (element: JSXElement) => {
  const { props, component, children } = element;
  if (component !== 'a') return element;

  let href = props.href || '';
  if (href.includes('//')) {
    href = secureURLConvert(href); // Add prefix https://secure.url/redirect?url=
  }
  const filteredProps = { ...props, href };
  return { component, children, props: filteredProps };
}

render(
  <JSXRenderer
    elementFilters={[hrefFilter]}
    code={
      '<p><a href="/">root</a></p>' +
      '<p><a href="../">upper directory</a></p>' +
      '<p><a href="subdir">sub directory</a></p>' +
      '<p><a href="https://github.com/">github</a></p>' +
    }
  />,
  root
);
```

to:

```html
<p><a href="/">root</a></p>
<p><a href="../">upper directory</a></p>
<p><a href="subdir">sub directory</a></p>
<p><a href="https://secure.url/redirect?url=https://github.com">github</a></p>
```

### Provide options by context

ex: Server side rendering.

```javascript
import { JSDOM } from 'jsdom';

render(
  <JSXRendererOptionsProvider isUnknownHTMLElement={(tagName) => {
    const { window } = new JSDOM();
    return window.document.createElement(tagName) instanceof window.HTMLUnknownElement;
  }}>
    <JSXRenderer
      code={
        '<p><unknown>Avoid</unknown></p>'
      }
    />
  </JSXRendererOptionsProvider>,
  root
);
```

to:

```html
<p></p>
```

## License

[MIT License](https://github.com/rosylilly/react-jsx-renderer/blob/main/LICENSE)

## Related projects

- [react-jsx-parser](https://github.com/TroyAlford/react-jsx-parser)
