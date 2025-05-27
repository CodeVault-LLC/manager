import { eq } from 'drizzle-orm'
import { db } from '../../database/data-source'
import logger from '../../logger'
import { notes } from '../../database/models/schema'

export const notesServices = {
  getAllNotes: async () => {
    try {
      const notes = await db.query.notes.findMany()

      return {
        data: notes
      }
    } catch (error) {
      logger.error('Error fetching notes', {
        error
      })
      return {
        error: 'Failed to fetch notes'
      }
    }
  },

  getNoteById: async (id: number) => {
    try {
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, id)
      })

      if (!note) {
        return {
          error: 'Note not found'
        }
      }

      return {
        data: note
      }
    } catch (error) {
      logger.error('Error fetching note by ID', {
        error
      })
      return {
        error: 'Failed to fetch note by ID'
      }
    }
  },

  createNote: async (title: string, content: string) => {
    try {
      const newNote = await db
        .insert(notes)
        .values({
          title,
          content
        })
        .returning()

      return {
        data: newNote[0]
      }
    } catch (error) {
      logger.error('Error creating note', {
        error
      })
      return {
        error: 'Failed to create note'
      }
    }
  },

  writeNote: async (id: number, title: string, content: string) => {
    try {
      const updatedNote = await db
        .update(notes)
        .set({ title, content })
        .where(eq(notes.id, id))
        .returning()

      if (updatedNote.length === 0) {
        return {
          error: 'Note not found or no changes made'
        }
      }

      return {
        data: updatedNote[0]
      }
    } catch (error) {
      logger.error('Error updating note', {
        error
      })
      return {
        error: 'Failed to update note'
      }
    }
  }
}
