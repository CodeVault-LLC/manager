import { observer } from 'mobx-react'

export const NetworkError = observer(() => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-3xl font-semibold text-gray-800">Network Error</div>
      <div className="text-lg text-gray-600">
        Please check your internet connection and try again
      </div>
    </div>
  )
})
