import React from 'react'
import { Link } from "react-router-dom";
import { IssueOrPull } from 'api/github'
// @ts-ignore
import PullIcon from "react-ionicons/lib/MdGitPullRequest";
// @ts-ignore
import IssueIcon from "react-ionicons/lib/MdInformationCircle";
// @ts-ignore
import ExternalIcon from "react-ionicons/lib/MdOpen";
import { blackOrWhite } from "./utils/color";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type Props = {
	issueOrPull: IssueOrPull
}

const iconStyle: React.CSSProperties = {
  position: "relative",
  top: 3,
};

const assigneeListStyle: React.CSSProperties = {
  padding: 0,
}

const assigneeListItemStyle: React.CSSProperties = {
  listStyle: 'none',
}

export const IssueCard: React.FC<Props> = (props) => {
	const { issueOrPull: {isPull, isDraft, url, title, number, updatedAt, assignees, labels} } = props
	return <div className={'label-matrix-issue-card'}>
		<h4 className="issue-title">
		{isPull ? (
		<PullIcon
		fontSize={"14"}
		style={{ marginRight: 2, ...iconStyle }}
		color={"gray"}
		/>
		) : (
		<IssueIcon
		fontSize={"14"}
		style={{ marginRight: 2, ...iconStyle }}
		color={"gray"}
		/>
		) }
        {isDraft && <span className="draft-label">{"draft"}</span>}
        <a href={url}>
          {`${title} #${number}`}
          <ExternalIcon
            fontSize={"14"}
            style={{ marginLeft: 2, ...iconStyle }}
            color={"gray"}
          />
        </a>
      </h4>
      {/* <p><small>{repoIdentifier}</small></p> */}
      <p>{dayjs(updatedAt).fromNow()}</p>
      {
        assignees.length > 0 && <ul style={assigneeListStyle}>
          {assignees.map(assignee => <li key={assignee.login} style={assigneeListItemStyle}>
            {assignee.login}
          </li>)}
        </ul>
      }
      <ul className="label-list">
        {labels.map((label) => (
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
	</div>
}