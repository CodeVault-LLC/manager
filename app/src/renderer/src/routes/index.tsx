import AdminUpcoming from '@renderer/core/components/admin-upcoming/admin-upcoming'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'

import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      {/*<img
        className="absolute top-0 left-0 z-[-1] h-screen w-screen object-cover"
        src="https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg"
      />*/}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div></div>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=lukmarwil%40gmail.com&ctz=Europe%2FOslo"
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder={0}
          scrolling="no"
        ></iframe>

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
