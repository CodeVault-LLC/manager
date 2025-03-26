import * as React from 'react'
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@renderer/components/ui/sidebar'
import { NavMain, NavMainProps } from './sidebar-main'
import { TeamSwitcher } from './sidebar-workspace'
import { NavUser } from './sidebar-user'
import { useUser } from '@renderer/hooks'
import { observer } from 'mobx-react'

const data: {
  teams: {
    name: string
    logo: React.ComponentType
    plan: string
  }[]
  navMain: NavMainProps['items']
  projects: {
    name: string
    url: string
    icon: React.ComponentType
  }[]
} = {
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: PieChart,
      isActive: false,
      items: [
        {
          title: 'Overview',
          url: '/'
        },
        {
          title: 'Analytics',
          url: '/'
        },
        {
          title: 'Performance',
          url: '/'
        }
      ]
    },
    {
      title: 'Projects',
      url: '/',
      icon: Frame,
      items: [
        {
          title: 'Design Engineering',
          url: '/'
        },
        {
          title: 'Sales & Marketing',
          url: '/'
        },
        {
          title: 'Travel',
          url: '/'
        }
      ]
    },
    {
      title: 'Notes',
      url: '/',
      icon: SquareTerminal,
      items: [
        {
          title: 'All Notes',
          url: '/notes'
        },
        {
          title: 'Starred',
          url: '/'
        },
        {
          title: 'Trash',
          url: '/'
        }
      ]
    },
    {
      title: 'Playground',
      url: '/',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '/'
        },
        {
          title: 'Starred',
          url: '/'
        },
        {
          title: 'Settings',
          url: '/settings'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '/',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '/',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '/',
      icon: Map
    }
  ]
}

export const AppSidebar = observer((props: { className?: string }) => {
  const { isUserLoggedIn } = useUser()

  if (!isUserLoggedIn) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
})
