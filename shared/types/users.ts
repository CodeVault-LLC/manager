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
