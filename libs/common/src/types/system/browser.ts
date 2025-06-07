export interface IBrowser {
  id: string;

  name: string;
  description: string;
  icon: string;

  paths: {
    windows: string[];
    darwin: string[];
    linux: string[];
  };

  installed: boolean;
  version: string;

  synced: boolean;

  syncedAt: Date;
  createdAt: Date;
}
