import { db } from '@/data-source.js';
import { Note, notes } from '@/models/user/notes.model';
import { eq } from 'drizzle-orm';
import { TNotePage } from '@shared/types/note';

export const NotesService = {
  sanitizeNote(note: Note) {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      projectId: note.projectId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  },

  sanitizeNotePage(note: Note): TNotePage {
    return {
      title: note.title,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      id: note.id,
    };
  },

  async getAllNotesByUserId(userId: number): Promise<TNotePage[]> {
    const noteList = await db.query.notes.findMany({
      where: eq(notes.userId, userId),
    });

    return noteList.map((note) => NotesService.sanitizeNotePage(note));
  },

  async getNoteById(noteId: number, userId: number) {
    const note = await db.query.notes.findFirst({
      where: eq(notes.id, noteId),
    });

    if (!note) return null;
    if (note.userId !== userId) return null;

    return NotesService.sanitizeNote(note);
  },

  async createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const createdNote = await db
      .insert(notes)
      .values({
        userId: data.userId,
        title: data.title,
        content: data.content,
        projectId: data?.projectId ?? null,
      })
      .returning()
      .execute();

    return NotesService.sanitizeNote(createdNote[0] as Note);
  },

  async updateNote(
    noteId: number,
    data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    const updatedNote = await db
      .update(notes)
      .set({
        title: data.title,
        content: data.content,
        projectId: data?.projectId ?? null,
      })
      .where(eq(notes.id, noteId))
      .returning()
      .execute();

    return NotesService.sanitizeNote(updatedNote[0] as Note);
  },
};
