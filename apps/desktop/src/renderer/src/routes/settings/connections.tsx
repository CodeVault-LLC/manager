import { useI18n } from '@renderer/hooks/use-i18n'
import { createFileRoute } from '@tanstack/react-router'

import { Separator } from '@manager/ui'
import IntegrationsGallery from '../../core/components/integration/integration-list'

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

      <IntegrationsGallery />
    </>
  )
}
