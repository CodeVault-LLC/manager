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
  group?: string // optional grouping like Windows/macOS
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
    if (match) {
      setActive(match.value)
    } else if (pathname === '/settings') {
      void navigate({ to: '/settings/general' })
    }
  }, [pathname])

  // Group items like macOS style
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
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4">
        <ScrollArea className="h-full">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {group}
              </h3>
              <nav className="space-y-1">
                {items.map((item) => (
                  <Link key={item.value} to={item.link}>
                    <div
                      className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active === item.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
