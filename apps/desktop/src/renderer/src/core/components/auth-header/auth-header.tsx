import { useI18n } from '@renderer/hooks/use-i18n'
import { Link, useRouterState } from '@tanstack/react-router'
import { FC } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarTrigger
} from '@manager/ui'

export const InstanceHeader: FC = () => {
  const { location } = useRouterState()
  const { t } = useI18n()

  const pathname = location.pathname.replace(/\/+$/, '') // remove trailing slashes

  const getDisplayTitle = (segment: string) => {
    switch (segment) {
      case '':
        return t('navigation.home') || 'Home'
      case 'settings':
        return t('navigation.settings') || 'Settings'
      case 'general':
        return 'General'
      case 'entertainment':
        return t('navigation.entertainment') || 'Entertainment'
      case 'verify-email':
        return t('navigation.verifyEmail') || 'Verify Email'
      case 'notes':
        return t('navigation.notes') || 'Notes'
      default:
        return decodeURIComponent(segment)
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean) // remove empty strings
    const allSegments = ['', ...segments] // include root

    const breadcrumbs = allSegments.map((_, index) => {
      const href = '/' + allSegments.slice(1, index + 1).join('/')
      const segment = allSegments[index]
      const isLast = index === allSegments.length - 1

      return {
        title: getDisplayTitle(segment),
        href: href || '/', // Ensure root is always "/"
        isLast
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={index}>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <>
                    <Link
                      to={crumb.href}
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      {crumb.title}
                    </Link>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
