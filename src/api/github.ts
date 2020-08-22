import parseLinkHeader from "parse-link-header";

const apiEndpoint = "https://api.github.com";
const htmlEndpoint = "https://github.com";

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

export const listRepositories = async (
  organization: string,
  accessToken: string
) => {
  let url: string = `${apiEndpoint}/orgs/${organization}/repos`;

  const headers = accessToken
    ? {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

  const data = await githubPagenation(url, headers);

  return data.map(
    ({
      archived: isArchived,
      name,
      updated_at: updatedAt,
      private: isPrivate,
      open_issues_count: openIssuesCount,
    }) =>
      (({
        isArchived,
        name,
        updatedAt,
        isPrivate,
        openIssuesCount,
      } as unknown) as Geolonia.Repository)
  );
};

export const listIssues = async (
  organization: string,
  reponame: string,
  accessToken: string
) => {
  const path = `repos/${organization}/${reponame}/issues`;
  const url = `${apiEndpoint}/${path}`;
  const htmlUrl = `${htmlEndpoint}/${organization}/${reponame}`;

  const headers = accessToken
    ? {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

  const requestResult = await githubPagenation(url, headers);
  const data = requestResult.map(
    ({
      html_url: htmlUrl,
      id,
      title,
      labels,
      state,
      body,
      number,
      updated_at: updatedAt,
    }) =>
      (({
        htmlUrl,
        id,
        title,
        labels,
        state,
        body,
        number,
        updatedAt,
      } as unknown) as Geolonia.Issue)
  );
  return { data, htmlUrl };
};

export const listLabeledIssues = async (
  organization: string,
  name: string,
  accessToken: string
) => {
  const query = `org:${organization}+label:"${name}"+is:open`;
  const path = `search/issues?q=${query}`;
  const url = `${apiEndpoint}/${path}`;
  const htmlUrl = `${htmlEndpoint}/search?q=${query + "+type:issue"}`;

  const headers = accessToken
    ? {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

  const requestResult = await githubPagenation(
    url,
    headers,
    (result: any) => result.items
  );

  const data = requestResult.map(
    ({
      html_url: htmlUrl,
      id,
      title,
      labels,
      state,
      body,
      number,
      updated_at: updatedAt,
    }) =>
      (({
        htmlUrl,
        id,
        title,
        labels,
        state,
        body,
        number,
        updatedAt,
      } as unknown) as Geolonia.Issue)
  );
  return { data, htmlUrl };
};
