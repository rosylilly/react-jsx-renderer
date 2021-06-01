import React, { VFC } from 'react';
import GitHubButton from 'react-github-btn';
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
            <GitHubButton
              href="https://github.com/rosylilly/react-jsx-renderer"
              data-icon="octicon-star"
              data-size="large"
              data-show-count="true"
              aria-label="Star rosylilly/react-jsx-renderer on GitHub"
            >
              Star
            </GitHubButton>
          </div>
          <div className="navbar-item">
            <GitHubButton href="https://github.com/rosylilly/react-jsx-renderer" data-size="large" aria-label="Watch rosylilly/react-jsx-renderer on GitHub">
              View on GitHub
            </GitHubButton>
          </div>
        </div>
      </div>
    </div>
  );
};
