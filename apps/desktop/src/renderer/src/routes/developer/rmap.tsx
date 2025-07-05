import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@manager/ui'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Globe,
  History,
  Loader2,
  MoreHorizontal,
  Network,
  Play,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Square,
  Target,
  Terminal,
  Wifi,
  X,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { Label } from 'recharts'
import { useRmap } from '../../core/pages/rmap/useRmap'
import { ERmapType } from '@manager/common/src'

export const Route = createFileRoute('/developer/rmap')({
  component: RouteComponent
})

const recentScans = [
  {
    id: 1,
    target: '192.168.1.0/24',
    type: 'Quick Scan',
    date: '2024-01-15 14:30',
    duration: '2m 15s',
    hosts: 12
  },
  {
    id: 2,
    target: '10.0.0.0/16',
    type: 'Comprehensive',
    date: '2024-01-15 12:00',
    duration: '45m 32s',
    hosts: 256
  },
  {
    id: 3,
    target: '192.168.1.1',
    type: 'Port Scan',
    date: '2024-01-15 10:15',
    duration: '30s',
    hosts: 1
  }
]

function RouteComponent() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    selectedHost,
    setSelectedHost,
    risk,
    setRisk,
    target,
    setType,
    type,
    setTarget,
    handleStartScan,
    output
  } = useRmap()

  const [statusFilter, setStatusFilter] = useState('all')

  /*const filteredResults = output?.filter((result) => {
    const matchesSearch =
      result.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.hostname.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || result.status === statusFilter
    const matchesRisk = risk === 'all' || result.risk === risk
    return matchesSearch && matchesStatus && matchesRisk
  })*/

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'down':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  console.log('RMap output:', output)

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-muted/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Network className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">NMAP Scanner</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Target (IP/Range/Domain)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-64"
                />
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as ERmapType)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="stealth">Stealth</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <Button variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Scan
                </Button>
              ) : (
                <Button onClick={handleStartScan} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </Button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh Results</TooltipContent>
              </Tooltip>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Scan Settings</DialogTitle>
                    <DialogDescription>
                      Configure your NMAP scan parameters
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      <TabsTrigger value="timing">Timing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Scan Type</Label>
                          <Select defaultValue="syn">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="syn">
                                SYN Scan (-sS)
                              </SelectItem>
                              <SelectItem value="tcp">
                                TCP Connect (-sT)
                              </SelectItem>
                              <SelectItem value="udp">
                                UDP Scan (-sU)
                              </SelectItem>
                              <SelectItem value="ack">
                                ACK Scan (-sA)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Port Range</Label>
                          <Input placeholder="1-1000" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="os-detection" />
                          <Label>OS Detection (-O)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="service-version" defaultChecked />
                          <Label>Service Version Detection (-sV)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="script-scan" />
                          <Label>Default Scripts (-sC)</Label>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Custom NMAP Arguments</Label>
                        <Textarea placeholder="Enter custom NMAP arguments..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Exclude Hosts</Label>
                        <Input placeholder="192.168.1.1,192.168.1.5" />
                      </div>
                    </TabsContent>
                    <TabsContent value="timing" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Timing Template</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Paranoid (T0)</SelectItem>
                            <SelectItem value="1">Sneaky (T1)</SelectItem>
                            <SelectItem value="2">Polite (T2)</SelectItem>
                            <SelectItem value="3">Normal (T3)</SelectItem>
                            <SelectItem value="4">Aggressive (T4)</SelectItem>
                            <SelectItem value="5">Insane (T5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="h-4 w-4 mr-2" />
                    Scan History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Terminal className="h-4 w-4 mr-2" />
                    View Raw Output
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </header>

        {/* Filters and Search */}
        <div className="border-b bg-muted/20 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hosts, IPs, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="up">Online</SelectItem>
                  <SelectItem value="down">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {output?.length} of {output?.length} hosts
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Results Table */}
          <div className="flex-1 p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Discovered Hosts
                </CardTitle>
                <CardDescription>
                  Network scan results with host information and open ports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Open Ports</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {output?.map((result) => (
                      <TableRow
                        key={result.lastSeen}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedHost === result.host ? 'bg-muted' : ''}`}
                        onClick={() =>
                          setSelectedHost(
                            selectedHost === result.host ? null : result.host
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="capitalize">{result.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {result.host}
                        </TableCell>
                        <TableCell>{result.hostname}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {result.ports.slice(0, 3).map((port) => (
                              <Badge
                                key={port.port}
                                variant="outline"
                                className="text-xs"
                              >
                                {port.port}/{port.service}
                              </Badge>
                            ))}
                            {result.ports.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{result.ports.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{result.os}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getRiskColor(result.risk)}
                            className="capitalize"
                          >
                            {result.risk}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.lastSeen}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Quick Scan
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Vulnerability Scan
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Globe className="h-4 w-4 mr-2" />
                                Web Scan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Terminal className="h-4 w-4 mr-2" />
                                Custom Command
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="w-80 border-l bg-muted/20 p-4 space-y-4">
            {selectedHost ? (
              <div className="space-y-4">
                {(() => {
                  if (!output) return null

                  const host = output.find((h) => h.host === selectedHost)
                  if (!host) return null

                  return (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wifi className="h-5 w-5" />
                            Host Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              IP Address
                            </Label>
                            <p className="font-mono">{host.host}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Hostname
                            </Label>
                            <p>{host.hostname}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Operating System
                            </Label>
                            <p>{host.os}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Status
                            </Label>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(host.status)}
                              <span className="capitalize">{host.status}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Open Ports
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {host.ports.map((port) => (
                              <div
                                key={port.port}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div>
                                  <div className="font-medium">
                                    {port.port}/{port.service}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {port.version}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {port.state}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            className="w-full justify-start bg-transparent"
                            variant="outline"
                            size="sm"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Port Scan
                          </Button>
                          <Button
                            className="w-full justify-start bg-transparent"
                            variant="outline"
                            size="sm"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Vulnerability Check
                          </Button>
                          <Button
                            className="w-full justify-start bg-transparent"
                            variant="outline"
                            size="sm"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Web Service Scan
                          </Button>
                          <Button
                            className="w-full justify-start bg-transparent"
                            variant="outline"
                            size="sm"
                          >
                            <Terminal className="h-4 w-4 mr-2" />
                            Custom NMAP
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Scans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentScans.map((scan) => (
                        <div key={scan.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {scan.target}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {scan.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {scan.date} • {scan.duration} • {scan.hosts} hosts
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Network Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Hosts</span>
                      <Badge variant="secondary">{output?.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Online</span>
                      <Badge variant="outline" className="text-green-600">
                        {output?.filter((h) => h.status === 'up').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk</span>
                      <Badge variant="destructive">
                        {output?.filter((h) => h.risk === 'high').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Open Ports</span>
                      <Badge variant="secondary">
                        {output?.reduce(
                          (acc, host) => acc + host.ports.length,
                          0
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
