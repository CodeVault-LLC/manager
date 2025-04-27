import { News } from '@renderer/core/components/news'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="flex flex-col p-4 gap-4">
        <SystemWidget />

        <News />
      </div>
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
