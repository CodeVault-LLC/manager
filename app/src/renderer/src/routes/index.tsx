import AdminUpcoming from '@renderer/core/components/admin-upcoming/admin-upcoming'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '../../../helpers/authentication.helper'
import { createFileRoute } from '@tanstack/react-router'

import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div></div>
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <AdminUpcoming />
      </div>
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
