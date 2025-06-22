import { EErrorCodes, EPageTypes } from '@manager/common/src'
import { NetworkError } from '@renderer/core/components/errors/network-error'
import { Loader } from '@renderer/core/components/loader/loading-spinner'
import { useErrorStore } from '@renderer/core/store/error.store'
import { useUserStore } from '@renderer/core/store/user.store'
import { useNavigate } from '@tanstack/react-router'
import { FC, ReactNode, useEffect } from 'react'

type TPageType = EPageTypes

type TAuthenticationWrapper = {
  children: ReactNode
  pageType?: TPageType
}

export const AuthenticationWrapper: FC<TAuthenticationWrapper> = (props) => {
  const navigate = useNavigate()
  const { children, pageType = EPageTypes.AUTHENTICATED } = props

  const {
    isLoading: isUserLoading,
    currentUser,
    fetchCurrentUser
  } = useUserStore()
  const { getError } = useErrorStore()

  const getWorkspaceRedirectionUrl = (): string => {
    return '/'
  }

  useEffect(() => {
    if (isUserLoading) return

    const unauthorizedError = getError(EErrorCodes.UNAUTHORIZED)
    const networkError = getError(EErrorCodes.NETWORK_ERROR)

    if (networkError) {
      return // Don't navigate if there's a network error
    }

    if (unauthorizedError && pageType === EPageTypes.AUTHENTICATED) {
      void navigate({ to: '/login' })
      return
    }

    if (!currentUser?.id) {
      fetchCurrentUser()
      return
    }

    if (pageType === EPageTypes.NON_AUTHENTICATED && currentUser?.id) {
      const redirectionRoute = getWorkspaceRedirectionUrl()
      void navigate({ to: redirectionRoute })
      return
    }

    if (pageType === EPageTypes.AUTHENTICATED && !currentUser?.id) {
      void navigate({ to: '/login' })
      return
    }
  }, [
    currentUser,
    isUserLoading,
    navigate,
    pageType,
    getError,
    fetchCurrentUser
  ])

  // Handle network error view separately
  const networkError = getError(EErrorCodes.NETWORK_ERROR)
  if (networkError) {
    return <NetworkError />
  }

  // Show loading spinner while user is loading
  if (isUserLoading && !currentUser?.id) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  // Handle PUBLIC pages (accessible always)
  if (pageType === EPageTypes.PUBLIC) {
    return <>{children}</>
  }

  // Handle NON_AUTHENTICATED pages
  if (pageType === EPageTypes.NON_AUTHENTICATED) {
    if (!currentUser?.id) {
      return <>{children}</>
    } else {
      // Redirect handled in useEffect
      return null
    }
  }

  // Handle AUTHENTICATED pages
  if (pageType === EPageTypes.AUTHENTICATED) {
    if (currentUser?.id) {
      return <>{children}</>
    } else {
      // Redirect handled in useEffect
      return null
    }
  }

  // Fallback (should never happen)
  return <>{children}</>
}
