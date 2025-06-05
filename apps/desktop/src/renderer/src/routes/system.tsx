import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@manager/common/src'
import {
  createFileRoute,
  Link,
  LinkProps,
  Outlet,
  useLocation
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@manager/ui'

export const Route = createFileRoute('/system')({
  component: RouteComponent
})

type Tab = {
  value: string
  label: string
  link: LinkProps['to']
}

function RouteComponent() {
  const { t } = useI18n()
  const [tab, setTab] = useState<string>('overview')
  const { pathname } = useLocation()

  const tabs: Tab[] = [
    {
      value: 'overview',
      label: t('common.overview'),
      link: '/system'
    },
    {
      value: 'hardware',
      label: t('common.hardware'),
      link: '/system/hardware'
    },
    {
      value: 'network',
      label: t('common.network'),
      link: '/'
    },
    {
      value: 'storage',
      label: t('common.storage'),
      link: '/system/storage'
    },
    {
      value: 'security',
      label: t('common.security'),
      link: '/'
    }
  ]

  useEffect(() => {
    switch (pathname) {
      case '/system':
        setTab('overview')
        break
      case '/system/hardware':
        setTab('hardware')
        break
      case '/system/network':
        setTab('network')
        break
      case '/system/storage':
        setTab('storage')
        break
      case '/system/security':
        setTab('security')
        break
      default:
        setTab('overview')
    }
  }, [pathname])

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="w-full p-4">
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
    </AuthenticationWrapper>
  )
}
