import { WidgetRequirement, WidgetSetting } from "@manager/common";
import { weatherWidgetDefinitions } from "./weatherDefinitions";

export type FullWidgetDefinition = {
  id: string;
  name: string;
  description: string;
  type: string;
  layout: Record<string, { x: number; y: number; w: number; h: number }>;
  settingsSchema: Record<string, WidgetSetting>;
  requirements: WidgetRequirement[] | null;
  locales: string[] | null;
  iconUrl?: string; // URL to the widget icon
  source?: string; // URL or identifier for the widget source (e.g., API endpoint)

  // Functions to fetch data or perform actions
  /**
   * Fetches data for the widget.
   * @returns A promise that resolves to the data fetched by the widget.
   * This can be used to fetch data from an API or perform any asynchronous operation.
   */
  fetchData?: (settings?: Record<string, any>) => Promise<any>;

  /**
   * Validates the settings provided by the user.
   * @param settings The settings object to validate.
   * @returns A boolean indicating whether the settings are valid.
   */
  validateSettings?: (settings: Record<string, any>) => boolean;
};

/**
 * Default widgets is a widget list with the following field layout, which is going to be the default used layout when starting the application for first time.
 */
export const defaultWidgets: FullWidgetDefinition[] = [
  {
    id: "basic_system_statistics",
    name: "Basic System Statistics",
    description: "Displays CPU, RAM, Disk usage.",
    type: "system",
    layout: {
      lg: { x: 0, y: 0, w: 12, h: 2.5 },
      md: { x: 0, y: 0, w: 10, h: 2.5 },
      sm: { x: 0, y: 0, w: 6, h: 2.5 },
      xs: { x: 0, y: 0, w: 4, h: 2.5 },
      xxs: { x: 0, y: 0, w: 2, h: 5 },
    },
    settingsSchema: {
      showCPU: { type: "boolean", label: "Show CPU Usage" },
      showRAM: { type: "boolean", label: "Show RAM Usage" },
      showDisk: { type: "boolean", label: "Show Disk Usage" },
      showNetwork: { type: "boolean", label: "Show Network Info" },
    },
    requirements: null,
    locales: null,
  },
  {
    id: "msn_news_slider",
    name: "MSN News Slider",
    description: "Displays a slider with the latest news from MSN.",
    type: "news",
    layout: {
      lg: { x: 0, y: 3, w: 12, h: 2.8 },
      md: { x: 0, y: 3, w: 10, h: 2.8 },
      sm: { x: 0, y: 3, w: 6, h: 2.8 },
      xs: { x: 0, y: 3, w: 4, h: 3 },
      xxs: { x: 0, y: 3, w: 2, h: 4 },
    },
    settingsSchema: {},
    requirements: null,
    locales: null,
  },
  {
    id: "msn_sport_featured_matches",
    name: "MSN Sport Featured Matches",
    description: "Displays featured sports matches from MSN.",
    type: "sport",
    layout: {
      lg: { x: 0, y: 6, w: 5, h: 5.1 },
      md: { x: 0, y: 6, w: 5, h: 5.1 },
      sm: { x: 0, y: 6, w: 3, h: 5.1 },
      xs: { x: 0, y: 6, w: 2, h: 5.1 },
      xxs: { x: 0, y: 6, w: 2, h: 5.1 },
    },
    settingsSchema: {},
    requirements: null,
    locales: null,
  },
  ...weatherWidgetDefinitions,
];
