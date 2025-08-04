import { IOpenStreetMapReverse } from "@manager/common";
import { CacheService } from "@manager/data";
import { httpClient } from "@manager/core";

const BASE_URL = "https://nominatim.openstreetmap.org";

export const getLocationByLatLon = async (lat: number, lon: number) => {
  try {
    const cacheKey = `openstreetmap:reverse:${lat},${lon}`;
    const cached =
      CacheService.getInstance().getCache<IOpenStreetMapReverse>(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/reverse`;

    const response = await httpClient.get<IOpenStreetMapReverse>(url, {
      params: { lat, lon, format: "json" },
    });

    const data = response.data;
    CacheService.getInstance().setCache(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes

    return data;
  } catch (error) {
    log.error("Failed to fetch location by latitude and longitude", error);
    throw error;
  }
};
