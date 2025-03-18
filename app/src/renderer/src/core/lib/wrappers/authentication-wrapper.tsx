import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { EPageTypes } from '@shared/helpers'
import { useUser } from '@renderer/hooks'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { LoadingSpinner } from '@renderer/core/components/loader/loading-spinner'

type TPageType = EPageTypes

type TAuthenticationWrapper = {
  children: ReactNode
  pageType?: TPageType
}

export const AuthenticationWrapper: FC<TAuthenticationWrapper> = observer((props) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { children, pageType = EPageTypes.AUTHENTICATED } = props
  const { isLoading: isUserLoading, currentUser, fetchCurrentUser, userStatus } = useUser()

  useEffect(() => {
    if (userStatus?.status === 'NOT_AUTHENTICATED' && pathname !== '/register') {
      navigate({ to: '/login' })
      return
    }

    if (!currentUser?.id && !isUserLoading) {
      fetchCurrentUser()

      return
    }

    return
  }, [currentUser, isUserLoading, userStatus])

  const getWorkspaceRedirectionUrl = (): string => {
    let redirectionRoute = '/'

    // validate the current workspace_slug is available in the user's workspace list
    /*const isCurrentWorkspaceValid = Object.values(workspaces || {}).findIndex(
      (workspace) => workspace.slug === currentWorkspaceSlug
    )

    if (isCurrentWorkspaceValid >= 0) redirectionRoute = `/${currentWorkspaceSlug}`*/

    return redirectionRoute
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

  /*if (pageType === EPageTypes.SET_PASSWORD) {
    if (!currentUser?.id && !isUserLoading) {
      navigate({ to: '/login' })
      return <></>
    } else {
      if (currentUser) {
        const currentRedirectRoute = getWorkspaceRedirectionUrl()
        navigate({ to: currentRedirectRoute })
        return <></>
      } else return <>{children}</>
    }
  }*/

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
})
