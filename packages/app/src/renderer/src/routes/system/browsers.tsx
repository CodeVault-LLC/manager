import { Separator } from '@renderer/components/ui/separator'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useSystem } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'

const RouteComponent = observer(() => {
  const { t } = useI18n()
  const { browsers } = useSystem()

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold">{t('common.browsers')}</h1>

        <Separator className="my-4" />

        {browsers &&
          browsers.map((browser) => (
            <div
              key={browser.id}
              className="flex flex-row items-center justify-between p-4 border-b"
            >
              <div className="flex flex-row items-center gap-2">
                {browser.icon}
                <span className="text-lg font-bold">{browser.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t('common.version', { version: browser.version })}
              </span>
            </div>
          ))}
      </div>
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/system/browsers')({
  component: RouteComponent
})
