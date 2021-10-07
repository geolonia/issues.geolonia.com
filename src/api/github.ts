import parseLinkHeader from "parse-link-header";

const apiEndpoint = "https://api.github.com";
const htmlEndpoint = "https://github.com";

const getHeader = (accessToken: string) =>
  accessToken
    ? {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

const githubResourceMapping = {
  repository: ({
    assignees,
    archived: isArchived,
    name,
    updated_at: updatedAt,
    private: isPrivate,
    open_issues_count: openIssuesCount,
  }: any) =>
    (({
      assignees,
      isArchived,
      name,
      updatedAt,
      isPrivate,
      openIssuesCount,
    } as unknown) as Geolonia.Repository),

  issue: ({
    assignees,
    html_url: htmlUrl,
    id,
    title,
    labels,
    state,
    body,
    number,
    updated_at: updatedAt,
    pull_request: pullRequest,
  }: any) => {
    const commonProps = {
      assignees,
      htmlUrl,
      id,
      title,
      labels,
      state,
      body,
      number,
      updatedAt,
    };
    if (pullRequest) {
      return { ...commonProps, type: "pull" } as Geolonia.Pull;
    } else {
      return { ...commonProps, type: "issue" } as Geolonia.Issue;
    }
  },

  pull: ({ draft }: any) => ({ isDraft: draft } as { isDraft: boolean }),
};

const githubPagenation = async function (
  initialUrl: string,
  headers: any,
  process: Function = (x: any) => x
) {
  let url: string | null = initialUrl;
  const result: any[] = [];

  do {
    const { data, nextUrl } = (await fetch(url, {
      headers,
      cache: "no-store",
    }).then((res) => {
      if(res.status > 399) { throw new Error(`Error with status ${res.status}`) }
      const linkHeader = res.headers.get("Link");
      let nextUrl = "";
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);

        if (links && links.next) {
          nextUrl = links.next.url;
        }
      }
      return res.json().then((data) => ({ data: data, nextUrl }));
    })) as { data: any; nextUrl: string };
    result.push(process(data));

    url = nextUrl;
  } while (url);

  return result.flat();
};

export const listRepositories = async (org: string, token: string) => {
  let url: string = `${apiEndpoint}/orgs/${org}/repos`;
  const data = await githubPagenation(url, getHeader(token));
  return data.map(githubResourceMapping.repository);
};

export const listIssues = async (org: string, repo: string, token: string) => {
  const path = `repos/${org}/${repo}/issues`;
  const url = `${apiEndpoint}/${path}`;
  const htmlUrl = `${htmlEndpoint}/${org}/${repo}`;
  const requestResult = await githubPagenation(url, getHeader(token));
  const data = requestResult
    .filter((x) => x.message !== "Not Found")
    .map(githubResourceMapping.issue);
  return { data, htmlUrl };
};

export const listLabeledIssues = async (
  org: string,
  name: string,
  token: string
) => {
  const query = `org:${org}+label:"${name}"+is:open`;
  const path = `search/issues?q=${query}`;
  const url = `${apiEndpoint}/${path}`;
  const htmlUrl = `${htmlEndpoint}/search?q=${query + "+type:issue"}`;
  // custom object selector
  const select = (result: any) => result.items;

  const requestResult = await githubPagenation(url, getHeader(token), select);
  const data = requestResult
    .filter((x) => x.message !== "Not Found")
    .map(githubResourceMapping.issue);
  return { data, htmlUrl };
};

export const describePull = (
  org: string,
  name: string,
  num: number,
  token: string
) => {
  const url = `${apiEndpoint}/repos/${org}/${name}/pulls/${num}`;
  return fetch(url, { headers: getHeader(token) as any })
    .then((res) => res.json())
    .then(githubResourceMapping.pull);
};
