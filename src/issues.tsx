import React from "react";
import { useParams } from "react-router-dom";
import { useIssues } from "./hooks/use-github";
import Issue from "./issue";

type Props = { org: string; type: "repo" | "label"; accessToken: string };

function Issues(props: Props) {
  const { org, type, accessToken } = props;
  const { name } = useParams<{ name: string }>();
  const { loading, issues, htmlUrl } = useIssues(org, name, accessToken, type);

  return (
    <div className="issues">
      <h3 className="repository-name">
        <a href={htmlUrl}>{decodeURIComponent(name)}</a>
      </h3>
      <hr style={{ width: "100%" }} />
      {loading ? (
        <span>loading..</span>
      ) : (
        <>
          {issues.length === 0 ? (
            <h4 className="issue-title">{"No issues found."}</h4>
          ) : (
            <ul className={"issue-list"}>
              {issues.map((issue) => {
                return (
                  <Issue
                    key={issue.id}
                    data={issue}
                    org={org}
                    repo={name}
                    accessToken={accessToken}
                  />
                );
              })}
            </ul>
          )}
          {type === "repo" && (
            <p>
              <a
                href={`https://github.com/${org}/${name}`}
                className="button new-issue"
              >
                {"+ New Issue"}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
export default Issues;
