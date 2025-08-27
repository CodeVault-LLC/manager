import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button
} from '@manager/ui'
import { LogIn } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useI18n } from '@renderer/hooks/use-i18n'

export const NoUserCard = () => {
  const { t } = useI18n()

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-col items-center text-center space-y-2">
        <LogIn className="h-10 w-10 text-muted-foreground" />
        <CardTitle className="text-xl">{t('user.not_logged_in')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('user.suggest_account')}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link to="/login">{t('user.login')}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
