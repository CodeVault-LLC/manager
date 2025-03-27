import { observer } from 'mobx-react'
import { useI18n } from '@renderer/hooks/use-i18n'
import { Button } from '@renderer/components/ui/button'
import { useUser } from '@renderer/hooks'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { Settings } from 'lucide-react'

export const IntegrationList = observer(() => {
  const { t } = useI18n()
  const { currentUser, authenticateGoogle } = useUser()

  const integrations = [
    {
      name: 'Google',
      icon: (
        <svg
          className="size-8 md:size-8"
          viewBox="-3 0 262 262"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
        >
          <path
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            fill="#4285F4"
          />
          <path
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            fill="#34A853"
          />
          <path
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            fill="#FBBC05"
          />
          <path
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            fill="#EB4335"
          />
        </svg>
      ),
      status: '',
      description: 'Connect your Google account to sync your data.',
      action: () => {
        authenticateGoogle()
      },
      activated: currentUser?.google?.name !== undefined
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
      },
      activated: false
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
      },
      activated: false
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
        {integrations.map(integration => (
          <div className="border rounded-xl p-3" key={integration.name}>
            <div className="flex flex-row items-center justify-between gap-2">
              {integration.icon}

              {integration.status === 'comingSoon' && (
                <Badge className="bg-amber-600/10 dark:bg-amber-600/20 hover:bg-amber-600/10 text-amber-500 shadow-none rounded-full">
                  Coming Soon
                </Badge>
              )}

              {integration.activated && (
                <Badge className="bg-green-600/10 dark:bg-green-600/20 hover:bg-green-600/10 text-green-500 shadow-none rounded-full">
                  Connected
                </Badge>
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
                  {integration.activated && (
                    <Button
                      variant="outline"
                      size={'sm'}
                      className="flex flex-row items-center"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Button>
                  )}

                  {integration.activated ? (
                    <Button
                      variant="outline"
                      size={'sm'}
                      onClick={() => console.log('Disconnect')}
                      disabled={true}
                    >
                      Disconnect
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
