export interface ISystem {
  theme: ETheme;
  language: string;

  themes: ITheme[];
  languages: ILanguage[];
}

export interface ILanguage {
  code: string;
  name: string;
  flag: string;
}

export interface ITheme {
  id: ETheme;
  name: string;
  previewColor: string;
}

export enum ETheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export interface ISystemStatistics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  network: { received: number; transmitted: number };
  pid: number;
}

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
