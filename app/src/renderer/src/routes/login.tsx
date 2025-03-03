import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers/authentication.helper'
import { createFileRoute } from '@tanstack/react-router'

import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  return (
    <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
      
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/login')({
  component: WorkspaceManagementPage
})
