import { useCallback, useEffect, useState } from "react";
import {
  TransformedResp,
  listIssues,
  listLabeledIssues,
  describePull,
  listRepositoriesWithGraphql,
  listRepositories,
  getRepositoryWithGraphql,
} from "../api/github";

const LOCAL_STORAGE_PERSISTED_STATE_KEY = 'issues.geolonia.com/repositories'

type Repositories = TransformedResp['repositories']

export const useRepositories = (org: string, accessToken: string) => {
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [repositories, setRepositories] = useState<Repositories>(() => {
    const persisted = localStorage.getItem(LOCAL_STORAGE_PERSISTED_STATE_KEY)
    if(persisted) {
      try {
        return JSON.parse(persisted)
      } catch (error) {
        localStorage.removeItem(LOCAL_STORAGE_PERSISTED_STATE_KEY)
      return [] 
      }
    } else {
      return []
    }
  });
  const [error, setError] = useState<null | any>(null)

  useEffect(() => {
    if(repositories.length === 0) {
      (async () => {
        setLoading(true);

        // GraphQL
        let nextCursor = undefined
        let fetchedRepositories: Repositories = []
        do {
          try {
            // @ts-ignore
          const { info, repositories: currentlyFetchedRepositories } = await listRepositoriesWithGraphql(org, accessToken, nextCursor)
          fetchedRepositories.push(...currentlyFetchedRepositories)
          fetchedRepositories = fetchedRepositories.reduce<Repositories>((prev, item) => {
            if(!prev.find(repository => repository.name === item.name)) {
              prev.push(item)
            }
            return prev
          }, [])
          setRepositories(fetchedRepositories)
          nextCursor = info.hasNextPage ? info.endCursor : null 
          } catch (error) {
            setError(error)
            setLoading(false)
            setIsFetched(true)
            return
          }
        } while (nextCursor);

        // List repositories fallback
        // https://github.com/geolonia/issues.geolonia.com/issues/15
        const listedRepositoryNamesWithGraphql = fetchedRepositories.map(repository => repository.name)
        try {
          const listedRepositoriesWithRest = (await listRepositories(org, accessToken)).map(repository => ({ name: repository.name, isArchived: repository.isArchived }))
          const lackedRepositoryNamesWithGraphql = listedRepositoriesWithRest
            .filter(listedRepositoryWithRest => {
              return (
                !listedRepositoryWithRest.isArchived &&
                listedRepositoryNamesWithGraphql.indexOf(listedRepositoryWithRest.name) === -1
              )
            })
            .map(repository => repository.name)
            console.log(lackedRepositoryNamesWithGraphql)
            const fetchedLackedRepositories = await Promise.all(lackedRepositoryNamesWithGraphql.map(name => getRepositoryWithGraphql(org, name, accessToken)))
            fetchedRepositories.push(...fetchedLackedRepositories)
            setRepositories(fetchedRepositories)

          } catch (error) {
          console.log(error)
          setError(error)
          setLoading(false)
          setIsFetched(true)
          return
        }

        setLoading(false);
        setIsFetched(true);
      })()
    }
  }, [accessToken, org, repositories.length, repositories]);

  useEffect(() => {
   if(isFetched) {
    localStorage.setItem(LOCAL_STORAGE_PERSISTED_STATE_KEY, JSON.stringify(repositories))
   } 
  }, [isFetched, repositories])

  return {
    loading,
    repositories,
    error,
    clearError: useCallback(() => {
      setError(null)
    }, []),
    refetch: useCallback(() => {
      setRepositories([])
      localStorage.removeItem(LOCAL_STORAGE_PERSISTED_STATE_KEY)
    }, []),
    clearCache: useCallback(() => {
      localStorage.removeItem(LOCAL_STORAGE_PERSISTED_STATE_KEY)     
    }, [])
  };
};

export const useIssues = (
  org: string,
  name: string,
  token: string,
  type: "repo" | "label"
) => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<(Geolonia.Issue | Geolonia.Pull)[]>([]);
  const [htmlUrl, setHtmlUrl] = useState("");

  useEffect(() => {
    setLoading(true);
    const promise =
      type === "repo"
        ? listIssues(org, name, token)
        : listLabeledIssues(org, name, token);

    promise.then(({ data, htmlUrl }) => {
      setIssues(data);
      setLoading(false);
      setHtmlUrl(htmlUrl);
    });
  }, [org, name, type, token]);

  return { loading, issues, htmlUrl };
};

export const usePull = (
  org: string,
  repo: string,
  num: number,
  isPull: boolean,
  token: string
) => {
  const [isDraft, setIsDraft] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPull) {
      setLoading(true);
      describePull(org, repo, num, token).then(({ isDraft }) => {
        setIsDraft(isDraft);
        setLoading(false);
      });
    }
  }, [isPull, num, org, repo, token]);

  return { isDraft, loading };
};

export const useAccessToken = () => {
  const clientId = process.env.REACT_APP_GITHUB_OAUTH_APP_CLIENT_ID;
  const LOCAL_STORAGE_KEY = `github_oauth_app_${clientId}_access_token`;

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem(LOCAL_STORAGE_KEY) || ""
  );

  const githubOAuthEndpoint = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  const netlifyBackendEndpoint =
    process.env.NODE_ENV === "development"
      ? "http://localhost:9000/.netlify/functions/access-token"
      : "/.netlify/functions/access-token";

  const requestAccessToken = (code: string) => {
    return fetch(netlifyBackendEndpoint, {
      method: "POST",
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((result) => {
        const { access_token } = result;
        if (access_token) {
          setAccessToken(access_token);
          localStorage.setItem(LOCAL_STORAGE_KEY, result.access_token);
        }
      });
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.href = "/";
  };

  return {
    accessToken,
    requestAccessToken,
    githubOAuthEndpoint,
    logout,
  };
};
