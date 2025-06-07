export const EServiceStatus = {
  OPERATIONAL: "operational",
  DEGRADED: "degraded",
  OUTAGE: "outage",
  UNKNOWN: "unknown",
};

export const EServiceType = {
  DATABASE: "database",
  API: "api",
  EXTENSION: "extension",
} as const;

export interface IServiceStatus {
  name: string;
  type: keyof typeof EServiceType;
  status: keyof typeof EServiceStatus;
  lastUpdated: string;
  uptime: number;
  crashCount: number;
  responseTime: {
    avg: number;
    min: number;
    max: number;
  };
  heartbeatAge: number | null;
  isBinary: boolean;
  description: string;
  port: number;
  pid?: number;
}

export interface IpcServiceLog {
  timestamp: string; // ISO date
  service: string;
  level: "info" | "warning" | "error";
  message: string;
}
