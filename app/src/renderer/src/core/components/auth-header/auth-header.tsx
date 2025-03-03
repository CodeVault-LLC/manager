import { FC } from 'react'
import { observer } from 'mobx-react'
import { useRouterState } from '@tanstack/react-router'
import { SidebarTrigger } from '@renderer/components/ui/sidebar'
import { Separator } from '@renderer/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@renderer/components/ui/breadcrumb'

export const InstanceHeader: FC = observer(() => {
  const { location } = useRouterState()

  const pathName = location.pathname.split('/')[1]

  const getHeaderTitle = (pathName: string) => {
    switch (pathName) {
      case '':
        return 'Home'
      case 'general':
        return 'General'
      case 'ai':
        return 'Artificial Intelligence'
      case 'email':
        return 'Email'
      case 'authentication':
        return 'Authentication'
      case 'image':
        return 'Image'
      case 'google':
        return 'Google'
      case 'github':
        return 'GitHub'
      case 'gitlab':
        return 'GitLab'
      case 'workspace':
        return 'Workspace'
      case 'create':
        return 'Create'
      default:
        return pathName.toUpperCase()
    }
  }

  // Function to dynamically generate breadcrumb items based on pathname
  const generateBreadcrumbItems = (pathname: string) => {
    const pathSegments = pathname.split('/').slice(1) // removing the first empty string.
    pathSegments.pop()

    let currentUrl = ''
    const breadcrumbItems = pathSegments.map((segment) => {
      currentUrl += '/' + segment
      return {
        title: getHeaderTitle(segment),
        href: currentUrl
      }
    })
    return breadcrumbItems
  }

  const breadcrumbItems = generateBreadcrumbItems(pathName)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{getHeaderTitle(pathName)}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                  </BreadcrumbItem>
                ))}

                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getHeaderTitle(pathName)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
})
