import { IDashboardWidget, INews, ISport } from '@manager/common/src'
import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'
import { create } from 'zustand'

export interface IDashboardStore {
  widgets: IDashboardWidget[]
  news: INews[]
  sports: ISport[]
  isLoading: boolean

  fetchWidgets: () => Promise<void>
  fetchWidgetData: (
    widget_name: string
  ) => Promise<IDashboardWidget<any> | undefined>

  fetchNews: () => Promise<void>
  fetchSports: () => Promise<void>
}

export const useDashboardStore = create<IDashboardStore>((set, get) => ({
  widgets: [],
  isLoading: false,
  news: [],
  sports: [],

  fetchWidgets: async () => {
    set({ isLoading: true })

    try {
      const response = await ipcClient.invoke('dashboard:widgets')

      if (response.data) {
        set({ widgets: response.data })
      } else {
        toast.error('Failed to fetch widgets')
      }
    } catch (error) {
      toast.error(`Failed to fetch widgets: ${error}`)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchWidgetData: async (widget_name: string) => {
    const { widgets } = get()

    const widget = widgets.find((widget) => widget.name === widget_name)

    if (widget?.data) return widget.data

    set({ isLoading: true })

    try {
      const response = await ipcClient.invoke('dashboard:widget', widget_name)

      if (response.data) {
        set({
          widgets: widgets.map((w) =>
            w.name === widget_name ? { ...w, data: response.data } : w
          )
        })
      } else {
        toast.error('Failed to fetch widget data')
      }
    } catch (error) {
      toast.error(`Failed to fetch widget data: ${error}`)
    } finally {
      set({ isLoading: false })
    }

    return get().widgets.find((widget) => widget.name === widget_name)?.data
  },

  fetchNews: async () => {
    try {
      set({ isLoading: true })

      const response = await ipcClient.invoke('msn:news')

      if (response.data) {
        set({ news: response.data })
      } else {
        toast.error('Failed to fetch news')
      }
    } catch (error) {
      toast.error(`Failed to fetch news: ${error}`)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchSports: async () => {
    try {
      set({ isLoading: true })

      const response = await ipcClient.invoke('msn:sport')

      if (response.data) {
        set({ sports: response.data })
      } else {
        toast.error('Failed to fetch sports data')
      }
    } catch (error) {
      toast.error(`Failed to fetch sports data: ${error}`)
    } finally {
      set({ isLoading: false })
    }
  }
}))
