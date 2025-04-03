import { observable, makeObservable } from 'mobx'
import { CoreRootStore } from './root.store'
import { EErrorCodes, TErrorInfo } from '@shared/helpers'
import { INote, TNotePage } from '@shared/types/note'
import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'

export interface INoteStore {
  // observables
  notes: TNotePage[]
  currentNote: INote | null
  selectedNoteId: number | null

  // fetch actions
  hydrate: (data: any) => void
  getNotes: () => Promise<TNotePage[]>
  addNote: (note: INote) => Promise<void>
  getNote: (id: number) => Promise<INote | null>
  setSelectedNoteId: (id: number | null) => void
}

export class NoteStore implements INoteStore {
  // observables
  notes: TNotePage[] = []
  currentNote: INote | null = null
  selectedNoteId: number | null = null

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      // observables
      notes: observable,
      currentNote: observable
    })
  }

  hydrate = (data: INoteStore) => {
    if (data) {
      this.notes = data.notes
      this.currentNote = data.currentNote
    }
  }

  // actions
  getNotes = async () => {
    try {
      const notes = await ipcClient.invoke('note:all')

      return notes.data as TNotePage[]
    } catch (error: any) {
      const err = error as TErrorInfo

      if (err.code === EErrorCodes.FORBIDDEN) {
        toast.error('You do not have permission to access this resource')
        return []
      }

      toast.error('An error occurred while fetching notes')
      return []
    }
  }

  // request the note using invoke
  getNote = async (id: number) => {
    try {
      const note = await ipcClient.invoke('note:getNote', id)

      if (note.error) {
        toast.error(note.error.message)
        return null
      }

      return note.data ?? null
    } catch (error: any) {
      const err = error as TErrorInfo

      if (err.code === EErrorCodes.FORBIDDEN) {
        toast.error('You do not have permission to access this resource')
        return null
      }

      toast.error('An error occurred while fetching the note')
      return null
    }
  }

  addNote = async (note: INote) => {
    try {
      const response = await ipcClient.invoke('note:createNote', note)

      if (response.error) {
        toast.error(response.error.message)
        return
      }

      this.notes.push(response.data as TNotePage)
      toast.success('Note created successfully')
    } catch (error: any) {
      const err = error as TErrorInfo

      if (err.code === EErrorCodes.FORBIDDEN) {
        toast.error('You do not have permission to access this resource')
        return
      }

      toast.error('An error occurred while creating the note')
    }
  }

  setSelectedNoteId = (id: number | null) => {
    this.selectedNoteId = id
  }
}
