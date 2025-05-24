import { UserEditFields } from '@renderer/components/UserEditFields'
import { useApplicationStore } from '@renderer/core/store/application.store'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { ETheme } from '@shared/types/application'
import { createFileRoute } from '@tanstack/react-router'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Label
} from '@manager/ui'

const RouteComponent = () => {
  const { t } = useI18n()
  const { updateUser } = useUserStore()
  const { setTheme, setLanguage, language, theme, themes, languages } =
    useApplicationStore()

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
            value={theme}
            onValueChange={(value) => {
              const theme = value as ETheme

              setTheme(theme)
            }}
            defaultValue={theme}
          >
            <SelectTrigger className="w-[180px]" id="language">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      {theme.id === ETheme.SYSTEM ? (
                        <span>{t('settings.appearance.theme.system')}</span>
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
            value={language}
            onValueChange={(value) => {
              const theme = value as ETheme

              setLanguage(theme)
            }}
            defaultValue={language}
          >
            <SelectTrigger className="w-[180px]" id="language">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {languages.map((language) => (
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
}

export const Route = createFileRoute('/settings/general')({
  component: RouteComponent
})
