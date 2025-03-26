import { TErrorInfo } from "helpers";
import { IRegistrationData, ISession, IUser } from "./users";
import { INote, TNotePage } from "./note";
import { IGoogleUserLite } from "./google";

export type TCommunicationResponse<TData> =
  | { data: TData; error?: never }
  | { error: TErrorInfo; data?: never };

export interface IpcHandlers {
  "user:adminDetails": () => Promise<TCommunicationResponse<IUser>>;
  "user:getAllSessions": () => Promise<TCommunicationResponse<ISession[]>>;
  "user:deleteAllSessions": () => Promise<TCommunicationResponse<boolean>>;
  "user:deleteSession": (
    sessionId: string
  ) => Promise<TCommunicationResponse<boolean>>;

  "note:all": () => Promise<TCommunicationResponse<TNotePage[]>>;
  "note:getNote": (id: number) => Promise<TCommunicationResponse<INote>>;
  "note:createNote": (note: INote) => Promise<TCommunicationResponse<INote>>;

  "auth:login": (
    email: string,
    password: string
  ) => Promise<TCommunicationResponse<boolean>>;
  "auth:register": (
    data: IRegistrationData
  ) => Promise<TCommunicationResponse<boolean>>;
  "auth:signOut": () => Promise<TCommunicationResponse<boolean>>;

  "auth:google": () => Promise<TCommunicationResponse<boolean>>;
}

export interface IpcEmittedEvents {
  "auth:google:callback": (response: boolean) => void;
}
