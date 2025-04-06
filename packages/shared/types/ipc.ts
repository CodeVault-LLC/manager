import { TErrorInfo } from "helpers";
import { IRegistrationData, ISession, IUser } from "./users";
import { INote, TNotePage } from "./note";
import { ETheme, ISystem, ISystemStatistics } from "./system";
import { IDashboardWidget } from "./widget";

export type TCommunicationResponse<TData> =
  | { data: TData; error?: never }
  | { error: TErrorInfo; data?: never };

export interface IpcHandlers {
  "user:adminDetails": () => Promise<TCommunicationResponse<IUser>>;
  "user:update": (
    data: Partial<IUser>
  ) => Promise<TCommunicationResponse<IUser>>;
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
  "auth:google:revoke": () => Promise<TCommunicationResponse<boolean>>;

  "system:initial": () => Promise<
    TCommunicationResponse<{ theme: ETheme; language: string }>
  >;
  "system:setSystem": (
    system: ISystem
  ) => Promise<TCommunicationResponse<boolean>>;

  "dashboard:widgets": () => Promise<
    TCommunicationResponse<IDashboardWidget[]>
  >;
  "dashboard:widget": (
    widget_name: string
  ) => Promise<TCommunicationResponse<IDashboardWidget>>;
}

export interface IpcEmittedEvents {
  "auth:google:callback": (response: boolean) => void;
  "system:statistics": (data: ISystemStatistics) => void;
}
