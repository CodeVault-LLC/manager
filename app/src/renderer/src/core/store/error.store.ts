import { observable, makeObservable } from 'mobx'
import { CoreRootStore } from './root.store'
import { EErrorCodes, TErrorInfo } from '@shared/helpers'

export interface IErrorStore {
  // observables
  isCurrentError: boolean // If theres an error that is still active
  errors: TErrorInfo[]

  // fetch actions
  hydrate: (data: any) => void
  getErrors: () => TErrorInfo[]
  addError: (error: TErrorInfo) => void
  getError: (code: EErrorCodes) => TErrorInfo | undefined
}

export class ErrorStore implements IErrorStore {
  // observables
  isCurrentError: boolean = false
  errors: TErrorInfo[] = []

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isCurrentError: observable.ref,
      errors: observable.ref
    })
  }

  hydrate = (data: IErrorStore) => {
    if (data) {
      this.isCurrentError = data.isCurrentError
      this.errors = data.errors
    }
  }

  getErrors = () => this.errors

  getError: (code: EErrorCodes) => TErrorInfo | undefined = (code: EErrorCodes) =>
    this.errors.find((error) => error.code === code)

  addError = (error: TErrorInfo) => {
    const errorIndex = this.errors.findIndex((err) => err.code === error.code)

    if (errorIndex !== -1) {
      this.errors[errorIndex] = error
    } else {
      this.errors.push(error)
    }

    this.isCurrentError = true
  }

  removeError = (code: EErrorCodes) => {
    const errorIndex = this.errors.findIndex((error) => error.code === code)

    if (errorIndex !== -1) {
      this.errors.splice(errorIndex, 1)
    }

    if (this.errors.length === 0) {
      this.isCurrentError = false
    }
  }
}
