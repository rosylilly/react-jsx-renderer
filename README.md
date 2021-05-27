# React JSX Renderer

[![demo](https://img.shields.io/badge/LIVE%20DEMO-available-success)](https://aduca.org/react-jsx-renderer/)
[![npm version](https://img.shields.io/npm/v/react-jsx-renderer.svg)](https://www.npmjs.org/package/react-jsx-renderer)
[![CI status](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/javascript.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/javascript.yml)
[![Coverage Status](https://coveralls.io/repos/github/rosylilly/react-jsx-renderer/badge.svg?branch=refs/heads/main)](https://coveralls.io/github/rosylilly/react-jsx-renderer?branch=refs/heads/main)
[![Dependencies Status](https://status.david-dm.org/gh/rosylilly/react-jsx-renderer.svg)](https://david-dm.org/rosylilly/react-jsx-renderer)
[![Install size](https://packagephobia.com/badge?p=react-jsx-renderer)](https://packagephobia.com/result?p=react-jsx-renderer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React Component for Rendering JSX.

## Features

- [x] Rendering JSX as React nodes
- [x] Basic JavaScript syntax and featues
  - Literal (Number, String, Boolean, Array, Object...)
  - Call any methods
  - Binary / Unary expressions
  - Template literal
  - and more...
- [x] Injectable custom React components
- [x] Pass binding variables
- [x] Applicable filters to parsed nodes
  - You can create allowlist / denylist filters to tagName, attributes or properties

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

## License

[MIT License](https://github.com/rosylilly/react-jsx-renderer/blob/main/LICENSE)

## Related projects

- [react-jsx-parser](https://github.com/TroyAlford/react-jsx-parser)
