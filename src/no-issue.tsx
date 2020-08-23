import React from "react";

type Props = {};

function NoIssue(props: Props) {
  return (
    <li className="issue-item">
      <h4 className="issue-title">{"No issues found."}</h4>
    </li>
  );
}

export default NoIssue;
