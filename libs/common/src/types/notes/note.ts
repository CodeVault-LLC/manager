export interface INote {
  id: number;
  title: string;
  content: object;
  createdAt: string;
  updatedAt: string;
}

export type TNotePage = Omit<INote, "content">;
