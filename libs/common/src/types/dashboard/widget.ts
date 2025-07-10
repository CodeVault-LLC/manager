export interface IDashboardWidgetItem {
  id: string; // instance ID, can be same as definition ID
  type: string;
  name: string;
  description: string;

  layout: Record<string, { x: number; y: number; w: number; h: number }>;
  static?: boolean;

  settings?: Record<string, any>;
  settingsSchema: Record<string, WidgetSetting>;

  requirements?: WidgetRequirement[]; // e.g. [{ type: 'integration', platform: 'spotify' }]
  locales: string[]; // e.g. ['en-US', 'no-NO']

  active: boolean;
  data?: any;
}

export type WidgetSetting =
  | { type: "boolean"; label: string }
  | { type: "text"; label: string; regex?: string; placeholder?: string }
  | { type: "number"; label: string; min?: number; max?: number }
  | { type: "select"; label: string; options: string[] }
  | { type: "date"; label: string }
  | { type: "datetime"; label: string }
  | { type: "multi-select"; label: string; options: string[] };

export type WidgetRequirement =
  | { type: "integration"; platform: "spotify" | "github" | "weatherAPI" }
  | { type: "accountLevel"; level: "pro" | "enterprise" }
  | { type: "region"; country: string }; // e.g. 'NO', 'US'
