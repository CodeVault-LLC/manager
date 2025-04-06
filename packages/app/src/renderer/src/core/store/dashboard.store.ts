import { action, observable, makeObservable } from 'mobx'
import { ipcClient } from '@renderer/utils/ipcClient'
import { IDashboardWidget } from '@shared/types/widget'
import { CoreRootStore } from './root.store'
import { toast } from 'sonner'

export interface IDashboardStore {
  widgets: IDashboardWidget[]
  isLoading: boolean

  getWidgets: () => void
  getWidgetData: (
    widget_name: string
  ) => Promise<IDashboardWidget<any> | undefined>
  hydrate: (data: any) => void
}

export class DashboardStore implements IDashboardStore {
  widgets: IDashboardWidget<any>[] = []
  isLoading: boolean = false

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      widgets: observable.shallow,
      isLoading: observable,

      getWidgets: action,
      hydrate: action
    })
  }

  hydrate = (data: any) => {
    if (data?.widgets) {
      this.widgets = data.widgets
    }
  }

  getWidgets = async () => {
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

  getWidgetData = async (widget_name: string) => {
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
}
