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

/**
 * Unparsed network information.
 * This interface represents the raw output from network commands.
 */
export interface IAdapterInfo {
  Name: "WiFi" | "Ethernet";
  InterfaceDescription: string;
  LinkSpeed: string;
  Status: string;
  MacAddress: string;
  Nlmtu: number | null;
}
