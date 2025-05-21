import * as React from 'react'
import { Frame, PieChart, SquareTerminal } from 'lucide-react'

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
import { useI18n } from '@renderer/hooks/use-i18n'
import { useUserStore } from '@renderer/core/store/user.store'

export const AppSidebar = (props: { className?: string }) => {
  const { isUserLoggedIn } = useUserStore()
  const { t } = useI18n()

  if (!isUserLoggedIn) return null

  const data: {
    teams: {
      name: string
      logo: React.ComponentType
      plan: string
    }[]
    navMain: NavMainProps['items']
  } = {
    teams: [
      {
        name: 'Design Engineering',
        logo: Frame,
        plan: 'Team'
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
            title: t('common.overview'),
            url: '/'
          }
        ]
      },
      {
        // Entertainment (e.g. games, movies, etc.)
        title: 'Entertainment',
        url: '/entertainment',
        icon: SquareTerminal,
        isActive: false,
        items: [
          {
            title: 'Manga',
            url: '/entertainment/manga'
          }
        ]
      },
      {
        title: 'System',
        url: '/system/browsers',
        icon: SquareTerminal,
        items: [
          {
            title: t('common.overview'),
            url: '/system'
          },
          {
            title: t('common.browsers'),
            url: '/system/browsers'
          }
        ]
      }
    ]
  }

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
