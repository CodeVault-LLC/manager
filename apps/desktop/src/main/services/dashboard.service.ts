import { TCommunicationResponse } from '@shared/types/ipc'
import { IDashboardWidget } from '@shared/types/widget'
import { ipcMain } from 'electron'

import { api } from './api.service'

const widgets: IDashboardWidget[] = [
  {
    name: 'movies',
    description: 'Movies widget',
    status: 'beta'
  },
  {
    name: 'recent_google_chats',
    description: 'Recent Google Chats widget',
    status: 'beta'
  }
]

const loadDashboardServices = () => {
  ipcMain.handle(
    'dashboard:widgets',
    (): TCommunicationResponse<IDashboardWidget<any>[]> => {
      return { data: widgets }
    }
  )

  ipcMain.handle('dashboard:widget', async (_, widget_name) => {
    const widget = widgets.find((widget) => widget.name === widget_name)

    if (!widget) {
      return { error: { message: 'Widget not found' } }
    }

    if (widget.data) {
      return { data: widget.data }
    }

    switch (widget.name) {
      case 'movies':
        return api
          .get('/movies')
          .then((response) => {
            if (response.data) {
              widget.data = response.data
              return { data: widget.data }
            } else {
              return { error: { message: 'Failed to fetch movies' } }
            }
          })
          .catch(() => {
            return { error: { message: 'Failed to fetch movies' } }
          })

      case 'recent_google_chats':
        return api
          .get('/google/chat/recent')
          .then((response) => {
            if (response.data) {
              widget.data = response.data
              return { data: widget.data }
            } else {
              return {
                error: { message: 'Failed to fetch recent google chats' }
              }
            }
          })
          .catch(() => {
            return { error: { message: 'Failed to fetch recent google chats' } }
          })
      default:
        return { error: { message: 'Widget not found' } }
    }
  })
}

export { loadDashboardServices }
