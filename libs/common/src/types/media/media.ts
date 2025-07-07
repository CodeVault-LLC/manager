export interface IMedia {
  id: string;
  name: string;
  mime: string;
  size: number;
  path?: string;
  thumbnail?: string;
  length?: number;
  dimensions?: string;
}

export interface IMediaResponse {
  data: IMedia[];
  total: number;
  page: number;
  limit: number;
}
