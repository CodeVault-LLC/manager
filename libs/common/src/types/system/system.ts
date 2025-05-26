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
