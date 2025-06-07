export type AppState = 'active' | 'inactive'

let currentAppState: AppState = 'active'

export const getAppState = (): AppState => currentAppState

export const setAppState = (state: AppState): void => {
  currentAppState = state
}
