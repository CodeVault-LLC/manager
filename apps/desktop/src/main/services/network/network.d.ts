export interface INetworkProvider {
  /**
   * Fetches the current network information.
   * @throws {Error} If there is an error retrieving the network information.
   * @description This method retrieves the current network information, including SSID, internal IP, and MAC address.
   * @return {Promise<INetwork>} A promise that resolves to the network information.
   */
  getNetwork(): Promise<INetwork>
}
