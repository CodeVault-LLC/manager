import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { EPageTypes } from '@shared/helpers'
import { useUser } from '@renderer/hooks'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { LoadingSpinner } from '@renderer/core/components/loader/loading-spinner'

type TPageType = EPageTypes

type TAuthenticationWrapper = {
  children: ReactNode
  pageType?: TPageType
}

const isValidURL = (url: string): boolean => {
  const disallowedSchemes = /^(https?|ftp):\/\//i
  return !disallowedSchemes.test(url)
}

export const AuthenticationWrapper: FC<TAuthenticationWrapper> = observer((props) => {
  const { location } = useRouterState()
  const { pathname } = location
  const searchParams = new URLSearchParams(location.search)
  const navigate = useNavigate()

  const nextPath = searchParams.get('next_path')
  // props
  const { children, pageType = EPageTypes.AUTHENTICATED } = props
  // hooks
  const { isLoading: isUserLoading, currentUser, fetchCurrentUser } = useUser()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const getWorkspaceRedirectionUrl = (): string => {
    let redirectionRoute = '/'

    // validating the nextPath from the router query
    if (nextPath && isValidURL(nextPath.toString())) {
      redirectionRoute = nextPath.toString()
      return redirectionRoute
    }

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
    if (!currentUser?.id) return <>{children}</>
    else {
      const currentRedirectRoute = getWorkspaceRedirectionUrl()
      navigate({ to: currentRedirectRoute })
      return <></>
    }
  }

  if (pageType === EPageTypes.SET_PASSWORD) {
    if (!currentUser?.id) {
      navigate({ to: `/${pathname ? `?next_path=${pathname}` : ``}` })
      return <></>
    } else {
      if (currentUser) {
        const currentRedirectRoute = getWorkspaceRedirectionUrl()
        navigate({ to: currentRedirectRoute })
        return <></>
      } else return <>{children}</>
    }
  }

  if (pageType === EPageTypes.AUTHENTICATED) {
    if (currentUser?.id) {
      return <>{children}</>
    } else {
      navigate({ to: '/login' })
      return <></>
    }
  }

  return <>{children}</>
})
