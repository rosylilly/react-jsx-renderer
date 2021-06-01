import 'codemirror/mode/jsx/jsx';
import React, { VFC } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

export const JSXEditor: VFC<{ code: string; onChange: (code: string) => void }> = ({ code, onChange }) => {
  return (
    <CodeMirror
      value={code}
      options={{ mode: 'jsx', theme: 'monokai', lineNumbers: true }}
      onChange={(_, __, code) => {
        onChange(code);
      }}
    />
  );
};
