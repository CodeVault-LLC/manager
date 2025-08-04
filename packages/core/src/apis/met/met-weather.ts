import {
  I7DayForecast,
  I7DayForecastTimesery,
  ICurrentForecast,
  ICurrentForecastTimesery,
} from "@manager/common";
import { CacheService } from "@manager/data";
import { BASE_URL } from "./consts";
import { httpClient } from "@manager/core";

export const getForecastFor7Days = async (
  lat: number,
  lon: number
): Promise<I7DayForecastTimesery[]> => {
  try {
    const cacheKey = `met:7day-forecast:${lat},${lon}`;
    const cached =
      CacheService.getInstance().getCache<I7DayForecastTimesery[]>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/weatherapi/locationforecast/2.0/complete`;

    const response = await httpClient.get<I7DayForecast>(url, {
      params: { lat, lon },
    });

    const data = response.data.properties.timeseries;
    CacheService.getInstance().setCache(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour

    return data;
  } catch (error) {
    log.error("Failed to fetch 7-day forecast", error);
    throw error;
  }
};

export const getCurrentForecast = async (
  lat: number,
  lon: number
): Promise<ICurrentForecastTimesery[]> => {
  try {
    const cacheKey = `met:forecast:${lat},${lon}`;
    const cached =
      CacheService.getInstance().getCache<ICurrentForecastTimesery[]>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/weatherapi/locationforecast/2.0/compact`;

    const response = await httpClient.get<ICurrentForecast>(url, {
      params: { lat, lon },
    });

    const data = response.data.properties.timeseries;
    CacheService.getInstance().setCache(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes

    return data;
  } catch (error) {
    log.error("Failed to fetch current weather", error);
    throw error;
  }
};
