import { Card, Button } from '@manager/ui'
import { LogIn } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useI18n } from '@renderer/hooks/use-i18n'

export const NoUserCard = () => {
  const { t } = useI18n()

  return (
    <Card className="overflow-hidden shadow-sm border-dashed border-2 bg-muted/10">
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:px-8 gap-6">
        {/* Left Side: Icon & Text */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3 shrink-0">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-lg tracking-tight">
              {t('user.not_logged_in')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('user.suggest_account')}
            </p>
          </div>
        </div>

        {/* Right Side: Call to Action */}
        <Button
          asChild
          className="w-full sm:w-auto shrink-0 shadow-sm"
          size="lg"
        >
          <Link to="/login">{t('user.login')}</Link>
        </Button>
      </div>
    </Card>
  )
}
