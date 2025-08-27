import { useApplicationStore } from '@renderer/core/store/application.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { createFileRoute } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@manager/ui'
import { ETheme } from '@manager/common'

const RouteComponent = () => {
  const { t } = useI18n()
  const { setTheme, setLanguage, language, theme, themes, languages } =
    useApplicationStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('settings.navigation.general')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.general.description')}
        </p>
      </div>

      <Separator />

      {/* Appearance Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>{t('settings.appearance.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('settings.appearance.description')}
          </p>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div className="space-y-2">
            <Label htmlFor="theme">{t('common.theme')}</Label>
            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as ETheme)}
            >
              <SelectTrigger className="w-[200px]" id="theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div className="flex items-center gap-2">
                        <span>{theme.name}</span>
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: theme.previewColor }}
                        />
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t('common.language')}</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value)}
            >
              <SelectTrigger className="w-[200px]" id="language">
                <SelectValue placeholder="Select a language" />
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
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/settings/general')({
  component: RouteComponent
})
