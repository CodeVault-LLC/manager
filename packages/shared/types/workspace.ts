import { TPaginationInfo } from "./common";

export interface IWorkspace {
  readonly id: string;

  name: string;
  logo_url: string | null;

  readonly total_members: number;
  readonly slug: string;

  organization_size: number;
  total_projects?: number;

  readonly created_by: string;
  readonly updated_by: string;

  readonly created_at: Date;
  readonly updated_at: Date;
}

export type TWorkspacePaginationInfo = TPaginationInfo & {
  results: IWorkspace[];
};
