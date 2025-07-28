export interface ICurrentForecast {
  type: string;
  geometry: ICurrentForecastGeometry;
  properties: ICurrentForecastProperties;
}

export interface ICurrentForecastGeometry {
  type: string;
  coordinates: number[];
}

export interface ICurrentForecastProperties {
  meta: ICurrentForecastMeta;
  timeseries: ICurrentForecastTimesery[];
}

export interface ICurrentForecastMeta {
  updated_at: Date;
  units: ICurrentForecastUnits;
}

export interface ICurrentForecastUnits {
  air_pressure_at_sea_level: string;
  air_temperature: string;
  cloud_area_fraction: string;
  precipitation_amount: string;
  relative_humidity: string;
  wind_from_direction: string;
  wind_speed: string;
}

export interface ICurrentForecastTimesery {
  time: Date;
  data: ICurrentForecastData;
}

export interface ICurrentForecastData {
  instant: ICurrentForecastInstant;
  next_12_hours?: ICurrentForecastNext12_Hours;
  next_1_hours?: ICurrentForecastNextHours;
  next_6_hours?: ICurrentForecastNextHours;
}

export interface ICurrentForecastInstant {
  details: ICurrentForecastInstantDetails;
}

export interface ICurrentForecastInstantDetails {
  air_pressure_at_sea_level: number;
  air_temperature: number;
  cloud_area_fraction: number;
  relative_humidity: number;
  wind_from_direction: number;
  wind_speed: number;
}

export interface ICurrentForecastNext12_Hours {
  summary: ICurrentForecastSummary;
  details: ICurrentForecastNext12_HoursDetails;
}

export type ICurrentForecastNext12_HoursDetails = object;

export interface ICurrentForecastSummary {
  symbol_code: string; // e.g., "clearsky_day", "partlycloudy_night"
}

export interface ICurrentForecastNextHours {
  summary: ICurrentForecastSummary;
  details: ICurrentForecastNextHoursDetails;
}

export interface ICurrentForecastNextHoursDetails {
  precipitation_amount: number;
}
