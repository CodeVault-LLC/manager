import { IGoogleUserLite } from "./google";

export interface IUserLite {
  id: string;
  avatar_url: string;

  email?: string;

  first_name: string;
  last_name: string;
}

export interface IUser extends IUserLite {
  date_joined: string;
  email: string;
  is_active: boolean;
  user_timezone: string;
  username: string;

  google: IGoogleUserLite | null;
}

export interface IAvatarWithBuffer {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  buffer: number[];
}

export interface IRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  avatar?: IAvatarWithBuffer | null;
}

export interface ISession {
  id: number;
  userId: number;
  systemInfo: string;
  isActive: boolean;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
  deviceFingerprint: string;
  sessionToken: string;
  isCurrentSession?: boolean;
}
