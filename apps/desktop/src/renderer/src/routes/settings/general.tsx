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
  Card
} from '@manager/ui'
import { ETheme } from '@manager/common'
import { Palette, Globe } from 'lucide-react'

const RouteComponent = () => {
  const { t } = useI18n()
  const { setTheme, setLanguage, language, theme, themes, languages } =
    useApplicationStore()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Standardized Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('settings.navigation.general')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('settings.general.description')}
        </p>
      </div>

      <Separator />

      {/* Settings Section: Appearance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {t('settings.appearance.title')}
        </h2>

        <Card className="overflow-hidden shadow-sm">
          {/* Setting Row 1 */}
          <div className="flex items-center justify-between border-b p-4 sm:px-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <label className="text-sm font-medium">
                  {t('common.theme')}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.appearance.description')}
                </p>
              </div>
            </div>

            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as ETheme)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {themes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: t.previewColor }}
                        />
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Setting Row 2 */}
          <div className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <label className="text-sm font-medium">
                  {t('common.language')}
                </label>
                <p className="text-xs text-muted-foreground">
                  Select your preferred application language
                </p>
              </div>
            </div>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {languages.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/settings/general')({
  component: RouteComponent
})
