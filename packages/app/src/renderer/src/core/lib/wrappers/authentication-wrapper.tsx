import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { EErrorCodes, EPageTypes } from '@shared/helpers'
import { useUser } from '@renderer/hooks'
import { useNavigate } from '@tanstack/react-router'
import { LoadingSpinner } from '@renderer/core/components/loader/loading-spinner'
import { useError } from '@renderer/hooks/use-error'
import { NetworkError } from '@renderer/core/components/errors/network-error'
import { useDashboard } from '@renderer/hooks/use-dashboard'

type TPageType = EPageTypes

type TAuthenticationWrapper = {
  children: ReactNode
  pageType?: TPageType
}

export const AuthenticationWrapper: FC<TAuthenticationWrapper> = observer(
  (props) => {
    const navigate = useNavigate()

    const { children, pageType = EPageTypes.AUTHENTICATED } = props
    const {
      isLoading: isUserLoading,
      currentUser,
      fetchCurrentUser
    } = useUser()
    const { fetchWidgets: getWidgets } = useDashboard()
    const { getError, errors } = useError()

    useEffect(() => {
      if (
        getError(EErrorCodes.UNAUTHORIZED) &&
        pageType === EPageTypes.AUTHENTICATED
      ) {
        navigate({ to: '/login' })
        return
      }

      if (!currentUser?.id && !isUserLoading) {
        fetchCurrentUser()

        getWidgets()
        return
      }

      return
    }, [currentUser, errors])

    const getWorkspaceRedirectionUrl = (): string => {
      let redirectionRoute = '/'

      // validate the current workspace_slug is available in the user's workspace list
      /*const isCurrentWorkspaceValid = Object.values(workspaces || {}).findIndex(
      (workspace) => workspace.slug === currentWorkspaceSlug
    )

    if (isCurrentWorkspaceValid >= 0) redirectionRoute = `/${currentWorkspaceSlug}`*/

      return redirectionRoute
    }

    if (getError(EErrorCodes.NETWORK_ERROR)) {
      return <NetworkError />
    }

    if (isUserLoading && !currentUser?.id)
      return (
        <div className="relative flex h-screen w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      )

    if (pageType === EPageTypes.PUBLIC) return <>{children}</>

    if (pageType === EPageTypes.NON_AUTHENTICATED) {
      if (!currentUser?.id) {
        return <>{children}</>
      } else {
        const currentRedirectRoute = getWorkspaceRedirectionUrl()
        navigate({ to: currentRedirectRoute })
        return <></>
      }
    }

    if (pageType === EPageTypes.AUTHENTICATED) {
      if (currentUser?.id && !isUserLoading) {
        return <>{children}</>
      } else if (!isUserLoading) {
        return
      } else {
        navigate({ to: '/login' })
        return <></>
      }
    }

    return <>{children}</>
  }
)
