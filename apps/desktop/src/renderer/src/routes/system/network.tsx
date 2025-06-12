import { createFileRoute } from '@tanstack/react-router'

import { useEffect, useState } from 'react'
import {
  Wifi,
  Server,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
  Settings,
  Zap,
  Repeat,
  Wrench,
  TerminalSquare,
  Lock,
  InfoIcon
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@manager/ui'
import { Skeleton } from '@manager/ui/src/ui/skeleton'
import { cn } from '../../utils/helpers'
import { useSystemStore } from '../../core/store/system.store'

export const Route = createFileRoute('/system/network')({
  component: RouteComponent
})

function RouteComponent() {
  const [expanded, setExpanded] = useState(false)
  const { network, getNetwork, loading } = useSystemStore()

  useEffect(() => {
    if (!network) {
      getNetwork()
    }
  }, [getNetwork])

  const InfoBlock = ({
    label,
    value,
    icon,
    tooltip
  }: {
    label: string
    value: string | number
    icon: JSX.Element
    tooltip?: string
  }) => (
    <div className="flex items-center space-x-4">
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
      </Tooltip>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Network Dashboard</h1>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" disabled={loading}>
            <Zap className="w-4 h-4 mr-1" /> Ping Test
          </Button>
          <Button size="sm" variant="outline" disabled={loading}>
            <Repeat className="w-4 h-4 mr-1" /> Restart Interface
          </Button>
          <Button size="sm" variant="outline" disabled={loading}>
            <Wrench className="w-4 h-4 mr-1" /> Diagnose
          </Button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && !network && (
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No network information available</p>
          <p className="text-sm">Please check your connection or try again.</p>
        </div>
      )}

      {!loading && network && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoBlock
                label="Connection Type"
                value={network.connectionType}
                icon={<Wifi className="w-5 h-5 text-blue-500" />}
              />
              <InfoBlock
                label="Internet"
                value={
                  network.status === 'online' ? 'Connected' : 'Disconnected'
                }
                icon={
                  <Activity
                    className={cn(
                      'w-5 h-5',
                      network.status === 'online'
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  />
                }
              />
              <InfoBlock
                label="SSID"
                value={network.ssid}
                icon={<Info className="w-5 h-5 text-cyan-500" />}
                tooltip="Wireless network name"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBlock
                label="Internal IP"
                value={network.internalIP}
                icon={<Server className="w-4 h-4 text-muted-foreground" />}
              />
              <InfoBlock
                label="External IP"
                value={network.externalIP}
                icon={<Globe className="w-4 h-4 text-muted-foreground" />}
              />
              <InfoBlock
                label="MAC Address"
                value={network.macAddress}
                icon={<ShieldCheck className="w-4 h-4 text-muted-foreground" />}
                tooltip="Unique hardware identifier"
              />
              <InfoBlock
                label="Gateway"
                value={network.gateway}
                icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                tooltip="Default network route"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBlock
                label="⬇ Download Speed"
                value={`${network.speed.down} Mbps`}
                icon={<ArrowIcon direction="down" />}
              />
              <InfoBlock
                label="⬆ Upload Speed"
                value={`${network.speed.up} Mbps`}
                icon={<ArrowIcon direction="up" />}
              />
              <InfoBlock
                label="Latency"
                value={`${network.latency} ms`}
                icon={<Activity className="w-4 h-4 text-yellow-500" />}
              />
              <InfoBlock
                label="Connections"
                value={network.activeConnections}
                icon={<Server className="w-4 h-4 text-orange-500" />}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">Advanced Details</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}{' '}
                {expanded ? 'Hide' : 'Show'}
              </Button>
            </div>

            {expanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <InfoBlock
                    label="Firewall Enabled"
                    value={network.firewallEnabled ? 'Yes' : 'No'}
                    icon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  />
                  <InfoBlock
                    label="VPN Active"
                    value={network.vpnActive ? 'Yes' : 'No'}
                    icon={
                      <TerminalSquare className="w-4 h-4 text-muted-foreground" />
                    }
                  />
                  <InfoBlock
                    label="Hostname"
                    value={network.hostname}
                    icon={
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                    }
                  />
                  <InfoBlock
                    label="MTU"
                    value={network.mtu}
                    tooltip="MTU is the maximum transmission unit size for the network interface, which can affect performance."
                    icon={
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Open Ports: {network.openPorts.join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DNS Servers: {network.dns.join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lease Time: {network.leaseTime}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const ArrowIcon = ({ direction }: { direction: 'up' | 'down' }) => (
  <div className="w-4 h-4 text-muted-foreground">
    {direction === 'up' ? (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7 7 7M5 20h14"
        />
      </svg>
    ) : (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 14l-7 7-7-7M5 4h14"
        />
      </svg>
    )}
  </div>
)

export default RouteComponent
