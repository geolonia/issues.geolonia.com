import React, { useMemo } from 'react'
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
  issueOrPull: IssueOrPull,
}

const iconStyle: React.CSSProperties = {
  position: "relative",
  top: 3,
};

export const IssueCard: React.FC<Props> = (props) => {
  const {
    issueOrPull: { isPull, isDraft, url, title, bodyText, number, updatedAt, createdAt, assignees, labels },
  } = props
  const match = url.match(/^https:\/\/github.com\/(.*)\/(.*)\/(issues|pulls)\/[0-9]*/)
  const reponame = match ? `${match[1]}/${match[2]}` : ''

  const bodyTextLines = useMemo(() => (bodyText || '' /* fallback for prev version */)
    .split('\n')
    .map((line, index) => ({ line, key: index })), [bodyText])

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
        <a href={url} target="_blank" rel="noopener noreferrer">
          {`${title} #${number}`}
          <ExternalIcon
            fontSize={"14"}
            style={{ marginLeft: 2, ...iconStyle }}
            color={"gray"}
          />
        </a>
        <strong style={{marginLeft: '.5em'}}>{reponame}</strong>
      </h4>

      <dl className={'assignees-list'}>
            <dt>{'updated'}</dt>
            <dd>{dayjs(updatedAt).fromNow()} ({dayjs(updatedAt).format('YYYY-MM-DD')})</dd>
      </dl>
      <dl className={'assignees-list'}>
            <dt>{'created'}</dt>
            <dd>{dayjs(createdAt).fromNow()} ({dayjs(createdAt).format('YYYY-MM-DD')})</dd>
      </dl>
      {
        assignees.length > 0 &&
        <dl className={'assignees-list'}>
            <dt>{'assignees'}</dt>
            <dd>{assignees.map(assignee => assignee.login).join(' ,')}</dd>
        </dl>
      }
      {bodyTextLines.length > 0 && <p>
        {bodyTextLines.map(({line, key}) => <>{line}<br /></>)}
        </p>}
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