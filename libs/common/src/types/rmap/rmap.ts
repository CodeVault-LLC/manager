export const ERmapType = {
  quick: "quick",
  comprehensive: "comprehensive",
  stealth: "stealth",
  aggressive: "aggressive",
} as const;

export type ERmapType = (typeof ERmapType)[keyof typeof ERmapType];

export interface IRmapResponse {
  host: string;
  hostname: string;
  status: string;
  ports: IRmapPort[];
  os: string;
  lastSeen: string;
  risk: string;
}

export interface IRmapPort {
  port: number;
  protocol: string;
  service: string;
  state: "open" | "closed" | "filtered";
  version?: string;
}

export interface IRmapRequest {
  ip_addresses?: string[];
  detect_services?: boolean;
  full_scan?: boolean;
}
