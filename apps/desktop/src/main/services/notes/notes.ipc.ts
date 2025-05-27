import { ipcMain } from 'electron'
import logger from '../../logger'
import { notesServices } from './notes.service'

export const registerNotesIPC = async () => {
  ipcMain.handle('notes:getAll', async () => {
    try {
      const notes = await notesServices.getAllNotes()

      if (notes.data?.length === 0) {
        logger.info('No notes found in the database')
        return {
          data: []
        }
      }

      // Remove data from notes, since this is a pre operation
      notes.data?.forEach((note) => {
        note.content = ''
      })

      return {
        data: notes.data
      }
    } catch (error) {
      logger.error('Error fetching notes', {
        error
      })

      return {
        error: 'Failed to fetch notes'
      }
    }
  })

  ipcMain.handle('notes:getNote', async (_, noteId: number) => {
    try {
      const note = await notesServices.getNoteById(noteId)

      if (!note) {
        logger.info(`Note with ID ${noteId} not found`)
        return {
          error: 'Note not found'
        }
      }

      return {
        data: note
      }
    } catch (error) {
      logger.error('Error fetching note', {
        error
      })

      return {
        error: 'Failed to fetch note'
      }
    }
  })

  ipcMain.handle(
    'notes:createNote',
    async (_, { title, content }: { title: string; content: string }) => {
      try {
        const newNote = await notesServices.createNote(title, content)

        if (!newNote) {
          logger.info('Failed to create note')
          return {
            error: 'Failed to create note'
          }
        }

        return {
          data: newNote
        }
      } catch (error) {
        logger.error('Error creating note', {
          error
        })

        return {
          error: 'Failed to create note'
        }
      }
    }
  )

  ipcMain.handle(
    'notes:updateNote',
    async (
      _,
      { id, title, content }: { id: number; title: string; content: string }
    ) => {
      try {
        const updatedNote = await notesServices.writeNote(id, title, content)

        if (!updatedNote) {
          logger.info(`Failed to update note with ID ${id}`)
          return {
            error: 'Failed to update note'
          }
        }

        return {
          data: updatedNote
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
  )
}
