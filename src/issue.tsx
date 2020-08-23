import React from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import PullIcon from "react-ionicons/lib/MdGitPullRequest";
// @ts-ignore
import IssueIcon from "react-ionicons/lib/MdInformationCircle";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { blackOrWhite } from "./utils/color";

import { usePull } from "./hooks/use-github";

dayjs.extend(relativeTime);

type Props = {
  data: Geolonia.Issue | Geolonia.Pull;
  org: string;
  repo: string;
  accessToken: string;
};

function Issue(props: Props) {
  const { data: issue, org, repo, accessToken } = props;
  const { number: num, title, updatedAt } = issue;

  const { isDraft } = usePull(
    org,
    repo,
    num,
    issue.type === "pull",
    accessToken
  );

  return (
    <li className="issue-item" key={issue.id}>
      <h4 className="issue-title">
        {issue.type === "issue" ? (
          <IssueIcon
            fontSize={"14"}
            style={{ marginRight: 2 }}
            color={"gray"}
          ></IssueIcon>
        ) : (
          <PullIcon
            fontSize={"14"}
            style={{ marginRight: 2 }}
            color={"gray"}
          ></PullIcon>
        )}
        {isDraft && <span className="draft-label">{"draft"}</span>}
        <a href={`https://github.com/${org}/${repo}/issues/${num}`}>
          {`${title} #${num}`}
        </a>
      </h4>
      <p>{dayjs(updatedAt).fromNow()}</p>
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
  );
}

export default Issue;
