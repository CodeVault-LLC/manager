import { useI18n } from '@renderer/hooks/use-i18n'
import {
  CheckCircleIcon,
  HelpCircleIcon,
  MonitorIcon,
  NotebookIcon,
  PieChart,
  SettingsIcon,
  TerminalIcon
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@manager/ui'

import { NavMain, NavMainProps } from './sidebar-main'
import { NavSecondary, NavSecondaryProps } from './sidebar-secondary'
import { NavUser } from './sidebar-user'
import { Link } from '@tanstack/react-router'

export const AppSidebar = (props: { className?: string }) => {
  const { t } = useI18n()

  const data: {
    navMain: NavMainProps['items']
    navSecondary: NavSecondaryProps['items']
  } = {
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
      /*{
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
      },*/
      {
        title: t('navigation.notes'),
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
        title: t('navigation.system'),
        url: '/system/browsers',
        icon: MonitorIcon,
        items: [
          {
            title: t('common.overview'),
            url: '/system'
          },
          {
            title: t('common.network'),
            url: '/system/network'
          },
          {
            title: t('common.browsers'),
            url: '/system/browsers'
          }
        ]
      },
      {
        title: t('navigation.developer'),
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
        title: t('common.settings'),
        url: '/settings',
        icon: SettingsIcon
      },
      {
        title: t('common.help'),
        url: '/',
        icon: HelpCircleIcon
      }
    ]
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img
                  src="../../resources/icons/icon-256x256.png?asset"
                  alt="Manager Logo"
                  className="h-6 w-6 mr-2"
                />
                <span className="text-base font-semibold">Manager</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
