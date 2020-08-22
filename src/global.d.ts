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
    updatedAt: string;
    number: string;
  };
  type Label = { name: string; color: string };
}
