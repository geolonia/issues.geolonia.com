import parseLinkHeader from "parse-link-header";
const endpoint = "https://api.github.com";

const githubPagenation = async function (
  initialUrl: string,
  headers: { [key: string]: string } = {}
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
    result.push(data);

    url = nextUrl;
  } while (url);

  return result.flat();
};

export const listRepositories = async (organization: string) => {
  let url: string = `${endpoint}/orgs/${organization}/repos`;

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
  let url: string = `${endpoint}/repos/${organization}/${reponame}/issues`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    // Authorization: `bearer ${accessToken}`,
  };

  const data = await githubPagenation(url, headers);
  console.log(data);
  return data.map(
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
};
