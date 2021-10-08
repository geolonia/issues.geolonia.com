import { TransformedResp } from 'api/github'
import React, { useState, useEffect } from 'react'
// @ts-ignore
import PullIcon from "react-ionicons/lib/MdGitPullRequest";
// @ts-ignore
import IssueIcon from "react-ionicons/lib/MdInformationCircle";
// @ts-ignore
import ExternalIcon from "react-ionicons/lib/MdOpen";

type Props = {
	repositories: TransformedResp['repositories'];
	colIdentifier: string;
	rowIdentifier: string;
}

const issueListStyle: React.CSSProperties = {
	paddingInlineStart: '1em',
}

const issueListItemStyle: React.CSSProperties = {
	listStyle: 'none',
}

const iconStyle: React.CSSProperties = {
	position: "relative",
	top: 3,
};

type GitHubLabelMatrix = Record<string, Record<string, (TransformedResp['repositories'][number]['issues'][number] | TransformedResp['repositories'][number]['pullRequests'][number])[]>>

export const LabelMatrix: React.FC<Props> = (props) => {
	const { repositories, colIdentifier, rowIdentifier } = props
	const [matrix, setMatrix] = useState<GitHubLabelMatrix | null>(null)


	useEffect(() => {
		if(!repositories) return
		const nextMatrix = repositories.reduce<GitHubLabelMatrix>((prev, repository) => {
			[
				...repository.issues,
				...repository.pullRequests,
			].forEach((issueOrPull) => {
			const parsedLabels = issueOrPull.labels
				.map(label => label.name.split(':').map(flagment => flagment.trim()))
			const column = parsedLabels.find(([key]) => key.toLowerCase() === colIdentifier.toLowerCase())
			const row = parsedLabels.find(([key]) => key.toLowerCase() === rowIdentifier.toLowerCase())
			if(column && row) {
				const colValue = column[1].toLowerCase()
				const rowValue = row[1].toLowerCase()
				if(!prev[colValue]) {
					prev[colValue] = {}
				}
				if(!prev[colValue][rowValue]) {
					prev[colValue][rowValue] = []
				}
				prev[colValue][rowValue].push(issueOrPull)
			}
			})
			return prev
		}, {})
		setMatrix(nextMatrix)
	}, [colIdentifier, repositories, rowIdentifier])

	if(!matrix) return <>{'loading'}</>

	// TODO: key: value で選択できるように一般化
	return <>
	<h2>Priority Matrix</h2>
	<table className={'label-matrix-table'}>
		<tbody>
		{
			['urgent', 'large', 'middle', 'small'].map(impact => <tr className="label-matrix-row" key={impact}>
				<th className="label-matrix-col">Impact: {impact}</th>
				{['long', 'middle', 'short'].map(time => {
					const issueOrPulls = (matrix[impact] || {})[time] || []
					return <td className="label-matrix-col" key={`${impact}/${time}`}>
						<ul style={issueListStyle}>
						{issueOrPulls.map(issueOrPull => <li style={issueListItemStyle} key={issueOrPull.number}>
							{issueOrPull.isPull  ? (
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
							)}
							{issueOrPull.isDraft && <span className="draft-label">{"draft"}</span>}
							<a href={issueOrPull.url}>
								{`${issueOrPull.title} #${issueOrPull.number}`}
								<ExternalIcon
								fontSize={"14"}
								style={{ marginLeft: 2, ...iconStyle }}
								color={"gray"}
								/>
								</a>
						</li>)}
						</ul>
					</td>
				})}
			</tr>)
		}
		</tbody>
		<tfoot>
		<tr>
			<th className="label-matrix-col"></th>
			<th className="label-matrix-col">Time: long</th>
			<th className="label-matrix-col">Time: middle</th>
			<th className="label-matrix-col">Time: short</th>
		</tr>
		</tfoot>
	</table></>
}

export default LabelMatrix