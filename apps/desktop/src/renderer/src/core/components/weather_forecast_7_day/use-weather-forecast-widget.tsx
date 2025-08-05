import { useState, useEffect, useMemo } from 'react'
import { useApplicationStore } from '../../store/application.store'
import { I7DayForecastTimesery, IOpenStreetMapReverse } from '@manager/common'

type WeatherData = {
  location: Partial<IOpenStreetMapReverse>
  data: I7DayForecastTimesery[]
}

export function useWeatherForecastWidget(widgetInstanceId: string) {
  const {
    getWidgetInstanceData,
    fetchWidgetInstanceData,
    getWidgetInstanceSetttingBykey
  } = useApplicationStore()

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
    }

    void fetchData()
  }, [fetchWidgetInstanceData, widgetInstanceId])

  const dailyForecasts = useMemo(() => {
    const grouped: Record<string, I7DayForecastTimesery[]> = {}

    weatherData.data.forEach((entry) => {
      const date = new Date(entry.time).toISOString().split('T')[0]
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(entry)
    })

    return Object.entries(grouped)
      .slice(0, 7) // Only 7 days
      .map(([date, entries]) => {
        const temps = entries.map((e) => e.data.instant.details.air_temperature)
        const symbolCode =
          entries.find((e) => e.data?.next_6_hours?.summary?.symbol_code)?.data
            ?.next_6_hours?.summary?.symbol_code ?? null
        const wind_speed =
          entries.reduce((acc, entry) => {
            const speed = entry.data.instant.details.wind_speed
            return acc + (speed ?? 0)
          }, 0) / entries.length
        const wind_direction =
          entries.reduce((acc, entry) => {
            const direction = entry.data.instant.details.wind_from_direction
            return acc + (direction ?? 0)
          }, 0) / entries.length

        return {
          date,
          symbolCode,
          wind_speed,
          wind_direction,
          min: Math.min(...temps),
          max: Math.max(...temps)
        }
      })
  }, [weatherData.data])

  const toPreferredUnit = (celsius: number) =>
    unitPreference === 'Fahrenheit'
      ? Math.round((celsius * 9) / 5 + 32)
      : Math.round(celsius)

  const formatTemp = (temp: number) =>
    `${toPreferredUnit(temp)}${unitPreference === 'Fahrenheit' ? '°F' : '°C'}`

  return {
    loading,
    location:
      weatherData.location.address?.city ??
      weatherData.location.address?.village ??
      'N/A',
    dailyForecasts,
    formatTemp
  }
}
