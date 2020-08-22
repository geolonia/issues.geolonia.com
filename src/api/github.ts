import parseLinkHeader from "parse-link-header";
const apiEndpoint = "https://api.github.com";
const htmlEndpoint = "https://github.com";

const githubPagenation = async function (
  initialUrl: string,
  headers: { [key: string]: string } = {},
  process: Function = (x: any) => x
) {
  let url: string | null = initialUrl;
  const result: any[] = [];

  do {
    const { data, nextUrl } = (await fetch(url, { headers }).then((res) => {
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
    console.log(initialUrl, data, process(data));
    result.push(process(data));

    url = nextUrl;
  } while (url);

  return result.flat();
};

export const listRepositories = async (organization: string) => {
  let url: string = `${apiEndpoint}/orgs/${organization}/repos`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    // Authorization: `bearer ${accessToken}`,
  };

  const data = await githubPagenation(url, headers);
  console.log(data);
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

export const listIssues = async (organization: string, reponame: string) => {
  const path = `repos/${organization}/${reponame}/issues`;
  let url: string = `${apiEndpoint}/${path}`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    // Authorization: `bearer ${accessToken}`,
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
  return { data, htmlUrl: `${htmlEndpoint}/${path}` };
};

export const listLabeledIssues = async (organization: string, name: string) => {
  const query = `org:${organization}+label:"${name}"+is:open`;
  const path = `search/issues?q=${query}`;
  let url: string = `${apiEndpoint}/${path}`;
  const htmlUrl = `${htmlEndpoint}/search?q=${query + "+type:issue"}`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    // Authorization: `bearer ${accessToken}`,
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
