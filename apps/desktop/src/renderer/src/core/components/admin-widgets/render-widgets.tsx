import { useDashboardStore } from '@renderer/core/store/dashboard.store'
import { FC } from 'react'

import { GoogleChatWidget } from './google-chat-widget'
import { MoviesWidget } from './movies-widget'

export const RenderWidgets: FC = () => {
  const { widgets } = useDashboardStore()

  if (!widgets) {
    return <div className="flex flex-col gap-4">No widgets found</div>
  }

  return widgets.map((widget) => {
    switch (widget.name) {
      case 'movies':
        return <MoviesWidget />
      case 'recent_google_chats':
        return <GoogleChatWidget />
      default:
        return <div key={widget.name}>Widget not found</div>
    }
  })
}
