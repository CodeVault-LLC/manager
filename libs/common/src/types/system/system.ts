export interface ISystem {
  startup_programs: string[];
  network: Network;
  antivirus: string;
  current_user: string;
  pending_reboot: string;
  time_sync: string;
  system_uuid: string;
  time_zone: string;
  motherboard: Motherboard;
  external_displays: null;
  gpus: string;
  os_build: string;
  vpn: string;
  software_updates: string;
  public_ip: string;
  architecture: string;
  environment: Environment;
  bluetooth: string;
  recent_warnings: string[];
  battery:
    | string
    | {
        charge: number;
        status: string;
      };
  os_caption: string;
  uptime: string;
  focus_assist: string;
  ram_gb: number;
  boot_time: Date;
  cpu: CPU;
  os_version: string;
  last_crash: string;
  critical_services: CriticalService[];
  domain_joined: string;
  bitlocker: Bitlocker;
  firewall: Firewall;
  bios: BIOS;
  computer_name: string;
  disk_usage: DiskUsage[];
}

interface BIOS {
  version: string;
  release_date: string;
}

interface Bitlocker {
  protection_status: number;
  drive: string;
}

interface CPU {
  max_clock_speed_mhz: number;
  name: string;
  cores: number;
  logical_processors: number;
}

interface CriticalService {
  Name: string;
  Status: number;
}

interface DiskUsage {
  label: string;
  drive: string;
  free_percent: number;
}

interface Environment {
  os_locale: string;
  system_drive: string;
  user_sid: string;
  current_ui: string;
}

interface Firewall {
  private: number;
  domain: number;
  public: number;
}

interface Motherboard {
  manufacturer: string;
  product: string;
}

interface Network {
  "vEthernet (WSL (Hyper-V firewall))": WiFi;
  "Wi-Fi": WiFi;
}

interface WiFi {
  dns_servers: string[];
  link_speed_mbps: number;
  ip_address: string;
  gateway: string;
}
