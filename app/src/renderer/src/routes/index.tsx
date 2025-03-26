import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import AdminUpcoming from '@renderer/core/components/admin-upcoming/admin-upcoming'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'

const WorkspaceManagementPage = observer(() => {
  const recentChats = [
    {
      id: 1,
      name: 'John Doe',
      profileImage: 'https://via.placeholder.com/150',
      message: 'Hey, are we still on for tomorrow?',
      date: '2023-10-01',
      isRead: false,
      chatLink: '#'
    },
    {
      id: 2,
      name: 'Jane Smith',
      profileImage: 'https://via.placeholder.com/150',
      message: 'I sent over the report. Let me know.',
      date: '2023-10-02',
      isRead: true,
      chatLink: '#'
    }
  ]

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="grid auto-rows-min gap-6 p-4 md:grid-cols-3 md:p-6">
        <div>
          <iframe
            src="https://www.yr.no/nb/innhold/1-131071/card.html"
            className="h-[400px] w-full rounded-xl border-0 bg-muted"
            frameBorder="0"
            title="Weather Widget"
            allowFullScreen
            allowTransparency
            id="yr-weather-widget"
            scrolling="no"
          />
        </div>

        {/* Recent Chats */}
        <ul className="flex flex-col gap-4 md:col-span-2">
          {recentChats.map((chat) => (
            <li className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{chat.name}</div>
                  <div className="text-xs text-muted-foreground">{chat.date}</div>
                  {!chat.isRead && (
                    <svg
                      className="h-2 w-2 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" fill="currentColor" />
                    </svg>
                  )}

                  <Button variant="ghost" size="icon" className="ml-auto">
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L2 7v5c0 5.25 4.5 9.5 10 9.5s10-4.25 10-9.5V7l-10-5z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {chat.message.length > 50 ? `${chat.message.slice(0, 50)}...` : chat.message}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Placeholder sections */}
        <div className="aspect-video rounded-xl bg-muted" />
        <div className="aspect-video rounded-xl bg-muted" />
      </div>

      {/* Upcoming Events */}
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        <AdminUpcoming />
      </div>
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
