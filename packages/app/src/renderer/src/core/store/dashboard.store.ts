import { action, observable, makeObservable } from 'mobx'
import { ipcClient } from '@renderer/utils/ipcClient'
import { IDashboardWidget } from '@shared/types/widget'
import { CoreRootStore } from './root.store'
import { toast } from 'sonner'
import { INews } from '@shared/types/news'

export interface IDashboardStore {
  widgets: IDashboardWidget[]
  news: INews[]
  isLoading: boolean

  fetchWidgets: () => void
  fetchWidgetData: (
    widget_name: string
  ) => Promise<IDashboardWidget<any> | undefined>

  fetchNews: () => void
  openNews: (url: string) => void

  hydrate: (data: any) => void
}

export class DashboardStore implements IDashboardStore {
  widgets: IDashboardWidget<any>[] = []
  isLoading: boolean = false
  news: INews[] = []

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      widgets: observable.shallow,
      isLoading: observable,

      fetchWidgets: action,
      fetchWidgetData: action,
      fetchNews: action,
      hydrate: action
    })
  }

  hydrate = (data: any) => {
    if (data?.widgets) {
      this.widgets = data.widgets
    }
  }

  fetchWidgets = async () => {
    this.isLoading = true

    try {
      const response = await ipcClient.invoke('dashboard:widgets')

      if (response.data) {
        this.widgets = response.data
      } else {
        toast.error('Failed to fetch widgets')
      }
    } catch (error) {
      toast.error('Failed to fetch widgets')
    } finally {
      this.isLoading = false
    }
  }

  fetchWidgetData = async (widget_name: string) => {
    const widget = this.widgets.find((widget) => widget.name === widget_name)

    if (widget?.data) return widget.data

    this.isLoading = true

    try {
      const response = await ipcClient.invoke('dashboard:widget', widget_name)

      if (response.data) {
        const widgetIndex = this.widgets.findIndex(
          (widget) => widget.name === widget_name
        )

        if (widgetIndex !== -1) {
          this.widgets[widgetIndex].data = response.data
        }
      } else {
        console.error('Failed to fetch widget data', response.error)
        toast.error('Failed to fetch widget data')
      }
    } catch (error) {
      console.error('Failed to fetch widget data', error)
      toast.error('Failed to fetch widget data')
    } finally {
      this.isLoading = false
      return this.widgets.find((widget) => widget.name === widget_name)?.data
    }
  }

  fetchNews = async () => {
    this.isLoading = true

    try {
      const response = await ipcClient.invoke('msn:news')

      if (response.data) {
        this.news = response.data
      } else {
        console.log('Failed to fetch news', response.error)
        toast.error('Failed to fetch news')
      }
    } catch (error) {
      console.log('Failed to fetch news', error)
      toast.error('Failed to fetch news')
    } finally {
      this.isLoading = false
    }
  }

  openNews = async (url: string) => {
    try {
      await ipcClient.invoke('msn:open', url)
    } catch (error) {
      console.error('Failed to open news', error)
      toast.error('Failed to open news')
    }
  }
}
