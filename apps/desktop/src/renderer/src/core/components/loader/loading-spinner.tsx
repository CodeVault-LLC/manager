import { cn } from '@renderer/utils/helpers'
import { FC } from 'react'

type TLoaderProps = {
  className?: string
  type?: 'spinner' | 'text'
  length?: number | string // width of the text loader
}

export const Loader: FC<TLoaderProps> = ({
  className,
  type = 'spinner',
  length = 100
}) => {
  if (type === 'text') {
    return (
      <div
        className={cn('h-4 bg-gray-300 rounded animate-pulse', className)}
        style={{
          width: typeof length === 'number' ? `${length}px` : length
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        'w-7 h-7 border-[3px] border-secondary border-t-primary rounded-full animate-spin',
        className
      )}
    />
  )
}
