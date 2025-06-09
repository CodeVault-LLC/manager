import { eq } from 'drizzle-orm'
import { db } from '../../database/data-source'
import log from '../../logger'
import { notes } from '../../database/models/schema'

import { faker } from '@faker-js/faker'

export const notesServices = {
  getAllNotes: async () => {
    try {
      const notes = await db.query.notes.findMany()

      return {
        data: notes
      }
    } catch (error) {
      log.error('Error fetching notes', error)
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
      log.error('Error fetching note by ID', error)
      return {
        error: 'Failed to fetch note by ID'
      }
    }
  },

  createNote: async () => {
    try {
      const randomTitle = faker.lorem.sentence(3)
      const content = `<p>${faker.lorem.paragraph(2)}</p>`

      const newNote = await db
        .insert(notes)
        .values({
          title: randomTitle,
          content
        })
        .returning()

      return {
        data: newNote[0]
      }
    } catch (error) {
      log.error('Error creating note', error)

      return {
        error: 'Failed to create note'
      }
    }
  },

  writeNote: async (id: number, title: string, content: string) => {
    try {
      if (!id || !title || !content) {
        return {
          error: 'Invalid input data'
        }
      }

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
      log.error('Error updating note', error)
      return {
        error: 'Failed to update note'
      }
    }
  },

  deleteNote: async (id: number) => {
    try {
      if (!id) {
        return {
          error: 'Invalid note ID'
        }
      }

      const deletedNote = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning()

      if (deletedNote.length === 0) {
        return {
          error: 'Note not found'
        }
      }

      return {
        data: deletedNote[0]
      }
    } catch (error) {
      log.error('Error deleting note', error)
      return {
        error: 'Failed to delete note'
      }
    }
  }
}
