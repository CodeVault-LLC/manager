import { useState, useEffect, useMemo } from 'react'
import { useDashboardStore } from '../../store/dashboard.store'
import { useApplicationStore } from '../../store/application.store'
import {
  ICurrentForecastTimesery,
  IOpenStreetMapReverse
} from '@manager/common'

type WeatherData = {
  location: Partial<IOpenStreetMapReverse>
  data: ICurrentForecastTimesery[]
}

export function useWeatherWidget(widgetInstanceId: string) {
  const { weatherError } = useDashboardStore()
  const {
    getWidgetInstanceData,
    fetchWidgetInstanceData,
    getWidgetInstanceSetttingBykey
  } = useApplicationStore()

  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)

  const weatherData = getWidgetInstanceData<WeatherData>(widgetInstanceId) ?? {
    location: {},
    data: []
  }

  const unitPreference = getWidgetInstanceSetttingBykey<string>(
    widgetInstanceId,
    'units'
  )

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await fetchWidgetInstanceData<WeatherData>(widgetInstanceId)
      setLoading(false)
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      )
    }

    void fetchData()
    const interval = setInterval(fetchData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWidgetInstanceData, widgetInstanceId])

  const closestWeatherTime = useMemo(() => {
    if (!weatherData?.data?.length) return null
    const now = new Date()
    return weatherData.data.reduce((prev, curr) =>
      Math.abs(new Date(curr.time).getTime() - now.getTime()) <
      Math.abs(new Date(prev.time).getTime() - now.getTime())
        ? curr
        : prev
    )
  }, [weatherData.data])

  const groupedForecast = useMemo(() => {
    const groups: Record<string, typeof weatherData.data> = {
      '00–06': [],
      '06–12': [],
      '12–18': [],
      '18–24': []
    }

    weatherData.data.forEach((entry) => {
      const hour = new Date(entry.time).getHours()
      if (hour >= 0 && hour < 6) groups['00–06'].push(entry)
      else if (hour >= 6 && hour < 12) groups['06–12'].push(entry)
      else if (hour >= 12 && hour < 18) groups['12–18'].push(entry)
      else groups['18–24'].push(entry)
    })

    return Object.entries(groups).map(([label, entries]) => {
      if (!entries.length) return { label, min: '-', max: '-' }
      const temps = entries.map((e) => e.data.instant.details.air_temperature)
      return { label, min: Math.min(...temps), max: Math.max(...temps) }
    })
  }, [weatherData.data])

  const getTemperatureColorByValue = (temp: number) => {
    if (temp <= -15) return '#003f5c'
    if (temp <= -5) return '#2f4b7c'
    if (temp <= 5) return '#669bbc'
    if (temp <= 20) return '#88cc88'
    if (temp <= 30) return '#fdae61'
    if (temp <= 35) return '#f46d43'
    return '#d73027'
  }

  const toPreferredTemperatureUnit = (celsius: number): number => {
    return unitPreference === 'Fahrenheit'
      ? Math.round((celsius * 9) / 5 + 32)
      : celsius
  }

  const formatTemperatureLabel = (value: number): string => {
    const unitSymbol = unitPreference === 'Fahrenheit' ? '°F' : '°C'
    return `${value}${unitSymbol}`
  }

  const formatTemperature = (value: number | string): string => {
    const numeric = parseInt(String(value), 10)
    if (isNaN(numeric)) return '-'
    return formatTemperatureLabel(toPreferredTemperatureUnit(numeric))
  }

  return {
    weatherError,
    weatherData,
    loading,
    lastUpdated,
    closestWeatherTime,
    groupedForecast,
    unitPreference,
    getTemperatureColorByValue,
    formatTemperature
  }
}
