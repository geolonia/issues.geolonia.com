import React, {useCallback, useEffect} from "react";
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

  const { loading, repositories, error, clearError, refetch, clearCache } = useRepositories(
    ORGANIZATION_NAME,
    accessToken
  );

useEffect(() => {
  clearError()
}, [clearError, repositories.length])

  const handleLogout = useCallback(() => {
    clearCache()
    logout()
  }, [clearCache, logout])

  const activeRepositories = [...repositories]

  activeRepositories.sort((repo1, repo2) => (repo2.issues.length + repo2.pullRequests.length) - (repo1.issues.length + repo1.pullRequests.length));

  const totalIssuesCount = activeRepositories.reduce(
    (sum, repo) => sum + repo.issues.length + repo.pullRequests.length,
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
      <p>{'It seems that your request exceeds the GitHub API quota. Please login to continue, or wait for a while.'}</p> :
       <div className="container">
      <section className="sidebar">
        {
          <ul className="repositories">
            {activeRepositories.length === 0 ? (
              <li className="repo-item repo-item-head">
                {!loading && "No unarchived repositories seem to exist."}
              </li>
            ) : (
              <>
                <li className="repo-item repo-item-head">{`total (${totalIssuesCount} issues / ${activeRepositories.length} repos)`}</li>
                {activeRepositories.map((repository) => {
                  const { name, issues, pullRequests, isPrivate, url } = repository;
                  return (
                    <li key={url} className="repo-item">
                      <Link className="repo-link" to={`/repos/${name}`}>
                        {`${name} (${issues.length + pullRequests.length})`}
                        {isPrivate && (
                          <span className="private-label">private</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
          </ul>}
        
      </section>

      <section className="body">
        <Switch>
          <Route exact path="/">
            <LabelMatrix
              repositories={repositories}
              colIdentifier={'impact'}
              rowIdentifier={'time'}
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
    </div>
      }

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
