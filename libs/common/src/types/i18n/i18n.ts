import * as en from "../../locales/en.json";

export type Locale = "en" | "no";

type RecursiveKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? `${K}` | `${K}.${RecursiveKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;

export type TranslationKeys = RecursiveKeyOf<typeof en>;
export type Translations = typeof en;
