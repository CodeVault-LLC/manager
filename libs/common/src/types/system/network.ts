export interface INetwork {
  internalIP: string;
  externalIP: string;
  macAddress: string;
  ssid: string;
  signalStrength: number;
  connectionType: "WiFi" | "Ethernet";
  dns: string[];
  gateway: string;
  latency: number;
  speed: {
    up: number;
    down: number;
  };
  status: "online" | "offline";
  firewallEnabled: boolean;
  vpnActive: boolean;
  openPorts: number[];
  activeConnections: number;
  hostname: string;
  mtu: number;
  leaseTime: string;
}
