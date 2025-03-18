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
      title: 'Tasks',
      url: '/',
      icon: Map
    },
    {
      title: 'Calendar',
      url: '/',
      icon: AudioWaveform
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
}
