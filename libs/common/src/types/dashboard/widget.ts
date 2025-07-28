// A widget which includes the possible settings and requirements as well as the default information
export interface IDashboardWidgetItem {
  id: string;
  type: string; // e.g., 'monitoring', 'calendar', 'media'
  name: string;
  description: string;

  iconUrl?: string; // URL to the widget icon
  source?: string; // URL or identifier for the widget source (e.g., API endpoint)

  defaultLayout: Record<string, { x: number; y: number; w: number; h: number }>;

  settingsSchema: Record<string, WidgetSetting>; // schema for settings
  requirements?: WidgetRequirement[]; // e.g. [{ type: 'integration', platform: 'spotify' }]
  locales: string[]; // e.g. ['en-US', 'no-NO']
}

// Every instance is required to be active, and when toggled off it will be removed.
// This allows for multiple instances of the same widget.
export interface IDashboardWidgetInstance {
  id: string; // UUID v4
  definitionId: string;
  layout: Record<string, { x: number; y: number; w: number; h: number }>;
  static: boolean; // not resizable or movable (future feature)
  settings: Record<string, any>; // user-defined settings

  isLoading?: boolean; // whether the widget is currently fetching data
  data?: any; // data fetched from the widget's source
}

export type WidgetSetting =
  | { type: "boolean"; label: string; default?: boolean }
  | {
      type: "text";
      label: string;
      regex?: string;
      placeholder?: string;
      default?: string;
    }
  | {
      type: "number";
      label: string;
      min?: number;
      max?: number;
      default?: number;
    }
  | { type: "select"; label: string; options: string[]; default?: string }
  | { type: "date"; label: string; default?: string }
  | { type: "datetime"; label: string; default?: string }
  | {
      type: "multi-select";
      label: string;
      options: string[];
      default?: string[];
    };

export type WidgetRequirement =
  | { type: "integration"; platform: "spotify" | "github" | "weatherAPI" }
  | { type: "accountLevel"; level: "pro" | "enterprise" }
  | { type: "region"; country: string }; // e.g. 'NO', 'US'
