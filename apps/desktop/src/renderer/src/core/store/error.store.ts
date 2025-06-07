import { EErrorCodes, TErrorInfo } from '@manager/common/src'
import { create } from 'zustand'

export interface IErrorStore {
  isCurrentError: boolean
  errors: TErrorInfo[]

  getErrors: () => TErrorInfo[]
  addError: (error: TErrorInfo) => void
  getError: (code: EErrorCodes) => TErrorInfo | undefined
  removeError: (code: EErrorCodes) => void
  clearErrors: () => void
}

export const useErrorStore = create<IErrorStore>((set, get) => ({
  isCurrentError: false,
  errors: [],

  getErrors: () => get().errors,

  getError: (code: EErrorCodes) =>
    get().errors.find((error) => error.code === code),

  addError: (error: TErrorInfo) => {
    const errorIndex = get().errors.findIndex((err) => err.code === error.code)

    if (errorIndex !== -1) {
      set((state) => ({
        errors: state.errors.map((err, idx) =>
          idx === errorIndex ? { ...err, ...error } : err
        )
      }))
    } else {
      set((state) => ({
        errors: [...state.errors, error]
      }))
    }

    set({
      isCurrentError: true
    })
  },

  removeError: (code: EErrorCodes) => {
    set((state) => ({
      errors: state.errors.filter((error) => error.code !== code),
      isCurrentError: state.errors.length > 0
    }))
  },

  clearErrors: () => set({ errors: [], isCurrentError: false })
}))
