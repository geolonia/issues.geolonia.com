import { useEffect, useState } from "react";
import { listIssues, listLabeledIssues, listRepositories } from "../api/github";

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

export const useIssues = (
  org: string,
  name: string,
  type: "repo" | "label"
) => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<Geolonia.Issue[]>([]);
  const [htmlUrl, setHtmlUrl] = useState("");

  useEffect(() => {
    setLoading(true);
    const promise =
      type === "repo" ? listIssues(org, name) : listLabeledIssues(org, name);

    promise.then(({ data, htmlUrl }) => {
      setIssues(data);
      setLoading(false);
      setHtmlUrl(htmlUrl);
    });
  }, [org, name, type]);

  return { loading, issues, htmlUrl };
};
