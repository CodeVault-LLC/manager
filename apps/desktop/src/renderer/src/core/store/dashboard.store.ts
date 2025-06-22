import {
  IDashboardWidgetItem,
  INews,
  ISport,
  Timesery
} from '@manager/common/src'
import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'
import { create } from 'zustand'

export interface IDashboardStore {
  widgets: IDashboardWidgetItem[]
  news: INews[]
  weather: Timesery[]
  sports: ISport[]
  isLoading: boolean

  setWidgets: (widgets: IDashboardWidgetItem[]) => void
  fetchNews: () => Promise<void>
  fetchWeather: () => Promise<void>
  fetchSports: () => Promise<void>
}

export const useDashboardStore = create<IDashboardStore>((set) => ({
  widgets: [],
  isLoading: false,
  news: [],
  weather: [],
  sports: [],

  setWidgets: (widgets: IDashboardWidgetItem[]) => {
    set({ widgets })
  },

  fetchWeather: async () => {
    try {
      set({ isLoading: true })

      const response = await ipcClient.invoke('weather:current')

      if (response.data) {
        set({ weather: response.data })
      } else {
        toast.error('Failed to fetch weather data')
      }
    } catch (error) {
      toast.error(`Failed to fetch weather data: ${error}`)
    } finally {
      set({ isLoading: false })
    }
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

      const response = await ipcClient.invoke('msn:sport', {
        limit: 10,
        offset: 0,
        sport: 'Soccer',
        league: 'SportRadar_Soccer_SpainLaLiga_2024'
      })

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
