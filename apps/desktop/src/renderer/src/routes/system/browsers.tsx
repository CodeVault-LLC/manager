import { Edge } from '@renderer/components/brands'
import { Chrome } from '@renderer/components/brands/chrome'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useSystemStore } from '@renderer/core/store/system.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { Settings } from 'lucide-react'

import { Button, Badge, Separator } from '@manager/ui'

const RouteComponent = () => {
  const { t } = useI18n()
  const { browsers } = useSystemStore()

  const browserIcons = {
    chrome: <Chrome className="size-6" />,
    edge: <Edge className="size-6" />
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold">{t('common.browsers')}</h1>

        <Separator className="my-4" />

        <div className="grid gap-4 grid-cols-4 sm:grid-cols-2">
          {browsers?.map((browser) => (
            <div className="border rounded-xl p-3" key={browser.name}>
              <div className="flex flex-row items-center justify-between gap-2">
                {browserIcons[browser.icon]}

                {browser.installed && (
                  <Badge className="bg-green-600/10 dark:bg-green-600/20 hover:bg-green-600/10 text-green-500 shadow-none rounded-full">
                    {t('common.installed')}
                  </Badge>
                )}
              </div>

              <h2 className="mt-2 font-medium">{browser.name}</h2>

              <p className="text-sm text-gray-500 font-medium mt-1">
                {browser.description}
              </p>

              <Separator className="my-2" />

              <div className="flex flex-row items-center justify-between">
                {browser.installed && (
                  <Button
                    variant="outline"
                    size={'sm'}
                    className="flex flex-row items-center"
                  >
                    <Settings className="size-4" />
                    {t('common.settings')}
                  </Button>
                )}

                {browser.installed && (
                  <Button variant="outline" size={'sm'}>
                    {t('common.sync')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/system/browsers')({
  component: RouteComponent
})
