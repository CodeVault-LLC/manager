import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@manager/common/src'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useSystemStore } from '../../core/store/system.store'

export const Route = createFileRoute('/system/')({
  component: RouteComponent
})

function RouteComponent() {
  const { getSystem } = useSystemStore()

  useEffect(() => {
    getSystem()
  }, [getSystem])

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      s
    </AuthenticationWrapper>
  )
}
