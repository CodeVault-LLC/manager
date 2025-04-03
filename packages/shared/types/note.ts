export interface INote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type TNotePage = Omit<INote, "content">;
