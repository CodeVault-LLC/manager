export const API_BASE_URL = "http://localhost:3000";

export enum EUserStatus {
  ERROR = "ERROR",
  AUTHENTICATION_NOT_DONE = "AUTHENTICATION_NOT_DONE",
  NOT_YET_READY = "NOT_YET_READY",
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
}

export type TUserStatus = {
  status: EUserStatus | undefined;
  message?: string;
};
