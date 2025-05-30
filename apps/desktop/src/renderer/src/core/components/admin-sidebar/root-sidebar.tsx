import { useErrorStore } from '@renderer/core/store/error.store'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import {
  CheckCircleIcon,
  FilmIcon,
  Frame,
  HelpCircleIcon,
  MonitorIcon,
  NotebookIcon,
  PieChart,
  SettingsIcon,
  TerminalIcon
} from 'lucide-react'
import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@manager/ui'

import { NavMain, NavMainProps } from './sidebar-main'
import { NavSecondary, NavSecondaryProps } from './sidebar-secondary'
import { NavUser } from './sidebar-user'
import { TeamSwitcher } from './sidebar-workspace'
import { EErrorCodes } from '@manager/common/src'

export const AppSidebar = (props: { className?: string }) => {
  const { isUserLoggedIn } = useUserStore()
  const { getError } = useErrorStore()
  const { t } = useI18n()

  if (!isUserLoggedIn && !getError(EErrorCodes.NETWORK_ERROR)) return null

  const data: {
    teams: {
      name: string
      logo: React.ComponentType
      plan: string
    }[]
    navMain: NavMainProps['items']
    navSecondary: NavSecondaryProps['items']
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
        icon: FilmIcon,
        isActive: false,
        items: [
          {
            title: 'Manga',
            url: '/entertainment/manga'
          }
        ]
      },
      {
        title: 'Notes',
        url: '/notes',
        icon: NotebookIcon,
        isActive: false,
        items: [
          {
            title: t('common.overview'),
            url: '/notes'
          }
        ]
      },
      {
        title: 'System',
        url: '/system/browsers',
        icon: MonitorIcon,
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
      },
      {
        title: 'Developer',
        url: '/developer/icons',
        icon: TerminalIcon,
        items: [
          {
            title: t('common.icons'),
            url: '/developer/icons'
          }
        ]
      }
    ],
    navSecondary: [
      {
        title: 'Status',
        url: '/status',
        icon: CheckCircleIcon
      },
      {
        title: 'Settings',
        url: '/',
        icon: SettingsIcon
      },
      {
        title: 'Get Help',
        url: '/',
        icon: HelpCircleIcon
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        {/*<NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
