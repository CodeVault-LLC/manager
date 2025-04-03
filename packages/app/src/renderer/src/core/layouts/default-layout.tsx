import { FC, ReactNode } from 'react'

type TDefaultLayout = {
  children: ReactNode
}

export const DefaultLayout: FC<TDefaultLayout> = (props) => {
  const { children } = props
  return (
    <div className="relative">
      <div className="h-screen w-full overflow-hidden overflow-y-auto flex flex-col">
        <div className="relative z-10 flex-grow">{children}</div>
      </div>
    </div>
  )
}
