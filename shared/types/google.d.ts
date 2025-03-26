/**
 * Google API response for user info
 * @see https://cloud.google.com/identity-platform/docs/reference/rest/v1/UserInfo
 */
export interface IUserInfoResponse {
  picture: string;
  name: string;
  given_name: string;
  email: string;
  id: number;
  email_verified: boolean;
}

export interface IGoogleUserLite {
  name: string;
  email: string;
  picture: string;
  given_name: string;
  email_verified: boolean;
}
