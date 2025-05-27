import { createFileRoute } from '@tanstack/react-router'
import { AuthenticationWrapper } from '../core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { useEffect } from 'react'
import { useApplicationStore } from '../core/store/application.store'

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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

export const Route = createFileRoute('/status')({
  component: RouteComponent
})

function RouteComponent() {
  const { fetchServiceStatus, status } = useApplicationStore()

  useEffect(() => {
    // Fetch service status on mount
    void fetchServiceStatus()
  }, [])

  const overallStatus = EServiceStatus.OPERATIONAL // Default to operational, can be updated based on fetched status

  const logs = [
    {
      timestamp: '2024-01-15 14:32:15',
      service: 'Database',
      level: 'warning',
      message: 'High connection pool usage detected (85%)'
    },
    {
      timestamp: '2024-01-15 14:28:42',
      service: 'API',
      level: 'info',
      message: 'Deployment v2.1.4 completed successfully'
    },
    {
      timestamp: '2024-01-15 14:15:33',
      service: 'Website',
      level: 'info',
      message: 'CDN cache refreshed for static assets'
    },
    {
      timestamp: '2024-01-15 13:45:12',
      service: 'Database',
      level: 'error',
      message: 'Connection timeout to replica server (resolved)'
    },
    {
      timestamp: '2024-01-15 13:22:08',
      service: 'API',
      level: 'info',
      message: 'Rate limiting activated for endpoint /api/v1/users'
    }
  ]

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

  const getStatusIcon = (status: EServiceStatus) => {
    switch (status) {
      case EServiceStatus.OPERATIONAL:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case EServiceStatus.DEGRADED:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case EServiceStatus.OUTAGE:
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

  const getApplicationIcon = (type: EServiceType) => {
    switch (type) {
      case EServiceType.API:
        return Server
      case EServiceType.DATABASE:
        return Database
      case EServiceType.EXTENSION:
        return Globe
      default:
        return Server // Fallback icon
    }
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
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
                {overallStatus === 'operational'
                  ? 'All Systems Operational'
                  : 'System Issues Detected'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {status.map((service) => {
            const IconComponent = getApplicationIcon(service.type)

            return (
              <Card key={service.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
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
                        {service.responseTime}ms
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
        <Card>
          <CardHeader>
            <CardTitle>System Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="logs">Recent Logs</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">System Logs</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export Logs
                  </Button>
                </div>
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg border"
                    >
                      <Badge
                        className={`${getLogLevelColor(log.level)} text-xs`}
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium">{log.service}</span>
                          <span className="text-gray-500">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">99.2%</div>
                      <p className="text-xs text-gray-600">
                        Overall Uptime (30d)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">184ms</div>
                      <p className="text-xs text-gray-600">Avg Response Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">2.1M</div>
                      <p className="text-xs text-gray-600">Requests (24h)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">0.02%</div>
                      <p className="text-xs text-gray-600">Error Rate</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="incidents" className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Incidents</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">
                        Database Performance Degradation
                      </span>
                      <Badge variant="outline" className="text-yellow-600">
                        Investigating
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      We are investigating reports of slower database response
                      times affecting some users.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Started 4 hours ago
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        API Deployment Completed
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Scheduled maintenance and API updates have been completed
                      successfully.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Resolved 2 days ago
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthenticationWrapper>
  )
}
