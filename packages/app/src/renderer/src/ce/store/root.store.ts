import { CoreRootStore } from '@renderer/core/store/root.store'
import { enableStaticRendering } from 'mobx-react'
// stores

enableStaticRendering(typeof window === 'undefined')

export class RootStore extends CoreRootStore {
  constructor() {
    super()
  }

  hydrate(initialData: any) {
    super.hydrate(initialData)
  }

  resetOnSignOut() {
    super.resetOnSignOut()
  }
}
