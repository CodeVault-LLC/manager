import {
  convertSymbolKeyToId,
  TWeatherSymbolKey
} from '../../../utils/yr-weather-symbols'
import { Loader } from '../loader/loading-spinner'

type Props = {
  symbolCode?: string
}

export const WeatherSymbol = ({ symbolCode }: Props) => {
  if (!symbolCode) {
    return (
      <div className="w-10 h-10 rounded-md flex items-center justify-center">
        <Loader className="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>
    )
  }

  const iconId = convertSymbolKeyToId(symbolCode as TWeatherSymbolKey)

  return (
    <img
      className="current-hour__weather-symbol"
      src={`https://nrkno.github.io/yr-weather-symbols/symbols/lightmode/${iconId}.svg`}
      width="42"
      height="42"
      alt={symbolCode}
    />
  )
}
