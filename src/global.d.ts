declare namespace Geolonia {
  type Repository = {
    isArchived: boolean;
    name: name;
    updatedAt: string;
    isPrivate: string;
    openIssuesCount: number;
  };

  type Issue = {
    htmlUrl: string;
    id: number;
    title: string;
    labels: Label[];
    state: "open" | "close";
    body: string;
    createdAt: string;
    updatedAt: string;
    number: number;
    type: "issue";
    assignees: { login: string }[];
  };

  type Pull = {
    htmlUrl: string;
    id: number;
    title: string;
    labels: Label[];
    state: "open" | "close";
    body: string;
    createdAt: string;
    updatedAt: string;
    number: number;
    type: "pull";
    assignees: { login: string }[];
  };
  type Label = { name: string; color: string };
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: string;
    readonly REACT_APP_GITHUB_OAUTH_APP_CLIENT_ID: string;
  }
}
