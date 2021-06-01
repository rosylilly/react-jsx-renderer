import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Document } from './document';
import './index.scss';

const main = () => {
  const root = document.getElementById('root');

  render(
    <HashRouter>
      <Document />
    </HashRouter>,
    root,
  );
};

export default main();
