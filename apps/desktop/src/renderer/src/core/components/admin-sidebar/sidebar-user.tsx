import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings2,
  Sparkles
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@manager/ui'

import { Loader } from '../loader/loading-spinner'
import { useErrorStore } from '../../store/error.store'
import { EErrorCodes } from '@manager/common/src'

export const NavUser = () => {
  const { t } = useI18n()
  const { isMobile } = useSidebar()
  const { currentUser, signOut } = useUserStore()
  const { getError } = useErrorStore()
  const navgiate = useNavigate()

  const displayUserLoading = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src="" alt="Loading..." />
        <AvatarFallback className="rounded-lg bg-gray-300" />
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          <Loader type="text" className="mr-2" length={100} />
        </span>
        <span className="truncate text-xs mt-1">
          <Loader className="mr-2" type="text" length={150} />
        </span>
      </div>
      <ChevronsUpDown className="ml-auto size-4" />
    </SidebarMenuButton>
  )

  const displayUserNotLoggedIn = (
    <SidebarMenuButton
      size="lg"
      onClick={() => {
        void navgiate({ to: '/login', replace: true })
      }}
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-gray-300"></AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {t('user.not_logged_in')}
        </span>
        <span className="truncate text-xs mt-1">
          {t('user.login_to_continue')}
        </span>
      </div>
      <ChevronsUpDown className="ml-auto size-4" />
    </SidebarMenuButton>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {!currentUser && getError(EErrorCodes.NETWORK_ERROR) ? (
            <DropdownMenuTrigger asChild disabled>
              {displayUserLoading}
            </DropdownMenuTrigger>
          ) : !currentUser ? (
            <DropdownMenuTrigger asChild>
              {displayUserNotLoggedIn}
            </DropdownMenuTrigger>
          ) : (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                  />
                  <AvatarFallback className="rounded-lg">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentUser.username}
                  </span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          )}

          {currentUser && (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={currentUser.avatar_url}
                      alt={currentUser.username}
                    />
                    <AvatarFallback className="rounded-lg">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {currentUser.username}
                    </span>
                    <span className="truncate text-xs">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link to="/settings/general">
                  <DropdownMenuItem>
                    <Settings2 />
                    {t('navigation.settings')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  signOut()
                }}
              >
                <LogOut />
                {t('user.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
