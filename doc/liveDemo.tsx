import React, { FC, MouseEventHandler, useCallback, useState, VFC } from 'react';
import { Binding, JSXElementFilter, JSXNode, JSXRenderer, JSXRendererProps, JSXTextFilter } from '../src';
import { JSXEditor } from './jsxEditor';
import { ObjectEditor } from './objectEditor';

const defaultOptions: JSXRendererProps = {
  debug: true,
  disableCall: false,
  disableNew: false,
  disableUnknownHTMLElement: false,
  disableKeyGeneration: false,
};

export const LiveDemo: VFC<JSXRendererProps> = ({ code, ...props }) => {
  const { binding, components, textFilters, elementFilters, ...options } = Object.assign({}, defaultOptions, props);
  const [state, update] = useState<{ code: string | undefined; binding: Binding | undefined; nodes: JSXNode[]; options: JSXRendererProps }>({ code, binding, options, nodes: [] });
  const refNodes = useCallback(
    (nodes: JSXNode[]) => {
      update((state) => ({ ...state, nodes }));
    },
    [update],
  );

  return (
    <div className="columns">
      <div className="column is-half">
        <div className="block">
          <h2 className="title is-2">JSX</h2>
          <JSXEditor code={code || ''} onChange={(code) => update((props) => ({ ...props, code }))} />
        </div>

        <div className="block">
          <h6 className="title is-6">BINDING</h6>
          <ObjectEditor object={binding || {}} onChange={(binding) => update((s) => ({ ...s, binding }))} expanded={true} />
        </div>

        <div className="block">
          <h6 className="title is-6">OPTIONS</h6>
          <ObjectEditor object={options} onChange={(options) => update((s) => ({ ...s, options }))} expanded={true} />
        </div>
      </div>
      <div className="column is-half">
        <div className="block">
          <h2 className="title is-2">Preview</h2>
          <div className="box content">
            <JSXRenderer
              {...state.options}
              code={state.code}
              binding={state.binding}
              components={components}
              textFilters={textFilters}
              elementFilters={elementFilters}
              refNodes={refNodes}
            />
          </div>
        </div>
        <div className="block">
          <h3 className="title is-3">Nodes</h3>
          <pre className="box">
            <code>{JSON.stringify(state.nodes || [], null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const OnClickAlert: FC<{ message: string }> = ({ message, children }) => {
  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      alert(message);
    },
    [message],
  );

  return (
    <button className="button is-danger" onClick={onClick}>
      {children}
    </button>
  );
};

const BanWordFilter: JSXTextFilter = (node) => {
  const str = `${node}`;
  return str.replaceAll('BAN', '***');
};

const ClassNameFilter: JSXElementFilter = (node) => {
  const { props } = node;
  if (props['class'] && !props['className']) {
    props['className'] = props['class'];
    delete props['class'];
  }

  return { ...node, props };
};

export const LiveDemos: Record<string, JSXRendererProps> = {
  'Hello, World': { code: '<h1 className="title">React JSX Renderer</h1>\n<p>Hello, World</p>' },
  Binding: {
    code: 'Hello, {name}',
    binding: {
      name: 'React',
      number: 1,
      string: 'string',
      boolean: true,
      array: ['one', 'two', 'three'],
      object: { key: 'value' },
    },
  },
  'Custom Component': {
    code: '<OnClickAlert message={"Hello"}>Click Me</OnClickAlert>',
    components: { OnClickAlert },
  },
  'List Rendering': {
    code: '<p>Members: </p>\n<ul>{members.map((member) => <li>{member}</li>)}</ul>',
    binding: {
      members: ['Ada', 'Bob', 'Chris'],
    },
  },
  'Event Handler': {
    code: `<button onClick={() => alert('Clicked')}>Click me</button>`,
    binding: {
      alert,
    },
  },
  'Text Filter': {
    code: '<p>Ban Word filter is BAN replace to ***</p>',
    textFilters: [BanWordFilter],
  },
  'Element Filter': {
    code: '<p><span class="tag">Support</span> class attribute.</p>',
    elementFilters: [ClassNameFilter],
  },
  'Disable Call': {
    code: `<p>Toogle below disableCall option</p>\n<p>{(() => 'Called')()}</p>\n<p>{UPPER_CASE.toLowerCase()}</p>`,
    binding: {
      UPPER_CASE: 'UPPER_CASE',
    },
    disableCall: true,
  },
  'Disable New': {
    code: `<p>Toogle below disableNew option</p>\n<p>{(new Date())?.toISOString()}</p>`,
    binding: {
      Date,
    },
    disableNew: true,
  },
  'Disable Unknown HTMLElement': {
    code: '<p>before</p>\n<unknown>Unknown HTML Element</unknown>\n<p>after</p>',
    disableUnknownHTMLElement: true,
  },
};
