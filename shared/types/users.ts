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
  theme: IUserTheme;
}

export interface IUserTheme {
  text: string | undefined;
  theme: string | undefined;
  palette: string | undefined;
  primary: string | undefined;
  background: string | undefined;
  darkPalette: boolean | undefined;
  sidebarText: string | undefined;
  sidebarBackground: string | undefined;
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
  password: string;
  password_confirmation: string;
  avatar?: IAvatarWithBuffer | null;
}
