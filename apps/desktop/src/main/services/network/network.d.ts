import { INetwork, IGeoLocation } from '@manager/common/src'

export interface INetworkProvider {
  /**
   * Fetches the current network information.
   * @throws {Error} If there is an error retrieving the network information.
   * @description This method retrieves the current network information, including SSID, internal IP, and MAC address.
   * @return {Promise<INetwork>} A promise that resolves to the network information.
   */
  getNetwork(): Promise<INetwork>

  /**
   * Fetches the current geolocation data.
   * @throws {Error} If there is an error retrieving the geolocation data.
   * @description This method retrieves the current geolocation data, including latitude and longitude.
   * @return {Promise<IGeolocation>} A promise that resolves to the geolocation data.
   */
  getGeolocation(): Promise<IGeoLocation>
}
