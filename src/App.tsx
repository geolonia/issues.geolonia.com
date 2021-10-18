import React, {useCallback, useEffect, useState} from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import { useRepositories, useAccessToken } from "./hooks/use-github";
import {Sidebar} from './sidebar'
import LabelMatrix from './label-matrix';
import Issues from "./issues";
import Callback from "./callback";

const ORGANIZATION_NAME = "geolonia";

const LOCAL_STORAGE_PERSISTED_STATE_KEY = 'issues.geolonia.com/sidebarVisibility'

// const closeButtonStyle: React.CSSProperties = {
//   width: '36px',
//   height: '36px',
//   position: 'absolute',
//   top: '60px',
//   left: '340px',
//   display: 'block',
//   zIndex: 9999,
//   cursor: 'pointer',
//   textDecoration: 'none',
//   border: 'none',
//   padding: 0,
//   background: 'none',
// };

function App() {

  // TODO: toggle sidebar
  const [sidebarVisibility] = useState(localStorage.getItem(LOCAL_STORAGE_PERSISTED_STATE_KEY) === 'false' ? false : true)

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

  // const handleClose = useCallback(() => {
  //   setSidebarVisibility(false);
  // }, []);

useEffect(() => {
  clearError()
}, [clearError, repositories.length])

  const handleLogout = useCallback(() => {
    clearCache()
    logout()
  }, [clearCache, logout])

  const activeRepositories = [...repositories]

  activeRepositories.sort((repo1, repo2) => (repo2.issues.length + repo2.pullRequests.length) - (repo1.issues.length + repo1.pullRequests.length));



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
        {
          sidebarVisibility ? <>
            <Sidebar loading={loading} repositories={activeRepositories}></Sidebar>
            {/* <button style={closeButtonStyle} onClick={handleClose}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                <g fill="none" fillRule="evenodd">
                  <circle stroke="#FFF" strokeWidth="2" fill="#D8D8D8" cx="11" cy="11" r="10" />
                  <path d="M11 1C5.5 1 1 5.5 1 11s4.5 10 10 10 10-4.5 10-10S16.5 1 11 1zm4.9 13.5l-1.4 1.4-3.5-3.5-3.5 3.5-1.4-1.4L9.6 11 6.1 7.5l1.4-1.4L11 9.6l3.5-3.5 1.4 1.4-3.5 3.5 3.5 3.5z" fill="#000" fillRule="nonzero" />
                </g>
              </svg>
              </button> */}
          </> :
          <></>
        }

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
              target="_blank" rel="noopener noreferrer"
            >{`${ORGANIZATION_NAME} on GitHub`}</a>
          </li>
          <li>
            <a href="https://github.com/geolonia/issues.geolonia.com"  target="_blank" rel="noopener noreferrer">
              @geolonia/issues.geolonia.com on GitHub
            </a>
          </li>
        </ul>
      </footer>
    </Router>
  );
}

export default App;
