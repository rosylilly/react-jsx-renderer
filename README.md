# React JSX Renderer

[![javascript](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/javascript.yml/badge.svg)](https://github.com/rosylilly/react-jsx-renderer/actions/workflows/javascript.yml)

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
const hrefFilter = (element) => {
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
    filters={[hrefFilter]}
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
