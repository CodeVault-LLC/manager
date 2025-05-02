import { PremierLeague } from '@renderer/components/brands'
import { useSystem } from '@renderer/hooks'
import { observer } from 'mobx-react'
import { FC } from 'react'

export const FeaturedMatches: FC = observer(() => {
  const { openExternal } = useSystem()

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <h2 className="text-base font-semibold mb-4">Featured Matches</h2>

      <a
        className="flex items-center cursor-pointer my-2 py-4 px-12 rounded-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 hover:dark:bg-gray-600 transition-colors duration-200"
        onClick={() =>
          openExternal(
            'https://www.msn.com/en-sg/sport/premier_league/fixtures?ocid=hpmsn&cvid=49699dcce6a74be193ee9c90184b0a5d&ei=18'
          )
        }
      >
        <div className="flex items-center">
          <PremierLeague className="w-6 h-6 mr-2" />
          <span className="text-sm font-semibold">Premier League</span>
        </div>
      </a>
    </div>
  )
})
