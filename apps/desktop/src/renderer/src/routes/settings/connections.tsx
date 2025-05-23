import { Separator } from '@renderer/components/ui/separator'
import { IntegrationList } from '@renderer/core/components/integration'
import { useI18n } from '@renderer/hooks/use-i18n'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/connections')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18n()

  return (
    <>
      <h1 className="text-2xl font-bold">
        {t('settings.navigation.connections')}
      </h1>

      <Separator className="my-4" />

      <IntegrationList />
    </>
  )
}
