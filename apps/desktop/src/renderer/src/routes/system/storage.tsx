import { createFileRoute } from '@tanstack/react-router'
import { AuthenticationWrapper } from '../../core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@manager/common/src'
import { useSystemStore } from '../../core/store/system.store'
import { useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@manager/ui'
import { ScrollArea } from '@manager/ui/src/ui/scroll-area'
import { Skeleton } from '@manager/ui/src/ui/skeleton'
import { Clock, Folder, Package } from 'lucide-react'

const COLORS = [
  '#3B82F6',
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6'
]

export const Route = createFileRoute('/system/storage')({
  component: RouteComponent
})

function RouteComponent() {
  const { getStorageOverview, storage, loading } = useSystemStore()

  useEffect(() => {
    getStorageOverview()
  }, [getStorageOverview])

  const {
    extensions = [],
    heavy_items = [],
    tips = [],
    special_folders = [],
    total_size = 0
  } = storage || {}

  const topExtensions = useMemo(() => {
    return [...extensions]
      .sort((a, b) => b.size_bytes - a.size_bytes)
      .slice(0, 6)
  }, [extensions])

  const totalFiles = heavy_items.length
  const uniqueTypes = extensions.length

  function getSpecialFolderMeta(folderPath: string) {
    const lowerPath = folderPath.toLowerCase()
    if (lowerPath.includes('node_modules')) {
      return {
        icon: <Package className="w-5 h-5 text-yellow-600" />,
        tooltip: 'Node modules can be large; consider cleaning or pruning them.'
      }
    } else if (lowerPath.includes('tmp') || lowerPath.includes('temp')) {
      return {
        icon: <Clock className="w-5 h-5 text-red-500" />,
        tooltip: 'Temporary files can be safely deleted to free up space.'
      }
    }
    return {
      icon: <Folder className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
      tooltip: 'Folder usage details'
    }
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="p-6 space-y-6">
        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="w-24 h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total Storage Used</CardTitle>
                </CardHeader>
                <CardContent className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatBytes(total_size)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Files Analyzed</CardTitle>
                </CardHeader>
                <CardContent className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {totalFiles}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>File Type Variety</CardTitle>
                </CardHeader>
                <CardContent className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {uniqueTypes}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 6 File Types</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topExtensions}
                    dataKey="percentage"
                    nameKey="extension"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={({ extension, percentage }) =>
                      `${extension} (${percentage.toFixed(0)}%)`
                    }
                  >
                    {topExtensions.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Special Folders */}
        <Card>
          <CardHeader>
            <CardTitle>Special Folders Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full rounded-md" />
            ) : special_folders.length === 0 ? (
              <p className="text-muted-foreground">
                No special folders detected.
              </p>
            ) : (
              <ScrollArea className="h-48">
                <ul className="space-y-2">
                  {special_folders.map((folder, i) => {
                    const { icon, tooltip } = getSpecialFolderMeta(folder.path)
                    return (
                      <li key={i} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 max-w-[70%] truncate">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{icon}</span>
                            </TooltipTrigger>
                            <TooltipContent>{tooltip}</TooltipContent>
                          </Tooltip>
                          <span className="truncate">{folder.path}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatBytes(folder.size_bytes)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Heavy Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Largest Files & Folders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-64">
                <ul className="space-y-2">
                  {heavy_items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span className="truncate max-w-[70%]">{item.path}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatBytes(item.size_bytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Optimization Tips */}
        <div className="grid gap-4 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <Alert key={i}>
                  <AlertTitle>
                    <Skeleton className="h-4 w-24" />
                  </AlertTitle>
                  <AlertDescription>
                    <Skeleton className="h-4 w-full" />
                  </AlertDescription>
                </Alert>
              ))
            : tips.map((tip, i) => (
                <Alert
                  key={i}
                  className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
                >
                  <AlertTitle className="dark:text-blue-100">
                    Tip {i + 1}
                  </AlertTitle>
                  <AlertDescription className="dark:text-blue-200">
                    {tip.message}
                  </AlertDescription>
                </Alert>
              ))}
        </div>
      </div>
    </AuthenticationWrapper>
  )
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(1)} ${units[i]}`
}
