import React, { MouseEventHandler, useCallback, useState, VFC } from 'react';

export const ObjectEditor: VFC<{ object: any; onChange: (obj: any) => void; expanded?: boolean }> = ({ object, expanded, onChange }) => {
  const [isExpanded, updateExpanded] = useState(!!expanded);
  const [error, updateError] = useState<Error | undefined>(undefined);
  const [obj, update] = useState(() => object);

  const change = useCallback(
    (o: any) => {
      onChange(o);
      update(() => o);
    },
    [onChange, update],
  );

  const toggleExpand = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      updateExpanded((now) => !now);
    },
    [updateExpanded],
  );

  if (Array.isArray(obj)) {
    return isExpanded ? (
      <table className="table is-fullwidth is-narrow is-array">
        <tbody>
          {obj.map((val, idx) => (
            <tr key={idx}>
              <td>
                <ObjectEditor object={val} onChange={(o) => change([...obj.splice(0, idx), o, ...obj.slice(idx + 1)])} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <button className="button is-small is-fullwidth" onClick={toggleExpand}>
                collapse
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    ) : (
      <span className="button is-fullwidth" onClick={toggleExpand}>
        {'[ ... ]'}
      </span>
    );
  }

  let type = typeof obj;
  if (obj === null) type = 'undefined';

  switch (type) {
    case 'function': {
      const name = obj.name ? `: ${obj.name}` : '';
      return <input key="function" type="text" className="input is-static" readOnly defaultValue={`[Function${name}]`} />;
    }
    case 'boolean':
      return (
        <button
          className={['button', 'is-fullwidth', obj ? 'is-success' : 'is-light'].join(' ')}
          onClick={(e) => {
            e.preventDefault();
            change(!obj);
          }}
        >
          {obj ? 'ON' : 'OFF'}
        </button>
      );
    case 'string':
      return (
        <input
          type="text"
          key="string"
          className="input"
          defaultValue={obj}
          onChange={(e) => {
            change(String(e.target.value));
          }}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          key="number"
          className="input"
          defaultValue={obj}
          onChange={(e) => {
            change(parseInt(e.target.value, 10));
          }}
        />
      );
    case 'object':
      return isExpanded ? (
        <div className="table-container">
          <table className="table is-fullwidth is-narrow">
            <tbody>
              {Object.entries(obj as Record<string, any>)
                .sort(([a], [b]) => (a < b ? -1 : 1))
                .map(([key, val], idx) => (
                  <tr key={`${key}-${idx}`}>
                    <th>
                      <input
                        type="text"
                        className="input"
                        defaultValue={key}
                        onBlur={(e) => {
                          const newObj = { ...obj };
                          const newKey = String(e.target.value);
                          delete newObj[key];
                          newObj[newKey] = val;
                          change(newObj);
                        }}
                      />
                    </th>
                    <td>
                      <ObjectEditor object={val} onChange={(o) => change({ ...obj, [key]: o })} />
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <button
                    className="button is-small is-fullwidth"
                    onClick={(e) => {
                      e.preventDefault();
                      const key = '';
                      const val = null;
                      change({ ...obj, [key]: val });
                    }}
                  >
                    Add
                  </button>
                </td>
              </tr>
              {expanded ? null : (
                <tr>
                  <td colSpan={2}>
                    <button className="button is-small is-fullwidth" onClick={toggleExpand}>
                      collapse
                    </button>
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      ) : (
        <span className="button is-fullwidth" onClick={toggleExpand}>
          {'{ ... }'}
        </span>
      );
    default:
      return (
        <>
          <input
            className={['input is-fullwidth', error ? 'is-danger' : ''].filter(Boolean).join(' ')}
            type="text"
            key="json"
            defaultValue={JSON.stringify(obj)}
            onChange={(e) => {
              try {
                const val = JSON.parse(e.target.value);
                change(val);
                updateError(undefined);
              } catch (err) {
                updateError(err);
              }
            }}
          />
          <p className="help">Input JSON value</p>
        </>
      );
  }
};
