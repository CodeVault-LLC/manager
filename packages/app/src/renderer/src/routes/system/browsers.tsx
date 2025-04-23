import { Separator } from '@renderer/components/ui/separator'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useSystem } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Settings } from 'lucide-react'

const RouteComponent = observer(() => {
  const { t } = useI18n()
  const { browsers } = useSystem()

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold">{t('common.browsers')}</h1>

        <Separator className="my-4" />

        <div className="grid gap-4 grid-cols-4 sm:grid-cols-2">
          {browsers?.map((browser) => (
            <div className="border rounded-xl p-3" key={browser.name}>
              <div className="flex flex-row items-center justify-between gap-2">
                {browser.icon}

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
})

export const Route = createFileRoute('/system/browsers')({
  component: RouteComponent
})
