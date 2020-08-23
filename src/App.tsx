import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import { useRepositories, useAccessToken } from "./hooks/use-github";

import Issues from "./issues";
import Callback from "./callback";

function App() {
  const {
    accessToken,
    requestAccessToken,
    githubOAuthEndpoint,
    logout,
  } = useAccessToken();

  const { loading, repositories } = useRepositories("geolonia", accessToken);

  const activeRepositories = repositories
    .filter((repository) => !repository.isArchived)
    .sort((repo1, repo2) => repo2.openIssuesCount - repo1.openIssuesCount);

  return (
    <Router>
      <header className="header">
        <h1 className="app-name">
          <Link to="/">@geolonia/ops</Link>
        </h1>
        {!!accessToken ? (
          <Link className="button" to="/" onClick={logout}>
            {"logout"}
          </Link>
        ) : (
          <a className="button" href={githubOAuthEndpoint}>
            GitHubでログイン
          </a>
        )}
      </header>

      <div className="container">
        <section className="sidebar">
          {loading ? (
            <span>loading...</span>
          ) : (
            <ul className="repositories">
              {activeRepositories.map((repository) => {
                const { name, openIssuesCount, isPrivate } = repository;
                return (
                  <li key={name} className="repo-item">
                    <Link className="repo-link" to={`/repos/${name}`}>
                      {`${name} (${openIssuesCount})`}{" "}
                      {isPrivate && (
                        <span className="private-label">private</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="body">
          <Switch>
            <Route exact path="/repos/:name">
              <Issues
                org="geolonia"
                type="repo"
                accessToken={accessToken}
              ></Issues>
            </Route>
            <Route exact path="/labels/:name">
              <Issues
                org="geolonia"
                type="label"
                accessToken={accessToken}
              ></Issues>
            </Route>
            <Route exact path="/login/callback">
              <Callback requestAccessToken={requestAccessToken}></Callback>
            </Route>
          </Switch>
        </section>
      </div>
    </Router>
  );
}

export default App;
