import React, { VFC } from 'react';
import { Link, Route, Switch, useLocation } from 'react-router-dom';
import { Header } from './header';
import { LiveDemo, LiveDemos } from './liveDemo';
import { README } from './readme';

export const Document: VFC = () => {
  const location = useLocation();

  return (
    <>
      <Header />

      <div className="hero is-light block">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">React JSX Renderer</h1>
            <p className="subtitle">A React component for Rendering JSX</p>
          </div>
        </div>
      </div>

      <div className="container block">
        <div className="columns">
          <div className="column is-2">
            <div className="menu">
              <ul className="menu-list">
                <li>
                  <Link to="/" className={location.pathname === '/' ? 'is-active' : ''}>
                    README
                  </Link>
                </li>
              </ul>
              <p className="menu-label">DEMO</p>
              <ul className="menu-list">
                {Object.entries(LiveDemos).map(([name, _]) => (
                  <li key={name}>
                    <Link className={location.pathname === `/demo/${btoa(name)}` ? 'is-active' : ''} to={`/demo/${btoa(name)}`}>
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="column is-10">
            <Switch>
              {Object.entries(LiveDemos).map(([name, props]) => (
                <Route key={`dmeo-${name}`} path={`/demo/${btoa(name)}`}>
                  <LiveDemo {...props} />
                </Route>
              ))}
              <Route path="/">
                <README />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
};
