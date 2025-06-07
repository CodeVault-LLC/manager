import { Link } from '@tanstack/react-router'
import { FC } from 'react'

export const ErrorComponent: FC = () => {
  return (
    <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
      <h1 className="text-[7rem] leading-tight font-bold">500</h1>
      <span className="font-medium">Oops! Something went wrong :')</span>
      <p className="text-muted-foreground text-center">
        We apologize for the inconvenience.
        <br /> Please try again later.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          onClick={() => {
            window.history.back()
          }}
        >
          Go Back
        </button>
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
          to="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
