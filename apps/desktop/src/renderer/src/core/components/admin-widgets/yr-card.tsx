import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { Table, TableBody, TableCell, TableHead, TableRow } from '@manager/ui'
import { useDashboardStore } from '../../store/dashboard.store'
import { useApplicationStore } from '../../store/application.store'
import { convertSymbolKeyToId } from '../../../utils/yr-weather-symbols'
import { MapPin } from 'lucide-react'

export const YrCard: FC = () => {
  const { weather, weatherError, fetchWeather } = useDashboardStore()
  const { geolocation } = useApplicationStore()

  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  )

  useEffect(() => {
    void fetchWeather()
    setLastUpdated(
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    )

    const interval = setInterval(
      () => {
        void fetchWeather()
        setLastUpdated(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      },
      10 * 60 * 1000
    ) // 10 minutes

    return () => {
      clearInterval(interval)
    }
  }, [fetchWeather])

  const getClosestWeather = useCallback(() => {
    if (weather.length === 0) return null

    const currentDate = new Date()
    return weather.reduce((prev, curr) => {
      const prevDate = new Date(prev.time)
      const currDate = new Date(curr.time)

      return Math.abs(currDate.getTime() - currentDate.getTime()) <
        Math.abs(prevDate.getTime() - currentDate.getTime())
        ? curr
        : prev
    })
  }, [weather])

  const closestWeatherTime = useMemo(
    () => getClosestWeather(),
    [getClosestWeather]
  )

  const intervalLabels = ['00–06', '06–12', '12–18', '18–24']

  const groupedForecast = useMemo(() => {
    const groups: Record<string, typeof weather> = {
      '00–06': [],
      '06–12': [],
      '12–18': [],
      '18–24': []
    }

    weather.forEach((entry) => {
      const hour = new Date(entry.time).getHours()
      if (hour >= 0 && hour < 6) groups['00–06'].push(entry)
      else if (hour >= 6 && hour < 12) groups['06–12'].push(entry)
      else if (hour >= 12 && hour < 18) groups['12–18'].push(entry)
      else if (hour >= 18 && hour < 24) groups['18–24'].push(entry)
    })

    return intervalLabels.map((label) => {
      const group = groups[label]
      if (group.length === 0) return { label, min: '-', max: '-' }

      const temps = group.map(
        (entry) => entry.data.instant.details.air_temperature
      )
      return {
        label,
        min: Math.min(...temps),
        max: Math.max(...temps)
      }
    })
  }, [weather])

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg shadow-md w-full max-w-full sm:max-w-md md:max-w-lg">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <a
            className="text-[#00b8f1]"
            href="https://yr.no/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12z"
                clipRule="evenodd"
              ></path>
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M20.185 15.914s-.473.132-.826-.246c-.415-.444-1.071-1.338-1.071-1.338a3.427 3.427 0 0 0 1.514-.876c.664-.661 1.026-1.597 1.022-2.604.01-1.047-.45-1.988-1.176-2.578-.723-.597-1.655-.874-2.625-.875h-1.709a2.914 2.914 0 0 0-2.908 2.908v7.176h1.938v-2.036a.982.982 0 0 1 .97-.969h.772l2.085 2.554.146.18c.158.151.365.25.596.27v.001h.042a.282.282 0 0 0 .08 0h1.147l.003-1.567zM8.759 17.781c.797-.445 2.38-1.33 2.389-3.717V7.709H9.231l-.002 3.133c-.036 1.168-1.13 1.546-2.001 1.558-.995-.014-2.044-.566-2.044-2.083V7.709H3.293v2.608c0 1.184.409 2.195 1.184 2.925.701.66 1.662 1.031 2.712 1.049h.078c.705-.013 1.741-.473 1.942-.879v.863c0 1.144-1.455 1.89-1.847 2.086l.028.034a.477.477 0 0 0-.01.005l-.018.009 1.218 1.473.18-.101zm8.263-8.445c.605 0 1.09.177 1.39.428.295.257.464.558.474 1.085-.003.567-.184.96-.454 1.234-.275.271-.667.452-1.234.454h-1.885c-.292.001-.573.103-.839.2l-.13.047v-2.479a.982.982 0 0 1 .97-.969h1.708zM12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12z"
                clipRule="evenodd"
              ></path>
            </svg>
          </a>

          {weatherError ? (
            <p className="text-red-500 text-sm">{weatherError}</p>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 text-sm">
              Værvarsel for {geolocation?.city ?? 'N/A'}
            </p>
          )}
        </div>

        <p className="font-normal text-xs italic text-gray-700 dark:text-gray-300">
          En tjeneste fra MET og NRK
        </p>
      </div>

      <div className="flex flex-row items-center gap-1">
        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-xl font-semibold">{geolocation?.city ?? 'N/A'}</h2>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-1">
          <img
            className="current-hour__weather-symbol"
            src={`https://nrkno.github.io/yr-weather-symbols/symbols/lightmode/${
              closestWeatherTime?.data.next_1_hours?.summary?.symbol_code
                ? convertSymbolKeyToId(
                    closestWeatherTime.data.next_1_hours.summary.symbol_code
                  )
                : 'clearsky_day'
            }.svg`}
            width="42"
            height="42"
            alt={
              closestWeatherTime?.data.next_1_hours?.summary?.symbol_code ?? ''
            }
          />

          <p className="text-2xl font-bold">
            {closestWeatherTime?.data.instant.details.air_temperature}°
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="w-[1.0666666667rem] h-[1.0666666667rem]"
            >
              <circle
                cx="12"
                cy="18"
                r="1.25"
                stroke="currentColor"
                strokeWidth="1.5"
              ></circle>
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="M12 17V8m0-5a3 3 0 0 0-3 3v9.354a4 4 0 1 0 6 0V6a3 3 0 0 0-3-3z"
              ></path>
            </svg>

            <p className="text-sm font-normal">
              Føles som{' '}
              {closestWeatherTime?.data.instant.details.air_temperature}°
            </p>
          </div>

          <div className="flex flex-row items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="w-[1.0666666667rem] h-[1.0666666667rem]"
            >
              <path
                fill="currentColor"
                d="M2.04 12l-.747-.06.748.06zm19.92 0l.747-.06-.748.06zm-6.546 10.086l-.53-.53.53.53zm-2.828 0l-.53.53.53-.53zM2.788 12.062C3.221 6.78 7.235 2.75 12 2.75v-1.5c-5.668 0-10.221 4.757-10.707 10.69l1.495.122zM12 2.75c4.765 0 8.78 4.03 9.212 9.312l1.495-.123C22.22 6.007 17.668 1.25 12 1.25v1.5zm9 9.5H3v1.5h18v-1.5zm-19.707-.31c-.084 1.027.758 1.81 1.707 1.81v-1.5a.231.231 0 0 1-.166-.067.15.15 0 0 1-.046-.121l-1.495-.123zm19.919.122a.15.15 0 0 1-.046.121.231.231 0 0 1-.166.067v1.5c.949 0 1.79-.783 1.707-1.81l-1.495.122zM11.25 13v7.672h1.5V13h-1.5zm4.694 9.616l.586-.586-1.06-1.06-.586.585 1.06 1.061zm-3.889 0a2.75 2.75 0 0 0 3.89 0l-1.061-1.06a1.25 1.25 0 0 1-1.768 0l-1.06 1.06zm-.805-1.944c0 .729.29 1.428.805 1.944l1.061-1.06a1.25 1.25 0 0 1-.366-.884h-1.5z"
              ></path>
            </svg>

            <p className="text-sm font-normal">
              {closestWeatherTime?.data.next_1_hours?.details
                .precipitation_amount ?? 0}{' '}
              mm
            </p>
          </div>

          <div className="flex flex-row items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="w-[1.0666666667rem] h-[1.0666666667rem]"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="M18 12H2m7.268-7A2 2 0 1 1 11 8H2m11.5 12a2.5 2.5 0 1 0 2-4H2m15.99-4a3 3 0 1 0-1.801-5.4"
              ></path>
            </svg>

            <p className="text-sm font-normal">
              {closestWeatherTime?.data.instant.details.wind_speed} m/s
            </p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              className="rotate-[63deg]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M11.53 3l-.941 12.857L7 15l5.001 6L17 15l-3.587.857L12.471 3h-.941z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <Table className="w-full text-sm sm:text-base">
        <TableBody>
          {groupedForecast.map(({ label, min, max }) => (
            <TableRow key={label}>
              <TableHead className="whitespace-nowrap">{label}</TableHead>
              <TableCell>{`${max}° / ${min}°`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-xs text-gray-500 dark:text-gray-400 italic text-right">
        Sist oppdatert: {lastUpdated}
      </p>
    </div>
  )
}
