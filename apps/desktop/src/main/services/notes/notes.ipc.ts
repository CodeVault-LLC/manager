import { ipcMain } from 'electron'
import { notesServices } from './notes.service'

export const registerNotesIPC = async () => {
  ipcMain.handle('notes:getAll', async () => {
    try {
      const notes = await notesServices.getAllNotes()

      if (notes.data?.length === 0) {
        log.info('No notes found in the database')
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
      log.error('Error fetching notes', error)

      return {
        error: 'Failed to fetch notes'
      }
    }
  })

  ipcMain.handle('notes:getNote', async (_, noteId: number) => {
    try {
      const note = await notesServices.getNoteById(noteId)

      if (!note) {
        log.info(`Note with ID ${noteId} not found`)
        return {
          error: 'Note not found'
        }
      }

      return {
        data: note.data
      }
    } catch (error) {
      log.error('Error fetching note', {
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
        log.info('Failed to create note')
        return {
          error: 'Failed to create note'
        }
      }

      return {
        data: newNote.data
      }
    } catch (error) {
      log.error('Error creating note', error)

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
        const updatedNote = await notesServices.writeNote(id, title, content)

        if (!updatedNote?.data) {
          log.info(`Failed to update note with ID ${id}`)

          return {
            error: 'Failed to update note'
          }
        }

        return {
          data: updatedNote.data
        }
      } catch (error) {
        log.error('Error updating note', error)

        return {
          error: 'Failed to update note'
        }
      }
    }
  )

  ipcMain.handle('notes:deleteNote', async (_, noteId: number) => {
    try {
      const deletedNote = await notesServices.deleteNote(noteId)

      if (!deletedNote) {
        log.info(`Failed to delete note with ID ${noteId}`)
        return {
          error: 'Failed to delete note'
        }
      }

      return {
        data: deletedNote.data
      }
    } catch (error) {
      log.error('Error deleting note', error)

      return {
        error: 'Failed to delete note'
      }
    }
  })
}
