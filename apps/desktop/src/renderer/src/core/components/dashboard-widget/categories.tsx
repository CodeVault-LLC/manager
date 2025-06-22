import { NewspaperIcon, TrophyIcon, CloudSunIcon, CpuIcon } from 'lucide-react'

export const WidgetCategories = {
  news: {
    name: 'News',
    icon: <NewspaperIcon className="w-4 h-4" />,
    description: 'Latest news from various sources'
  },
  sport: {
    name: 'Sport',
    icon: <TrophyIcon className="w-4 h-4" />,
    description: 'Latest sports updates and scores'
  },
  weather: {
    name: 'Weather',
    icon: <CloudSunIcon className="w-4 h-4" />,
    description: 'Current weather conditions and forecasts'
  },
  system: {
    name: 'System',
    icon: <CpuIcon className="w-4 h-4" />,
    description: 'System statistics and performance metrics'
  }
}
