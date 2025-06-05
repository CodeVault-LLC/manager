import { FC, useEffect } from 'react'
import { useDashboardStore } from '../../store/dashboard.store'

export const FeaturedMatches: FC = () => {
  const { sports, fetchSports } = useDashboardStore()

  useEffect(() => {
    void fetchSports()
  }, [fetchSports])

  const getMatchStatusLabel = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'Upcoming'
      case 'InProgress':
        return 'Live'
      case 'Final':
      case 'Completed':
        return 'Finished'
      default:
        return status
    }
  }

  return (
    <div className="p-4 rounded-lg shadow-md">
      <h2 className="text-base font-semibold mb-4">Featured Matches</h2>

      {sports.length === 0 && (
        <p className="text-sm text-gray-500">No matches available.</p>
      )}

      {sports.slice(0, 6).map((match) => {
        const [team1, team2] = match.participants
        const isLive = match.status === 'InProgress'
        const isFinished =
          match.status === 'Final' || match.status === 'Completed'

        return (
          <div
            key={match.id}
            className={`flex items-center justify-between px-4 py-3 my-2 rounded-md transition cursor-pointer 
              ${isFinished ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'}
              ${isLive ? 'border-l-4 border-red-500' : ''}`}
          >
            {/* Teams */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {team1?.team.shortName}
              </span>
              <span className="mx-2 text-xs text-gray-500">vs</span>
              <span className="text-sm font-medium">
                {team2?.team.shortName}
              </span>
            </div>

            {/* Match Info */}
            <div className="text-right text-xs text-gray-600 dark:text-gray-300">
              <div>{new Date(match.startDateTime).toLocaleString()}</div>
              <div className="italic">
                {isLive ? (
                  <span className="text-red-500 font-bold animate-pulse">
                    LIVE
                  </span>
                ) : (
                  getMatchStatusLabel(match.status)
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
