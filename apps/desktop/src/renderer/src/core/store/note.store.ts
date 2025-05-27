import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'
import { create } from 'zustand'

import { getValue } from '../../hooks/use-i18n'
import { INote } from '@shared/types/note'

export interface INoteStore {
  notes: INote[]

  getAll: () => void
  getNote: (id: number) => void
  createNote: (note: Partial<INote>) => void
  updateNote: (note: Partial<INote>) => void
}

export const useNoteStore = create<INoteStore>((set) => ({
  notes: [],

  getAll: async (): Promise<void> => {
    const response = await ipcClient.invoke('notes:getAll')

    if (response.error) {
      toast.error(getValue('error.fetchingNotes'))
      return
    }

    set({ notes: response.data || [] })
  },

  createNote: async (note: Partial<INote>): Promise<void> => {
    const response = await ipcClient.invoke('notes:createNote', note)

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
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? note : n))
    }))
  },

  updateNote: async (note: Partial<INote>): Promise<void> => {
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
