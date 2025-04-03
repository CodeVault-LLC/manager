import { observer } from 'mobx-react'
import { useI18n } from '@renderer/hooks/use-i18n'
import { Button } from '@renderer/components/ui/button'
import { useUser } from '@renderer/hooks'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { Settings } from 'lucide-react'
import { Google } from '@renderer/components/brands/google'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'

type Integration = {
  name: string
  icon: JSX.Element
  status: string | undefined
  description: string
  action: () => void
  revoke?: () => void
}

export const IntegrationList = observer(() => {
  const { t } = useI18n()
  const { currentUser, authenticateGoogle, revokeGoogle } = useUser()

  const integrations: Integration[] = [
    {
      name: 'Google',
      icon: <Google className="size-8" />,
      status: currentUser?.google?.status,
      description: 'Connect your Google account to sync your data.',
      action: () => {
        authenticateGoogle()
      },
      revoke: () => {
        revokeGoogle()
      }
    },
    {
      name: 'Apple',
      icon: (
        <svg
          fill="#000000"
          className="size-8 md:size-8"
          viewBox="-52.01 0 560.035 560.035"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655" />
        </svg>
      ),
      status: 'comingSoon',
      description: 'Connect your Apple account to sync your data.',
      action: () => {
        console.log('Test')
      }
    },
    {
      name: 'Microsoft',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 23 23"
          className="size-8"
        >
          <path fill="#f3f3f3" d="M0 0h23v23H0z" />
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
      ),
      status: 'comingSoon',
      description: 'Connect your Microsoft account to sync your data.',
      action: () => {
        console.log('Test')
      }
    }
  ]

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">
            {t('settings.integrations.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.integrations.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 my-4">
        {integrations.map((integration) => (
          <div className="border rounded-xl p-3" key={integration.name}>
            <div className="flex flex-row items-center justify-between gap-2">
              {integration.icon}

              {integration.status === 'comingSoon' && (
                <Badge className="bg-amber-600/10 dark:bg-amber-600/20 hover:bg-amber-600/10 text-amber-500 shadow-none rounded-full">
                  {t('common.comingSoon')}
                </Badge>
              )}

              {integration.status === 'ACTIVE' && (
                <Badge className="bg-green-600/10 dark:bg-green-600/20 hover:bg-green-600/10 text-green-500 shadow-none rounded-full">
                  {t('common.connected')}
                </Badge>
              )}

              {integration.status === 'REVOKED' && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="bg-red-600/10 dark:bg-red-600/20 hover:bg-red-600/10 text-red-500 shadow-none rounded-full">
                      {t('common.revoked')}
                    </Badge>
                  </TooltipTrigger>

                  <TooltipContent>
                    {t('settings.integrations.revokedTooltip')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <h2 className="mt-2 font-medium">{integration.name}</h2>

            <p className="text-sm text-gray-500 font-medium mt-1">
              {integration.description}
            </p>

            {integration.status !== 'comingSoon' && (
              <>
                <Separator className="my-2" />

                <div className="flex flex-row items-center justify-between">
                  {integration.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size={'sm'}
                      className="flex flex-row items-center"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Button>
                  )}

                  {integration.status === 'ACTIVE' ? (
                    <Button
                      variant="outline"
                      size={'sm'}
                      onClick={integration.revoke}
                    >
                      {t('common.revoke')}
                    </Button>
                  ) : integration.status === 'REVOKED' ? (
                    <Button
                      variant="outline"
                      size={'sm'}
                      onClick={integration.action}
                    >
                      {t('common.reauthorize')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size={'sm'}
                      onClick={integration.action}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
})
