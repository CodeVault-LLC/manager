export interface I7DayForecast {
  type: string;
  geometry: I7DayForecastGeometry;
  properties: I7DayForecastProperties;
}

export interface I7DayForecastGeometry {
  type: string;
  coordinates: number[];
}

export interface I7DayForecastProperties {
  meta: I7DayForecastMeta;
  timeseries: I7DayForecastTimesery[];
}

export interface I7DayForecastMeta {
  updated_at: Date;
  units: I7DayForecastUnits;
}

export interface I7DayForecastUnits {
  air_pressure_at_sea_level: string;
  air_temperature: string;
  air_temperature_max: string;
  air_temperature_min: string;
  cloud_area_fraction: string;
  cloud_area_fraction_high: string;
  cloud_area_fraction_low: string;
  cloud_area_fraction_medium: string;
  dew_point_temperature: string;
  fog_area_fraction: string;
  precipitation_amount: string;
  relative_humidity: string;
  ultraviolet_index_clear_sky: string;
  wind_from_direction: string;
  wind_speed: string;
}

export interface I7DayForecastTimesery {
  time: Date;
  data: I7DayForecastData;
}

export interface I7DayForecastData {
  instant: I7DayForecastInstant;
  next_12_hours?: I7DayForecastNext12_Hours;
  next_1_hours?: I7DayForecastNext1_Hours;
  next_6_hours?: I7DayForecastNext6_Hours;
}

export interface I7DayForecastInstant {
  details: { [key: string]: number };
}

export interface I7DayForecastNext12_Hours {
  summary: I7DayForecastSummary;
  details: I7DayForecastNext12_HoursDetails;
}

export type I7DayForecastNext12_HoursDetails = object;

export interface I7DayForecastSummary {
  symbol_code: string; // e.g., "clearsky_day", "partlycloudy_night"
}

export interface I7DayForecastNext1_Hours {
  summary: I7DayForecastSummary;
  details: I7DayForecastNext1_HoursDetails;
}

export interface I7DayForecastNext1_HoursDetails {
  precipitation_amount: number;
}

export interface I7DayForecastNext6_Hours {
  summary: I7DayForecastSummary;
  details: I7DayForecastNext6_HoursDetails;
}

export interface I7DayForecastNext6_HoursDetails {
  air_temperature_max: number;
  air_temperature_min: number;
  precipitation_amount: number;
}
