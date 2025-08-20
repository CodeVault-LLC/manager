interface NetworkServiceProperties {
  connectedToNetwork: boolean;
  networkType: string; // e.g., 'wifi', 'ethernet', 'cellular'
  signalStrength: number; // Range from 0 to 100
}

export class NetworkService {
  static instance: NetworkService | null = null;
  private properties: NetworkServiceProperties;

  constructor() {
    if (NetworkService.instance) {
      throw new Error(
        "NetworkService is a singleton and cannot be instantiated more than once."
      );
    }

    NetworkService.instance = this;
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }
}
