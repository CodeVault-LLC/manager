import { FC } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@manager/ui'
import { Loader } from '../loader/loading-spinner'
import { WeatherSymbol } from '../weather-current-conditions-widget/weather-symbol'
import { useWeatherForecastWidget } from './use-weather-forecast-widget'
import image from '/met-logo.svg'
import { MapPin } from 'lucide-react'

type Props = {
  widgetInstanceId: string
}

export const Weather7DayForecastWidget: FC<Props> = ({ widgetInstanceId }) => {
  const { loading, weatherError, location, dailyForecasts, formatTemp } =
    useWeatherForecastWidget(widgetInstanceId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-6 h-6 text-gray-500" />
      </div>
    )
  }

  if (weatherError) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md text-center">
        Feil ved henting av 7-dagers værdata: {weatherError}
      </div>
    )
  }

  return (
    <div className="rounded-lg shadow-md w-full p-2">
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

      <div className="flex items-center gap-1 my-2">
        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h2 className="text-xl font-semibold">{location}</h2>
      </div>

      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Dato</TableHead>
            <TableHead className="w-1/4">Værforhold</TableHead>
            <TableHead className="w-1/4">Temperatur</TableHead>
            <TableHead className="w-2/4">Vind</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {dailyForecasts.map((day) => (
            <TableRow key={day.date}>
              <TableHead>
                {new Date(day.date).toLocaleDateString('no-NO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </TableHead>
              <TableCell className="flex items-center gap-2">
                <WeatherSymbol symbolCode={day.symbolCode ?? ''} />
              </TableCell>
              <TableCell>
                {day.min !== undefined && day.max !== undefined ? (
                  <>
                    <span className="text-blue-600">{formatTemp(day.min)}</span>{' '}
                    /{' '}
                    <span className="text-red-600">{formatTemp(day.max)}</span>
                  </>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                {day.wind_speed !== undefined ? (
                  <>
                    <span className="text-gray-600">
                      {day.wind_speed.toFixed(1)} m/s
                    </span>
                    {day.wind_direction !== undefined && (
                      <span className="text-gray-500 ml-2">
                        ({day.wind_direction.toFixed(0)}°)
                      </span>
                    )}
                  </>
                ) : (
                  'N/A'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
