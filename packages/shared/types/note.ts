export interface INote {
  id: number;
  title: string;
  content: any[];
  createdAt: string;
  updatedAt: string;
}

export type TNotePage = Omit<INote, "content">;
