import CodeMirror from 'codemirror';
import 'codemirror/mode/jsx/jsx';
import React, { useEffect, useRef, VFC } from 'react';

export const JSXEditor: VFC<{ code: string; onChange: (code: string) => void }> = ({ code, onChange }) => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapper.current) return () => {};

    const editor = CodeMirror(wrapper.current, { mode: 'jsx', theme: 'monokai', lineNumbers: true, value: code });
    editor.on('change', (editor) => {
      onChange(editor.getValue());
    });

    return () => {
      if (wrapper.current) {
        wrapper.current.removeChild(editor.getWrapperElement());
      }
    };
  }, [wrapper.current]);

  return <div ref={wrapper} />;
};
