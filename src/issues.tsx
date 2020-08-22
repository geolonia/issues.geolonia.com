import React from "react";
import { useParams } from "react-router-dom";
import { useIssues } from "./hooks/use-github";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);

type OwnProps = { org: string; type: "repo" | "label"; accessToken: string };
type Props = OwnProps;

const blackOrWhite = (hexcolor: string) => {
  if (!hexcolor.startsWith("#")) {
    return "#000000";
  }

  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 < 128 ? "#FFFFFF" : "#000000";
};

export default function Issues(props: Props) {
  const { org, type, accessToken } = props;
  const { name } = useParams<{ name: string }>();
  const { loading, issues, htmlUrl } = useIssues(org, name, accessToken, type);

  return (
    <div className="issues">
      <h3 className="repository-name">
        <a href={htmlUrl}>{decodeURIComponent(name)}</a>
      </h3>
      <hr style={{ width: "100%" }} />
      <ul className="issue-list">
        {issues.map((issue) => (
          <li className="issue-item" key={issue.id}>
            <h4 className="issue-title">
              <a
                href={`https://github.com/${props.org}/${name}/issues/${issue.number}`}
              >
                {issue.title}
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
    </div>
  );
}
