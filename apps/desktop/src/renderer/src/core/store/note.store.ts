import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'
import { create } from 'zustand'

import { getValue } from '../../hooks/use-i18n'
import { INote } from '@shared/types/note'

export interface INoteStore {
  notes: INote[]
  currentNote?: INote

  getAll: () => void
  getNote: (id: number) => void
  createNote: () => void
  updateNote: (note: Partial<INote>) => void
}

export const useNoteStore = create<INoteStore>((set) => ({
  notes: [],
  currentNote: undefined,

  getAll: async (): Promise<void> => {
    const response = await ipcClient.invoke('notes:getAll')

    if (response.error) {
      toast.error(getValue('error.fetchingNotes'))
      return
    }

    set({ notes: response.data || [] })
  },

  createNote: async (): Promise<void> => {
    const response = await ipcClient.invoke('notes:createNote')

    if (response.error) {
      toast.error(getValue('error.creatingNote'))
      return
    }

    set((state) => ({
      notes: [...state.notes, response.data]
    }))
  },

  getNote: async (id: number): Promise<void> => {
    const response = await ipcClient.invoke('notes:getNote', id)

    if (response.error) {
      toast.error(getValue('error.fetchingNotes'))
      return
    }

    const note = response.data
    set({
      currentNote: note
    })
  },

  updateNote: async (note: Partial<INote>): Promise<void> => {
    if (!note.id || !note.content || !note.title) {
      toast.error(getValue('error.invalidNoteData'))
      return
    }

    const response = await ipcClient.invoke('notes:updateNote', note)

    if (response.error) {
      toast.error(getValue('error.updatingNote'))
      return
    }

    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? response.data : n))
    }))
  }
}))
