import { IUser } from "./users";

export interface ICommunicationResponse {
  success?: boolean;
  error?: string;

  user?: IUser;
}
