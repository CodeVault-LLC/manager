import { TPaginationInfo } from "./common";
import { Role } from "./role";
import { IUser } from "./users";

export interface IWorkspace {
  readonly id: string;
  readonly owner: IUser;

  name: string;
  logo_url: string | null;

  readonly total_members: number;
  readonly slug: string;

  organization_size: number;
  total_projects?: number;

  role: Role;

  readonly created_by: string;
  readonly updated_by: string;

  readonly created_at: Date;
  readonly updated_at: Date;
}

export type TWorkspacePaginationInfo = TPaginationInfo & {
  results: IWorkspace[];
};
