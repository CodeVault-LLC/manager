export enum EServiceStatus {
  OPERATIONAL = "operational",
  DEGRADED = "degraded",
  OUTAGE = "outage",
  UNKNOWN = "unknown",
}

export enum EServiceType {
  DATABASE = "database",
  API = "api",
  EXTENSION = "extension",
}

export interface IServiceStatus {
  name: string;
  status: EServiceStatus;
  type: EServiceType;
  responseTime: number; // in milliseconds
  lastUpdated: Date; // timestamp of the last status update
  description?: string; // optional field for additional information
}
