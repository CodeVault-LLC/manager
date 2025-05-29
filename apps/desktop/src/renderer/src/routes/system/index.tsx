import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@manager/common/src'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../../core/store/system.store'
import { Badge, Card, CardContent, Separator } from '@manager/ui'
import { Skeleton } from '@manager/ui/src/ui/skeleton'
import { ScrollArea } from '@manager/ui/src/ui/scroll-area'

export const Route = createFileRoute('/system/')({
  component: RouteComponent
})

function LabelValue({ label, value }: { label: string; value: any }) {
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
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-primary">{title}</h2>
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
          <InfoCard title="System">
            <LabelValue label="User" value={system.current_user} />
            <LabelValue label="Domain Joined" value={system.domain_joined} />
            <LabelValue label="Boot Time" value={system.boot_time} />
            <LabelValue label="Uptime" value={system.uptime} />
          </InfoCard>

          <InfoCard title="Battery">
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

          <InfoCard title="Network">
            {Object.entries(system.network || {}).map(([name, data]: any) => (
              <div key={name} className="mb-3">
                <Badge variant="outline" className="mb-1">
                  {name}
                </Badge>
                <LabelValue label="IP" value={data.ip_address} />
                <LabelValue
                  label="Speed"
                  value={`${data.link_speed_mbps} Mbps`}
                />
                <LabelValue label="Gateway" value={data.gateway} />
                <LabelValue
                  label="DNS"
                  value={(data.dns_servers || []).join(', ')}
                />
              </div>
            ))}
          </InfoCard>

          <InfoCard title="Disks">
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

          <InfoCard title="Security">
            <LabelValue label="Antivirus" value={system.antivirus} />
            <LabelValue label="VPN" value={system.vpn} />
          </InfoCard>

          <InfoCard title="Environment">
            <LabelValue label="Bluetooth" value={system.bluetooth} />
            <LabelValue label="Displays" value={system.external_displays} />
            <LabelValue label="Focus Assist" value={system.focus_assist} />
          </InfoCard>

          <InfoCard title="Updates">
            {Array.isArray(system?.software_updates) ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {system?.software_updates.map((title: string, i: number) => (
                  <li key={i}>{title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {system?.software_updates}
              </p>
            )}
          </InfoCard>

          <InfoCard title="Warnings & Crashes">
            <LabelValue label="Last Crash" value={system.last_crash} />
            <div className="mt-2 space-y-1">
              {(system.recent_warnings || []).map((w: string, i: number) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {w}
                </p>
              ))}
            </div>
          </InfoCard>
        </div>
      </ScrollArea>
    </AuthenticationWrapper>
  )
}
