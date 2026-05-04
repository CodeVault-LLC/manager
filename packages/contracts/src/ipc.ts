export type DesktopAppStageLabel = "Alpha" | "Dev" | "Nightly";
export type DesktopUpdateChannel = "latest" | "nightly";

export interface DesktopAppBranding {
  baseName: string;
  stageLabel: DesktopAppStageLabel;
  displayName: string;
}

export interface DesktopBridge {
  getAppBranding: () => DesktopAppBranding | null;
}

export interface LocalApi {}
