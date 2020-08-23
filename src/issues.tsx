import React from "react";
import { useParams } from "react-router-dom";
import { useIssues } from "./hooks/use-github";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
// @ts-ignore
import PullIcon from "react-ionicons/lib/MdGitPullRequest";
// @ts-ignore
import IssueIcon from "react-ionicons/lib/MdInformationCircle";

dayjs.extend(relativeTime);

type Props = { org: string; type: "repo" | "label"; accessToken: string };

const blackOrWhite = (hexcolor: string) => {
  if (!hexcolor.startsWith("#")) {
    return "#000000";
  }

  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 < 128 ? "#FFFFFF" : "#000000";
};

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
        <ul className="issue-list">
          {issues.map((issue) => (
            <li className="issue-item" key={issue.id}>
              <h4 className="issue-title">
                <a
                  href={`https://github.com/${props.org}/${name}/issues/${issue.number}`}
                >
                  {issue.type === "issue" ? (
                    <IssueIcon
                      fontSize={14}
                      style={{ marginRight: 2 }}
                      color={"gray"}
                    ></IssueIcon>
                  ) : (
                    <PullIcon
                      fontSize={14}
                      style={{ marginRight: 2 }}
                      color={"gray"}
                    ></PullIcon>
                  )}
                  {`${issue.title} #${issue.number}`}
                </a>
              </h4>
              <p>{dayjs(issue.updatedAt).fromNow()}</p>
              <ul className="label-list">
                {issue.labels.map((label) => (
                  <li
                    className="label-item"
                    key={label.name}
                    style={{
                      background: `#${label.color}`,
                      color: blackOrWhite(`#${label.color}`),
                    }}
                  >
                    <Link to={`/labels/${encodeURIComponent(label.name)}`}>
                      {label.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default Issues;
