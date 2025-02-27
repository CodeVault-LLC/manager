import { RootStore } from '@renderer/ce/store/root.store'
import { ReactElement, createContext } from 'react'

export let rootStore = new RootStore()

export const StoreContext = createContext<RootStore>(rootStore)

const initializeStore = () => {
  const newRootStore = rootStore ?? new RootStore()
  if (typeof window === 'undefined') return newRootStore
  if (!rootStore) rootStore = newRootStore
  return newRootStore
}

export const store = initializeStore()

export const StoreProvider = ({ children }: { children: ReactElement }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
