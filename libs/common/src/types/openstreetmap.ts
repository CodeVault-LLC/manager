export interface IOpenStreetMapReverse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: IAddress;
  boundingbox: string[];
}

export interface IAddress {
  shop: string;
  house_number: string;
  road: string;
  neighbourhood: string;
  borough: string;
  county: string;
  city: string;
  state: string;
  "ISO3166-2-lvl4": string;
  postcode: string;
  country: string;
  country_code: string;
  village: string;
}
