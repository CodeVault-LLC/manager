import { eq } from 'drizzle-orm'
import { db } from '../../database/data-source'
import { notes } from '../../database/models/schema'

import { faker } from '@faker-js/faker'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { ConfStorage } from '../../store'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12

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

      const key = (await ConfStorage.getSecret('notes-encryption-key')) || ''

      const payload = Buffer.from(note.content as string, 'base64')
      const iv = payload.subarray(0, IV_LENGTH)
      const tag = payload.subarray(IV_LENGTH, IV_LENGTH + 16)
      const encrypted = payload.subarray(IV_LENGTH + 16)

      const decipher = createDecipheriv(ALGO, key, iv)
      decipher.setAuthTag(tag)

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])

      return {
        data: {
          ...note,
          content: JSON.parse(decrypted.toString('utf8'))
        }
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
      const content = `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":""}]}]}`
      const key = (await ConfStorage.getSecret('notes-encryption-key')) || ''

      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv(ALGO, key, iv)

      const encrypted = Buffer.concat([
        cipher.update(content, 'utf8'),
        cipher.final()
      ])
      const tag = cipher.getAuthTag()

      const payload = Buffer.concat([iv, tag, encrypted])

      const newNote = await db
        .insert(notes)
        .values({
          title: randomTitle,
          content: payload.toString('base64')
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

      const key = (await ConfStorage.getSecret('notes-encryption-key')) || ''

      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv(ALGO, key, iv)

      const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(content), 'utf8'),
        cipher.final()
      ])
      const tag = cipher.getAuthTag()

      const payload = Buffer.concat([iv, tag, encrypted])

      const updatedNote = await db
        .update(notes)
        .set({ title, content: payload.toString('base64') })
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
