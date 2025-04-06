import { useDashboard } from '@renderer/hooks/use-dashboard'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { MoviesWidget } from './movies-widget'
import { GoogleChatWidget } from './google-chat-widget'

export const RenderWidgets: FC = observer(() => {
  const { widgets } = useDashboard()

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
})
