import {
  createHashHistory,
  createRouter as TanstackCreateRouter
} from '@tanstack/react-router'

import { NotFound } from './components/NotFound'
import { routeTree } from './routeTree.gen'
import { ErrorComponent } from './core/pages/error/error-component'

const hashHistory = createHashHistory()

export const createRouter = () => {
  const router = TanstackCreateRouter({
    routeTree,
    defaultPreloadDelay: 0,
    defaultPendingMinMs: 0,
    defaultPendingMs: 0,
    defaultPreload: 'intent',
    defaultStaleTime: 1,

    defaultNotFoundComponent: () => {
      return <NotFound />
    },

    defaultErrorComponent: () => {
      return <ErrorComponent />
    },

    history: hashHistory
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
