import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import { useRepositories } from "./hooks/use-github";

import Issues from "./issues";
import Callback from "./callback";

const GITHUB_OAUTH_ENDPOINT =
  "https://github.com/login/oauth/authorize?client_id=99dfd3a5a943f81d22ba&scope=repo";

function App() {
  const [code, setCode] = React.useState("");
  const { loading, repositories } = useRepositories("geolonia");

  const activeRepositories = repositories.filter(
    (repository) => !repository.isArchived
  );

  return (
    <Router>
      <header className="header">
        <h1 className="app-name">
          <Link to="/">@geolonia/ops</Link>
        </h1>
        <a className="button" href={GITHUB_OAUTH_ENDPOINT}>
          GitHubでログイン
        </a>
      </header>

      <div className="container">
        <section className="sidebar">
          <ul className="repositories">
            {activeRepositories.map((repository) => {
              const { name, openIssuesCount } = repository;
              return (
                <li key={name}>
                  <Link
                    to={`/repos/${name}`}
                  >{`${name} (${openIssuesCount})`}</Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="body">
          <Switch>
            <Route path="/repos/:name">
              <Issues org="geolonia" type="repo"></Issues>
            </Route>
            <Route path="/labels/:name">
              <Issues org="geolonia" type="label"></Issues>
            </Route>
            <Route path="/login/callback">
              <Callback setCode={setCode}></Callback>
            </Route>
          </Switch>
        </section>
      </div>
    </Router>
  );
}

export default App;
