import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useApplicationStore } from '../core/store/application.store'
import { formatDate } from 'date-fns'

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress
} from '@manager/ui'

import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Database,
  Globe,
  Server,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react'
import { EServiceStatus, EServiceType } from '@manager/common/src'
import { cn } from '@manager/ui/src/utils/helpers'

export const Route = createFileRoute('/status')({
  component: RouteComponent
})

function RouteComponent() {
  const { fetchServiceStatus, status, logs, fetchServiceLogs } =
    useApplicationStore()

  useEffect(() => {
    // Fetch service status on mount
    void fetchServiceStatus()
    void fetchServiceLogs()
  }, [])

  const overallStatus = 'OPERATIONAL' // Default to operational, can be updated based on fetched status

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900 dark:border-green-700'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900 dark:border-yellow-700'
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900 dark:border-red-700'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: keyof typeof EServiceStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'DEGRADED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'OUTAGE':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'info':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getApplicationIcon = (type: keyof typeof EServiceType) => {
    switch (type) {
      case 'API':
        return Server
      case 'DATABASE':
        return Database
      case 'EXTENSION':
        return Globe
      default:
        return Server // Fallback icon
    }
  }

  const handleExportLogs = () => {
    const logsJson = JSON.stringify(logs, null, 2)
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `system_logs_${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          System Status
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Real-time status and performance monitoring
        </p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            {getStatusIcon(overallStatus)}
            <span className="text-xl font-semibold">
              {overallStatus === 'OPERATIONAL'
                ? 'All Systems Operational'
                : 'System Issues Detected'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {status.map((service) => {
          const IconComponent = getApplicationIcon(service.type)

          return (
            <Card
              key={service.name}
              className="relative transition-transform duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                  <Badge
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium border',
                      getStatusColor(service.status)
                    )}
                  >
                    {getStatusIcon(service.status)}
                    <span className="ml-1 capitalize">{service.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                      <TrendingUp className="h-3 w-3" />
                      <span>Uptime</span>
                    </div>
                    <div className="font-semibold">{100}%</div>
                    <Progress value={100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                      <Activity className="h-3 w-3" />
                      <span>Response</span>
                    </div>
                    <div className="font-semibold">
                      {Number(service.responseTime.avg).toFixed(2)} ms
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last incident: {new Date().toDateString()}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Information Tabs */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Logs</h3>
        <Button variant="outline" size="sm" onClick={handleExportLogs}>
          <Download className="h-3 w-3 mr-1" />
          Export Logs
        </Button>
      </div>
      <div className="space-y-2">
        {logs
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map((log, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border"
            >
              <Badge
                className={cn(
                  'text-xs font-medium',
                  getLogLevelColor(log.level)
                )}
              >
                {log.level.toUpperCase()}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">{log.service}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(log.timestamp), 'PPpp')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {log.message.length > 100
                    ? `${log.message.substring(0, 100)}...`
                    : log.message}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
