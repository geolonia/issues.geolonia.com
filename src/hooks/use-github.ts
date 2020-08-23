import { useEffect, useState } from "react";
import {
  listIssues,
  listLabeledIssues,
  listRepositories,
  describePull,
} from "../api/github";

export const useRepositories = (org: string, accessToken: string) => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Geolonia.Repository[]>([]);

  useEffect(() => {
    setLoading(true);
    listRepositories(org, accessToken).then((data) => {
      setRepositories(data);
      setLoading(false);
    });
  }, [accessToken, org]);
  return { loading, repositories };
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
