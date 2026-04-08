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
import { Settings, User, Shield, Puzzle, Link as LinkIcon } from 'lucide-react'
import { ScrollArea } from '@manager/ui'

export const Route = createFileRoute('/settings')({
  component: RouteComponent
})

type NavItem = {
  value: string
  label: string
  link: LinkProps['to']
  group?: string
  icon: React.ElementType
}

function RouteComponent() {
  const { t } = useI18n()
  const [active, setActive] = useState<string>('general')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    {
      value: 'general',
      label: t('settings.navigation.general'),
      link: '/settings/general',
      group: 'Application',
      icon: Settings
    },
    {
      value: 'user',
      label: t('settings.navigation.user'),
      link: '/settings/user',
      group: 'Application',
      icon: User
    },
    {
      value: 'security',
      label: t('settings.navigation.security'),
      link: '/settings/security',
      group: 'Application',
      icon: Shield
    },
    {
      value: 'connections',
      label: t('settings.navigation.connections'),
      link: '/settings/connections',
      group: 'Integrations',
      icon: LinkIcon
    },
    {
      value: 'extensions',
      label: t('settings.navigation.extensions'),
      link: '/settings/extensions',
      group: 'Integrations',
      icon: Puzzle
    }
  ]

  useEffect(() => {
    const match = navItems.find(
      (item) =>
        typeof item.link === 'string' &&
        pathname.startsWith(item.link as string)
    )
    if (match) setActive(match.value)
    else if (pathname === '/settings')
      void navigate({ to: '/settings/general' })
  }, [pathname])

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>(
    (acc, item) => {
      const group = item.group || 'Other'
      acc[group] = acc[group] || []
      acc[group].push(item)
      return acc
    },
    {}
  )

  return (
    <div className="flex h-full w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-muted/20">
        <ScrollArea className="h-full py-6 px-4">
          <div className="mb-6 px-2">
            <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          </div>

          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group}
              </h3>
              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.value
                  return (
                    <Link key={item.value} to={item.link}>
                      <div
                        className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                        />
                        {item.label}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Content Container - Constrained width for readability */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
