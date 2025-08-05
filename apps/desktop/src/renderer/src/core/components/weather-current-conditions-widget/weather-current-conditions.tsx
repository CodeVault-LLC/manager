import { FC } from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@manager/ui'
import { MapPin } from 'lucide-react'
import { Loader } from '../loader/loading-spinner'
import { useWeatherWidget } from './use-weather-widget'
import { WeatherSymbol } from './weather-symbol'
import image from '/met-logo.svg'

type WeatherCurrentConditionsWidgetProps = {
  widgetInstanceId: string
}

export const WeatherCurrentConditionsWidget: FC<
  WeatherCurrentConditionsWidgetProps
> = ({ widgetInstanceId }) => {
  const {
    loading,
    weatherData,
    closestWeatherTime,
    groupedForecast,
    lastUpdated,
    formatTemperature,
    getTemperatureColorByValue
  } = useWeatherWidget(widgetInstanceId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <Loader className="w-8 h-8 text-gray-600 dark:text-gray-300" />
      </div>
    )
  }

  /*
  if (weatherError) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 rounded-md">
        Feil ved henting av værdata: {weatherError}
      </div>
    )
  }*/

  const location =
    weatherData.location.address?.city ??
    weatherData.location.address?.village ??
    'N/A'
  const temperature =
    closestWeatherTime?.data.instant.details.air_temperature ?? '-'
  const precipitation =
    closestWeatherTime?.data.next_1_hours?.details.precipitation_amount ?? 0
  const windSpeed = closestWeatherTime?.data.instant.details.wind_speed ?? '-'
  const symbolCode = closestWeatherTime?.data.next_1_hours?.summary?.symbol_code

  return (
    <div className="flex flex-col gap-2 rounded-lg shadow-md w-full p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <a
            href="https://www.met.no/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={image} alt="MET logo" className="h-8" />
          </a>
          <p className="text-gray-800 dark:text-gray-200 text-sm ml-2">
            Værvarsel for {location}
          </p>
        </div>
        <p className="text-xs italic text-gray-700 dark:text-gray-300">
          En tjeneste fra MET og NRK
        </p>
      </div>

      <div className="flex items-center gap-1">
        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-xl font-semibold">{location}</h2>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <WeatherSymbol symbolCode={symbolCode} />
          <p
            className="text-2xl font-bold"
            style={{
              color: getTemperatureColorByValue(parseInt(String(temperature)))
            }}
          >
            {formatTemperature(temperature)}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p>Føles som {formatTemperature(temperature)}</p>
          <p>{precipitation} mm nedbør</p>
          <p>{windSpeed} m/s vind</p>
        </div>
      </div>

      <Table className="w-full text-sm sm:text-base">
        <TableBody>
          {groupedForecast.map(({ label, min, max }) => (
            <TableRow key={label}>
              <TableHead className="whitespace-nowrap">{label}</TableHead>
              <TableCell>
                <span
                  style={{
                    color: getTemperatureColorByValue(parseInt(String(max)))
                  }}
                >
                  {formatTemperature(max)}
                </span>
                {' / '}
                <span
                  style={{
                    color: getTemperatureColorByValue(parseInt(String(min)))
                  }}
                >
                  {formatTemperature(min)}
                </span>
              </TableCell>
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
