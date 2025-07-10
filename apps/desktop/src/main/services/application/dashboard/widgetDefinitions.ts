import { WidgetRequirement, WidgetSetting } from '@manager/common/src'

type FullWidgetDefinition = {
  id: string
  name: string
  description: string
  type: string
  layout: Record<string, { x: number; y: number; w: number; h: number }>
  settingsSchema: Record<string, WidgetSetting>
  requirements: WidgetRequirement[] | null
  locales: string[] | null
}

export const defaultWidgetDefinitions: FullWidgetDefinition[] = [
  {
    id: 'basic_system_statistics',
    name: 'Basic System Statistics',
    description: 'Displays CPU, RAM, Disk usage.',
    type: 'system',
    layout: {
      lg: { x: 0, y: 0, w: 12, h: 2.5 },
      md: { x: 0, y: 0, w: 10, h: 2.5 },
      sm: { x: 0, y: 0, w: 6, h: 2.5 },
      xs: { x: 0, y: 0, w: 4, h: 2.5 },
      xxs: { x: 0, y: 0, w: 2, h: 5 }
    },
    settingsSchema: {
      showCPU: { type: 'boolean', label: 'Show CPU Usage' },
      showRAM: { type: 'boolean', label: 'Show RAM Usage' },
      showDisk: { type: 'boolean', label: 'Show Disk Usage' },
      showNetwork: { type: 'boolean', label: 'Show Network Info' }
    },
    requirements: null,
    locales: null
  },
  {
    id: 'msn_news_slider',
    name: 'MSN News Slider',
    description: 'Displays a slider with the latest news from MSN.',
    type: 'news',
    layout: {
      lg: { x: 0, y: 3, w: 12, h: 2.8 },
      md: { x: 0, y: 3, w: 10, h: 2.8 },
      sm: { x: 0, y: 3, w: 6, h: 2.8 },
      xs: { x: 0, y: 3, w: 4, h: 3 },
      xxs: { x: 0, y: 3, w: 2, h: 4 }
    },
    settingsSchema: {},
    requirements: null,
    locales: null
  },
  {
    id: 'msn_sport_featured_matches',
    name: 'MSN Sport Featured Matches',
    description: 'Displays featured sports matches from MSN.',
    type: 'sport',
    layout: {
      lg: { x: 0, y: 6, w: 5, h: 5.1 },
      md: { x: 0, y: 6, w: 5, h: 5.1 },
      sm: { x: 0, y: 6, w: 3, h: 5.1 },
      xs: { x: 0, y: 6, w: 2, h: 5.1 },
      xxs: { x: 0, y: 6, w: 2, h: 5.1 }
    },
    settingsSchema: {},
    requirements: null,
    locales: null
  },
  {
    id: 'yr_weather_card_small',
    name: 'YR Weather Card Small',
    description: 'Displays a small weather card with current conditions.',
    type: 'yr',
    layout: {
      lg: { x: 6, y: 6, w: 5, h: 5.1 },
      md: { x: 5, y: 6, w: 5, h: 5.1 },
      sm: { x: 3, y: 6, w: 3, h: 5.1 },
      xs: { x: 2, y: 6, w: 2, h: 5.1 },
      xxs: { x: 0, y: 9, w: 2, h: 5.1 }
    },
    settingsSchema: {},
    requirements: [{ type: 'region', country: 'NO' }],
    locales: null
  }
]
