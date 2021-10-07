import React, {useCallback} from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import { useRepositories, useAccessToken } from "./hooks/use-github";

import LabelMatrix from './label-matrix';
import Issues from "./issues";
import Callback from "./callback";

const ORGANIZATION_NAME = "geolonia";

function App() {
  const {
    accessToken,
    requestAccessToken,
    githubOAuthEndpoint,
    logout,
  } = useAccessToken();

  const { loading, repositories, error, refetch, clearCache } = useRepositories(
    ORGANIZATION_NAME,
    accessToken
  );

    const handleLogout = useCallback(() => {
      clearCache()
      logout()
    }, [clearCache, logout])

  const activeRepositories = repositories
    .sort((repo1, repo2) => repo2.issues.length - repo1.issues.length);

  const totalIssuesCount = activeRepositories.reduce(
    (sum, repo) => sum + repo.issues.length,
    0
  );

  return (
    <Router>
      <header className="header">
        <h1 className="app-name">
          <Link to="/">Geolonia Issues</Link>
          {loading ?
            <small className="status">{'loading...'}</small> :
            <button className="refetch" onClick={refetch}>refetch</button>
          }
        </h1>
        {!!accessToken ? (
          <Link className="button" to="/" onClick={handleLogout}>
            {"logout"}
          </Link>
        ) : (
          <a className="button" href={githubOAuthEndpoint}>
            Login with GitHub
          </a>
        )}
      </header>
      {error ?
      <p>{error.message}</p> :
      <div className="container">
        <section className="sidebar">
          { error ? 'error': (
            <ul className="repositories">
              {activeRepositories.length === 0 ? (
                <li className="repo-item repo-item-head">
                  {"No unarchived repositories seem to exist."}
                </li>
              ) : (
                <>
                  <li className="repo-item repo-item-head">{`total (${totalIssuesCount})`}</li>
                  {activeRepositories.map((repository) => {
                    const { name, issues, isPrivate } = repository;
                    return (
                      <li key={name} className="repo-item">
                        <Link className="repo-link" to={`/repos/${name}`}>
                          {`${name} (${issues.length})`}
                          {isPrivate && (
                            <span className="private-label">private</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>)}
          
        </section>

        <section className="body">
          <Switch>
            <Route exact path="/">
              <LabelMatrix

              />
            </Route>
            <Route exact path="/repos/:name">
              <Issues
                org={ORGANIZATION_NAME}
                type="repo"
                accessToken={accessToken}
              ></Issues>
            </Route>
            <Route exact path="/labels/:name">
              <Issues
                org={ORGANIZATION_NAME}
                type="label"
                accessToken={accessToken}
              ></Issues>
            </Route>
            <Route exact path="/login/callback">
              <Callback requestAccessToken={requestAccessToken}></Callback>
            </Route>
          </Switch>
        </section>
      </div>}

      <footer className="footer">
        <ul className="footer-menu">
          <li>
            <a
              href={`https://github.com/${ORGANIZATION_NAME}`}
            >{`${ORGANIZATION_NAME} on GitHub`}</a>
          </li>
          <li>
            <a href="https://github.com/geolonia/ops">
              @geolonia/ops on GitHub
            </a>
          </li>
        </ul>
      </footer>
    </Router>
  );
}

export default App;
