import { ipcMain } from 'electron'
import { api } from './api.service'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { INote, TNotePage } from '@shared/types/note'

const loadNoteServices = () => {
  ipcMain.handle('note:all', async (): Promise<TCommunicationResponse<TNotePage[]>> => {
    try {
      const response = await api.get<TNotePage[]>('/users/notes/all/')

      return { data: response.data }
    } catch (error: any) {
      if (error.error) {
        return error
      }

      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })

  ipcMain.handle('note:getNote', async (_, id: number): Promise<TCommunicationResponse<INote>> => {
    try {
      const response = await api.get<INote>(`/users/notes/${id}`)

      return { data: response.data }
    } catch (error: any) {
      if (error.error) {
        return error
      }

      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })

  ipcMain.handle(
    'note:createNote',
    async (_, note: INote): Promise<TCommunicationResponse<INote>> => {
      try {
        const response = await api.post<INote>('/users/notes/', note)

        return { data: response.data }
      } catch (error: any) {
        if (error.error) {
          return error
        }

        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )
}

export { loadNoteServices }
