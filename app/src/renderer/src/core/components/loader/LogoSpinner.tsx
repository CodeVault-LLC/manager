import { Loader2 } from 'lucide-react'
import { useTheme } from '@renderer/hooks'

export const LogoSpinner = () => {
  const { theme } = useTheme()
  const iconColor = theme === 'dark' ? 'text-white' : 'text-black'

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`w-[82px] h-[82px] mr-2 animate-spin ${iconColor}`} />
    </div>
  )
}
