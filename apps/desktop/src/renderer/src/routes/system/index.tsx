import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@manager/common/src'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../../core/store/system.store'
import {
  Badge,
  Card,
  CardContent,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@manager/ui'
import { Skeleton } from '@manager/ui/src/ui/skeleton'
import { ScrollArea } from '@manager/ui/src/ui/scroll-area'
import {
  Cpu,
  Monitor,
  BatteryCharging,
  Wifi,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  UserCircle,
  Info,
  FileClock
} from 'lucide-react'

export const Route = createFileRoute('/system/')({
  component: RouteComponent
})

function LabelValue({
  label,
  value,
  tooltip
}: {
  label: string
  value: any
  tooltip?: string
}) {
  if (tooltip) {
    return (
      <div className="flex justify-between py-1">
        <Tooltip>
          <TooltipTrigger>
            <span className="text-muted-foreground text-sm">{label}</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
        <span className="font-medium text-sm text-right max-w-[60%] truncate">
          {String(value)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm text-right max-w-[60%] truncate">
        {String(value)}
      </span>
    </div>
  )
}

function InfoCard({
  title,
  icon,
  children
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl shadow-md border border-muted">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-primary mb-3">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Separator className="mb-3" />
        {children}
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const { system, getSystem } = useSystemStore()

  useEffect(() => {
    getSystem()
  }, [getSystem])

  if (!system) {
    return (
      <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </AuthenticationWrapper>
    )
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <InfoCard title="System" icon={<UserCircle className="w-5 h-5" />}>
            <LabelValue label="User" value={system.current_user} />
            <LabelValue label="Computer Name" value={system.computer_name} />
            <LabelValue label="Domain Joined" value={system.domain_joined} />
            <LabelValue label="Boot Time" value={system.boot_time} />
            <LabelValue label="Uptime" value={system.uptime} />
          </InfoCard>

          <InfoCard title="Hardware" icon={<Cpu className="w-5 h-5" />}>
            <LabelValue label="CPU" value={system.cpu.name} />
            <LabelValue label="Cores" value={system.cpu.cores} />
            <LabelValue
              label="Logical Processors"
              value={system.cpu.logical_processors}
            />
            <LabelValue
              label="Clock Speed"
              value={`${system.cpu.max_clock_speed_mhz} MHz`}
            />
            <LabelValue label="RAM" value={`${system.ram_gb} GB`} />
            <LabelValue label="Architecture" value={system.architecture} />
            {Array.isArray(system.gpus) &&
              system.gpus.map((gpu: string, i: number) => (
                <LabelValue key={i} label={`GPU ${i + 1}`} value={gpu} />
              ))}
          </InfoCard>

          <InfoCard title="OS & BIOS" icon={<Info className="w-5 h-5" />}>
            <LabelValue label="OS" value={system.os_caption} />
            <LabelValue label="Version" value={system.os_version} />
            <LabelValue label="Build" value={system.os_build} />
            <LabelValue label="BIOS Version" value={system.bios?.version} />
            <LabelValue
              label="BIOS Release"
              value={system.bios?.release_date}
            />
          </InfoCard>

          <InfoCard title="Motherboard" icon={<Monitor className="w-5 h-5" />}>
            <LabelValue
              label="Manufacturer"
              value={system.motherboard?.manufacturer}
            />
            <LabelValue label="Product" value={system.motherboard?.product} />
            <LabelValue label="System UUID" value={system.system_uuid} />
          </InfoCard>

          <InfoCard
            title="Battery"
            icon={<BatteryCharging className="w-5 h-5" />}
          >
            {typeof system.battery === 'string' ? (
              <p className="text-sm text-muted-foreground">{system.battery}</p>
            ) : (
              <>
                <LabelValue
                  label="Charge"
                  value={`${system.battery.charge}%`}
                />
                <LabelValue label="Status" value={system.battery.status} />
              </>
            )}
          </InfoCard>

          <InfoCard
            title="Environment"
            icon={<FileClock className="w-5 h-5" />}
          >
            <LabelValue
              label="System Drive"
              value={system.environment?.system_drive}
            />
            <LabelValue
              label="OS Locale"
              value={system.environment?.os_locale}
            />
            <LabelValue
              label="User SID"
              value={system.environment?.user_sid}
              tooltip="A Security Identifier used by Windows to uniquely identify users."
            />
            <LabelValue
              label="Current UI"
              value={system.environment?.current_ui}
            />
            <LabelValue label="Time Zone" value={system.time_zone} />
          </InfoCard>

          <InfoCard title="Network" icon={<Wifi className="w-5 h-5" />}>
            {system.network.interfaces.map((data) => (
              <div key={data.name} className="mb-3">
                <Badge variant="outline" className="mb-1">
                  {data.name}
                </Badge>
                <LabelValue label="IP" value={data.ip_address} />
                <LabelValue
                  label="Speed"
                  value={`${data.link_speed_mbps} Mbps`}
                  tooltip="Link speed reported by the adapter."
                />
                <LabelValue label="Gateway" value={data.gateway} />
                <LabelValue
                  label="DNS"
                  value={(data.dns_servers || []).join(', ')}
                  tooltip="Domain Name System servers used for resolving hostnames."
                />
              </div>
            ))}
            <LabelValue label="Public IP" value={system.network.public_ip} />
          </InfoCard>

          <InfoCard title="Disks" icon={<HardDrive className="w-5 h-5" />}>
            {(system.disk_usage || []).map((disk: any) => (
              <div key={disk.drive} className="mb-3">
                <Badge variant="secondary" className="mb-1">
                  {disk.drive} {disk.label && `- ${disk.label}`}
                </Badge>
                <LabelValue
                  label="Free Space"
                  value={`${disk.free_percent}%`}
                />
              </div>
            ))}
          </InfoCard>

          <InfoCard title="Security" icon={<ShieldCheck className="w-5 h-5" />}>
            <LabelValue label="Antivirus" value={system.antivirus} />
            <LabelValue label="VPN" value={system.vpn} />
            <LabelValue
              label="Firewall (Private)"
              value={system.firewall.private}
            />
            <LabelValue
              label="Firewall (Public)"
              value={system.firewall.public}
            />
            <LabelValue
              label="Firewall (Domain)"
              value={system.firewall.domain}
            />
            <LabelValue
              label="BitLocker Status"
              value={system.bitlocker?.protection_status}
              tooltip="Indicates whether BitLocker encryption is enabled."
            />
          </InfoCard>

          <InfoCard
            title="System Status"
            icon={<RefreshCw className="w-5 h-5" />}
          >
            <LabelValue label="Focus Assist" value={system.focus_assist} />
            <LabelValue label="Bluetooth" value={system.bluetooth} />
            <LabelValue
              label="Displays"
              value={system.external_displays ?? '0'}
            />
            <LabelValue label="Pending Reboot" value={system.pending_reboot} />
            <LabelValue label="Time Sync" value={system.time_sync} />
          </InfoCard>

          <InfoCard title="Updates" icon={<RefreshCw className="w-5 h-5" />}>
            {Array.isArray(system.software_updates) ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {system.software_updates.map((title: string, i: number) => (
                  <li key={i}>{title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {system.software_updates}
              </p>
            )}
          </InfoCard>

          <InfoCard
            title="Crashes & Warnings"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            <LabelValue label="Last Crash" value={system.last_crash} />
            <div className="mt-2 space-y-1">
              {(system.recent_warnings || []).map((w: string, i: number) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {w}
                </p>
              ))}
            </div>
          </InfoCard>

          <InfoCard
            title="Startup Programs"
            icon={<Info className="w-5 h-5" />}
          >
            {Array.isArray(system.startup_programs) &&
            system.startup_programs.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {system.startup_programs.map((prog: string, i: number) => (
                  <li key={i}>{prog}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </InfoCard>

          <InfoCard
            title="Critical Services"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            {Array.isArray(system.critical_services) &&
            system.critical_services.length > 0 ? (
              system.critical_services.map((svc, i) => (
                <LabelValue key={i} label={svc.Name} value={svc.Status} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No critical services detected
              </p>
            )}
          </InfoCard>
        </div>
      </ScrollArea>
    </AuthenticationWrapper>
  )
}
