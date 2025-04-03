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
