import React from 'react'
import {TransformedResp} from './api/github' 
import { Link } from "react-router-dom";

type Props = {
	repositories: TransformedResp['repositories'],
  loading: boolean;
}

export const Sidebar: React.FC<Props> = (props) => {
	const {repositories, loading} = props
	const totalIssuesCount = props.repositories.reduce(
		(sum, repo) => sum + repo.issues.length + repo.pullRequests.length,
		0
  );

	return <section className="sidebar">
        {
          <ul className="repositories">
            {repositories.length === 0 ? (
              <li className="repo-item repo-item-head">
                {!loading && "No unarchived repositories seem to exist."}
              </li>
            ) : (
              <>
                <li className="repo-item repo-item-head">{`total (${totalIssuesCount} issues / ${repositories.length} repos)`}</li>
                {repositories.map((repository) => {
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
}