import { useI18n } from '@renderer/hooks/use-i18n'
import {
  createFileRoute,
  Link,
  LinkProps,
  Outlet,
  useLocation,
  useNavigate
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@manager/ui'

export const Route = createFileRoute('/settings')({
  component: RouteComponent
})

type Tab = {
  value: string
  label: string
  link: LinkProps['to']
}

function RouteComponent() {
  const { t } = useI18n()
  const [tab, setTab] = useState<string>('general')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const tabs: Tab[] = [
    {
      value: 'general',
      label: t('settings.navigation.general'),
      link: '/settings/general'
    },
    {
      value: 'security',
      label: t('settings.navigation.security'),
      link: '/settings/security'
    },
    {
      value: 'connections',
      label: t('settings.navigation.connections'),
      link: '/settings/connections'
    },
    {
      value: 'extensions',
      label: t('settings.navigation.extensions'),
      link: '/settings/extensions'
    }
  ]

  useEffect(() => {
    switch (pathname) {
      case '/settings/general':
        setTab('general')
        break
      case '/settings/security':
        setTab('security')
        break
      case '/settings/connections':
        setTab('connections')
        break
      case '/settings/extensions':
        setTab('extensions')
        break
      default:
        if (pathname === '/settings') {
          void navigate({
            to: '/settings/general'
          })
        }

        break
    }
  }, [pathname])

  return (
    <div className="flex flex-row items-center justify-between">
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
          {tabs.map((tab) => (
            <Link key={tab.value} to={tab.link}>
              <TabsTrigger
                value={tab.value}
                className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                {tab.label}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>

        <div className="mt-8 w-full p-4">
          <Outlet />
        </div>
      </Tabs>
    </div>
  )
}
