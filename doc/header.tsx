import React, { VFC } from 'react';
import packageJSON from '../package.json';

export const Header: VFC = () => {
  return (
    <div className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item" href="https://rosylilly.github.io/react-jsx-renderer/">
            React JSX Renderer v{packageJSON.version}
          </a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <a className="button is-black" target="_blank" href="https://github.com/rosylilly/react-jsx-renderer">
                <strong>View on GitHub</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
