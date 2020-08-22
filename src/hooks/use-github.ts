import { useEffect, useState } from "react";
import { listIssues, listRepositories } from "../api/github";

export const useRepositories = (org: string) => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Geolonia.Repository[]>([]);

  useEffect(() => {
    setLoading(true);
    listRepositories(org).then((data) => {
      setRepositories(data);
      setLoading(false);
    });
  }, [org]);
  return { loading, repositories };
};

export const useIssues = (org: string, repo: string) => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<Geolonia.Issue[]>([]);

  useEffect(() => {
    setLoading(true);
    listIssues(org, repo).then((data) => {
      setIssues(data);
      setLoading(false);
    });
  }, [org, repo]);
  return { loading, issues };
};
