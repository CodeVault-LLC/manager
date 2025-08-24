export interface ISystem {
  storage: ISystemStorage;
  graphics: ISystemGraphics;
  processor: ISystemProcessor;
  ram: {
    total: number;
    free: number;
    used: number;
  };
  memoryLayout: {
    size: number;
    bank: string;
    type: string;
    ecc?: boolean | null;
    clockSpeed: number | null;
    formFactor: string;
    manufacturer?: string;
    partNum: string;
    serialNum: string;
    voltageConfigured: number | null;
    voltageMin: number | null;
    voltageMax: number | null;
  }[];
  username: string;
  computername: string;
}

export interface ISystemStorage {
  total: number;
  used: number;
  free: number;
  percent_used: number;
}

export interface ISystemGraphics {
  manufacturer: string;
  model: string;
  memory: number | null;
}

export interface ISystemProcessor {
  manufacturer: string;
  brand: string;
  speed: number;
  cores: number;
  threads: number;
}

export interface ISystemStatistics {
  cpu: { current: number; average: number };
  memory: { current: number; average: number };
  disk: { current: number; average: number };
  uptime: number;
  network: { received: number; transmitted: number };
  pid: number;
}

export interface ISystemHardware {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
  };
  os: {
    platform: string;
    arch: string;
    release: string;
  };
  graphics: {
    manufacturer: string;
    model: string;
    memory: number;
  }[];
  network: {
    name: string;
    mac: string;
    ip4: string;
    ip6: string;
  }[];
  battery?: {
    percent: number;
    isCharging: boolean;
  };
  motherboard?: {
    manufacturer: string;
    model: string;
  };
}
