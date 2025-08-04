import {
  getCurrentForecast,
  getForecastFor7Days,
} from "@manager/core/apis/met";
import { SessionStorage } from "@manager/data";
import { getLocationByLatLon } from "@manager/core/utils";
import { FullWidgetDefinition } from "./widget-definitions";

export const weatherWidgetDefinitions: FullWidgetDefinition[] = [
  {
    id: "weather_current_conditions",
    name: "Current Weather",
    description:
      "Shows live temperature, condition, and wind for a specific location.",
    iconUrl:
      "https://www.met.no/_/image/66f38792-6e49-4e4d-a2dd-76d00dc682f1:4f35ecddb34ffc5862fd3f880663716dd1503178/square-192/met-logo.png",
    source: "met",
    type: "weather",
    layout: {
      lg: { x: 6, y: 6, w: 5, h: 5.3 },
      md: { x: 5, y: 6, w: 5, h: 5.3 },
      sm: { x: 3, y: 6, w: 3, h: 5.3 },
      xs: { x: 2, y: 6, w: 2, h: 5.3 },
      xxs: { x: 0, y: 9, w: 2, h: 5.3 },
    },
    settingsSchema: {
      location: { type: "text", label: "Location (City or Coordinates)" },
      units: {
        type: "select",
        label: "Units",
        options: ["Celsius", "Fahrenheit"],
        default: "Celsius",
      },
      showWind: { type: "boolean", label: "Show Wind Info", default: true },
      showFeelsLike: {
        type: "boolean",
        label: "Show Feels Like Temperature",
        default: true,
      },
    },
    requirements: null,
    locales: ["en", "no"],
    fetchData: async (instanceSettings) => {
      if (!instanceSettings || !instanceSettings.location) {
        const geolocation = SessionStorage.getInstance().getItem("geolocation");

        if (
          !geolocation ||
          typeof geolocation !== "object" ||
          geolocation === null ||
          typeof (geolocation as any).loc !== "string"
        ) {
          throw new Error(
            "No location provided and no valid geolocation available"
          );
        }

        instanceSettings = {
          location: (geolocation as any).loc,
        };
      }

      const [lat, lon] = instanceSettings.location.split(",").map(Number);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Invalid location coordinates provided");
      }

      const location = await getLocationByLatLon(lat, lon);
      const data = await getCurrentForecast(lat, lon);

      return {
        location: {
          name: location.display_name,
          address: location.address,
          lat: location.lat,
          lon: location.lon,
        },
        data,
      };
    },
  },
  {
    id: "weather_forecast_7_day",
    name: "7-Day Weather Forecast",
    description: "Daily highs/lows and conditions for the week ahead.",
    iconUrl:
      "https://www.met.no/_/image/66f38792-6e49-4e4d-a2dd-76d00dc682f1:4f35ecddb34ffc5862fd3f880663716dd1503178/square-192/met-logo.png",
    source: "met",
    type: "weather",
    layout: {
      lg: { x: 0, y: 3, w: 6, h: 8 },
      md: { x: 0, y: 3, w: 5, h: 8 },
      sm: { x: 0, y: 3, w: 4, h: 8 },
      xs: { x: 0, y: 3, w: 4, h: 8 },
      xxs: { x: 0, y: 3, w: 2, h: 8 },
    },
    settingsSchema: {
      location: { type: "text", label: "Location (City or Coordinates)" },
      units: {
        type: "select",
        label: "Temperature Unit",
        options: ["Celsius", "Fahrenheit"],
        default: "Celsius",
      },
      showPrecipitation: {
        type: "boolean",
        label: "Show Rain/Snow Chance",
        default: true,
      },
    },
    requirements: null,
    locales: ["en", "no"],
    fetchData: async (instanceSettings) => {
      if (!instanceSettings || !instanceSettings.location) {
        const geolocation = SessionStorage.getInstance().getItem("geolocation");

        if (
          !geolocation ||
          typeof geolocation !== "object" ||
          geolocation === null ||
          typeof (geolocation as any).loc !== "string"
        ) {
          throw new Error(
            "No location provided and no valid geolocation available"
          );
        }

        instanceSettings = {
          location: (geolocation as any).loc,
        };
      }

      const [lat, lon] = instanceSettings.location.split(",").map(Number);

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Invalid location coordinates provided");
      }

      const location = await getLocationByLatLon(lat, lon);
      const data = await getForecastFor7Days(lat, lon);

      return {
        location: {
          name: location.display_name,
          address: location.address,
          lat: location.lat,
          lon: location.lon,
        },
        data,
      };
    },
  },
  {
    id: "weather_radar",
    name: "Live Rainfall Radar",
    description: "Animated radar showing recent and incoming precipitation.",
    iconUrl:
      "https://www.met.no/_/image/66f38792-6e49-4e4d-a2dd-76d00dc682f1:4f35ecddb34ffc5862fd3f880663716dd1503178/square-192/met-logo.png",
    source: "met",
    type: "weather",
    layout: {
      lg: { x: 6, y: 0, w: 6, h: 4 },
      md: { x: 5, y: 0, w: 5, h: 4 },
      sm: { x: 3, y: 0, w: 4, h: 4 },
      xs: { x: 2, y: 0, w: 3, h: 4 },
      xxs: { x: 0, y: 6, w: 2, h: 4 },
    },
    settingsSchema: {
      location: { type: "text", label: "Location (City or Coordinates)" },
      zoomLevel: {
        type: "number",
        label: "Zoom Level",
        min: 1,
        max: 12,
        default: 6,
      },
    },
    requirements: null,
    locales: ["en", "no"],
  },
  {
    id: "weather_alerts",
    name: "Severe Weather Alerts",
    description: "Displays weather warnings for the selected location.",
    iconUrl:
      "https://www.met.no/_/image/66f38792-6e49-4e4d-a2dd-76d00dc682f1:4f35ecddb34ffc5862fd3f880663716dd1503178/square-192/met-logo.png",
    source: "met",
    type: "weather",
    layout: {
      lg: { x: 0, y: 7, w: 4, h: 2 },
      md: { x: 0, y: 7, w: 4, h: 2 },
      sm: { x: 0, y: 7, w: 3, h: 2 },
      xs: { x: 0, y: 7, w: 2, h: 2 },
      xxs: { x: 0, y: 7, w: 2, h: 3 },
    },
    settingsSchema: {
      location: { type: "text", label: "Location (City or Coordinates)" },
      severityThreshold: {
        type: "select",
        label: "Minimum Alert Level",
        options: ["Info", "Warning", "Severe"],
        default: "Warning",
      },
    },
    requirements: null,
    locales: ["en", "no"],
  },
];
