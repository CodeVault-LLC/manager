export interface ISystem {
  battery: ISystemBattery;
  uptime: string;
  boot_time: string;
  disk_usage: ISystemDisk[];
  last_crash: string | null;
  recent_warnings: string[];
  startup_programs: string[];
  focus_assist: string; // todo: into boolean
  bluetooth: string; // todo: into boolean
  exterrnal_displays: number;
  vpn: string; // todo: into boolean
  antivirus: string[];
  network: Record<string, ISystemNetwork>;
  public_ip: string;
  current_user: string;
  domain_joined: string; // todo: into boolean
}

export interface ISystemBattery {
  status: number;
  charge: number;
}

export interface ISystemDisk {
  drive: string;
  label: string;
  free_percent: number; // float
}

export interface ISystemNetwork {
  ip_address: string;
  link_speed_mbps: number; // float
  gateway: string;
  dns_servers: string[];
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

