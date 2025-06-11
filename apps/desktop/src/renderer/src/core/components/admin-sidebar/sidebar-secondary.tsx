import * as React from 'react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@manager/ui'
import { LucideIcon } from 'lucide-react'
import { Link, LinkProps } from '@tanstack/react-router'
import { useApplicationStore } from '../../store/application.store'

export interface NavSecondaryProps {
  items: {
    title: string
    url: LinkProps['to']
    icon: LucideIcon
  }[]
}

export function NavSecondary({
  items,
  ...props
}: NavSecondaryProps & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { doUpdateAction, update } = useApplicationStore()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {update?.isUpdateAvailable && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => doUpdateAction(true)}>
                <span className="text-red-500">
                  {update?.isUpdateAvailable
                    ? 'Update Available'
                    : 'No Updates'}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
