import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Separator } from '@renderer/components/ui/separator'
import { UserEditFields } from '@renderer/components/UserEditFields'
import { useSystem, useUser } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { ETheme } from '@shared/types/system'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'

const RouteComponent = observer(() => {
  const { t } = useI18n()
  const { updateUser } = useUser()
  const { setTheme, system, setLanguage } = useSystem()

  return (
    <>
      <h1 className="text-2xl font-bold">{t('settings.navigation.general')}</h1>

      <Separator className="my-4" />

      <h2 className="text-lg font-bold">{t('settings.profile.title')}</h2>
      <p className="text-sm text-muted-foreground">
        {t('settings.profile.description')}
      </p>

      <div className="my-4">
        <UserEditFields
          onSubmit={async (data: any) => {
            updateUser({ ...data })
          }}
          avatar={false}
          password={false}
        />
      </div>

      <Separator className="my-4" />

      <h2 className="text-lg font-bold">{t('settings.appearance.title')}</h2>
      <p className="text-sm text-muted-foreground">
        {t('settings.appearance.description')}
      </p>

      <div className="mt-4 mb-4 flex flex-row gap-2">
        <div>
          <Label htmlFor="language">{t('common.theme')}</Label>

          <Select
            value={system.theme}
            onValueChange={value => {
              const theme = value as ETheme

              setTheme(theme)
            }}
            defaultValue={system.theme}
          >
            <SelectTrigger className="w-[180px]" id="language">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {system.themes.map(theme => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      {theme.id === ETheme.SYSTEM ? (
                        <span>{t('settings.appearance.system')}</span>
                      ) : (
                        <>
                          <span>{theme.name}</span>
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: theme.previewColor
                            }}
                          />
                        </>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language">{t('common.language')}</Label>

          <Select
            value={system.language}
            onValueChange={value => {
              const theme = value as ETheme

              setLanguage(theme)
            }}
            defaultValue={system.language}
          >
            <SelectTrigger className="w-[180px]" id="language">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {system.languages.map(language => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span>{language.flag}</span>
                      {language.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
})

export const Route = createFileRoute('/settings/general')({
  component: RouteComponent
})
