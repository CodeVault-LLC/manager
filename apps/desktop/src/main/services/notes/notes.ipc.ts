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
      logger.error('Error fetching notes', error)

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
        data: note.data
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

  ipcMain.handle('notes:createNote', async () => {
    try {
      const newNote = await notesServices.createNote()

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
      logger.error('Error creating note', error)

      return {
        error: 'Failed to create note'
      }
    }
  })

  ipcMain.handle(
    'notes:updateNote',
    async (
      _,
      { id, title, content }: { id: number; title: string; content: string }
    ) => {
      try {
        console.log(id, title, content)

        const updatedNote = await notesServices.writeNote(id, title, content)

        console.log(content)

        logger.info(
          `Updating note with ID ${id} - Title: ${title} Content: ${content}`
        )

        console.log('Updated note:', updatedNote)

        if (!updatedNote?.data) {
          logger.info(`Failed to update note with ID ${id}`)

          return {
            error: 'Failed to update note'
          }
        }

        return {
          data: updatedNote.data
        }
      } catch (error) {
        logger.error('Error updating note', error)

        return {
          error: 'Failed to update note'
        }
      }
    }
  )
}
