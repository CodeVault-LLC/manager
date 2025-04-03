import { cn } from '@renderer/utils/helpers'
import { FC } from 'react'

type TLoadingSpinner = {
  className?: string
}

export const LoadingSpinner: FC<TLoadingSpinner> = ({ className }) => {
  return (
    <div
      className={cn(
        'w-7 h-7 border-[3px] border-secondary border-t-primary rounded-full animate-spin',
        className
      )}
    />
  )
}
