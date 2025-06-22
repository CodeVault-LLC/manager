import { IDashboardWidgetItem } from "../dashboard";

export enum ETheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export interface ITheme {
  id: ETheme;
  name: string;
  previewColor: string;
}

export interface ILanguage {
  code: string;
  name: string;
  flag: string;
}

export interface IApplication {
  theme: ETheme;
  language: string;

  themes?: ITheme[];
  languages?: ILanguage[];

  widgets: IDashboardWidgetItem[];
}

export interface IApplicationUpdate {
  appVersion: string;
  avaliableVersion: string;

  isUpdateAvailable: boolean;
  isUpdateFinished: boolean;
}
