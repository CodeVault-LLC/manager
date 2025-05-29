import { EPageTypes } from '@manager/common/src'
import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { createFileRoute } from '@tanstack/react-router'

const WorkspaceManagementPage = () => {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="flex flex-col p-4 gap-4">
        <SystemWidget />

        <News />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FeaturedMatches />
        </div>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
