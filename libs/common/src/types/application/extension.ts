export interface IExtension {
  id: number;
  name: string;
  slug: string;
  description: string;

  repositoryUrl: string;
  latestVersion: string;

  installedVersion: string;
  installed: boolean;
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}
