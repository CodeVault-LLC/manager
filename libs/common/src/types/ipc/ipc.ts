import {
  ISystem,
  ISystemStatistics,
  IBrowser,
  TNotePage,
  INote,
  TErrorInfo,
  IUser,
  IRegistrationData,
  ETheme,
  IApplication,
  IServiceStatus,
  ISystemHardware,
  INews,
  IExtension,
  ISession,
  IConvertedImageData,
  IConvertedImageResponse,
  IDashboardWidget,
} from "@manager/common/index";

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

  "user:verifyEmail": () => Promise<TCommunicationResponse<boolean>>;
  "user:verifyEmailToken": (
    token: string
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

  "images:convert": (
    data: IConvertedImageData
  ) => Promise<TCommunicationResponse<IConvertedImageResponse>>;

  "application:initial": () => Promise<
    TCommunicationResponse<{ theme: ETheme; language: string }>
  >;
  "application:serviceStatus": () => Promise<
    TCommunicationResponse<IServiceStatus[]>
  >;
  "application:setAppSettings": (
    application: IApplication
  ) => Promise<TCommunicationResponse<boolean>>;

  "system:getHardware": () => Promise<TCommunicationResponse<ISystemHardware>>;
  "system:getSystemInfo": () => Promise<TCommunicationResponse<ISystem>>;

  "application:openExternal": (
    url: string
  ) => Promise<TCommunicationResponse<boolean>>;

  "notes:getAll": () => Promise<TCommunicationResponse<INote[]>>;
  "notes:getNote": (id: number) => Promise<TCommunicationResponse<INote>>;
  "notes:createNote": () => Promise<TCommunicationResponse<INote>>;
  "notes:updateNote": (
    note: Partial<INote>
  ) => Promise<TCommunicationResponse<INote>>;

  "browser:initial": () => Promise<TCommunicationResponse<IBrowser[]>>;
  "browser:refresh": () => Promise<TCommunicationResponse<IBrowser[]>>;

  "extensions:getAll": (
    marketplace: boolean
  ) => Promise<TCommunicationResponse<IExtension[]>>;

  "dashboard:widgets": () => Promise<
    TCommunicationResponse<IDashboardWidget[]>
  >;
  "dashboard:widget": (
    widget_name: string
  ) => Promise<TCommunicationResponse<IDashboardWidget>>;

  "msn:news": () => Promise<TCommunicationResponse<INews[]>>;
  "msn:sport": () => Promise<TCommunicationResponse<any>>;
}

export interface IpcEmittedEvents {
  "auth:google:callback": (response: boolean) => void;
  "system:statistics": (data: ISystemStatistics) => void;
  "system:inactivity": (data: { inactive: boolean; pid: number }) => void;
}
