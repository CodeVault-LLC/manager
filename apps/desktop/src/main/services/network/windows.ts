import { IAdapterInfo, INetwork } from '@manager/common/src' // Adjust this path as per your project structure
import { ProcessService } from '../../lib/process' // Assuming this path is correct
import { runCommand } from '../../utils/command' // Assuming this path is correct
import { INetworkProvider } from './network.d' // Assuming this is INetworkProvider as defined before
import { safeJsonParse } from '../../utils/json'

ProcessService.getInstance().registerTask<INetwork>(
  'getNetwork',
  'win32',
  async () => {
    return getNetworkWin()
  }
)

interface IpConfigAdapterInfo {
  name: string
  description: string
  ipAddress: string
  macAddress: string
  gateway: string
  dnsServers: string[]
  connectionType: 'WiFi' | 'Ethernet'
  ssid: string // Only for Wi-Fi adapters
  leaseObtained: string
  leaseExpires: string
  mtu: number // Will try to get this from Get-NetAdapter
}

async function parseIpconfigAllForAdapter(
  ipconfigAllOutput: string,
  adapterName: string // The description from netsh
): Promise<Partial<IpConfigAdapterInfo>> {
  const adapterInfo: Partial<IpConfigAdapterInfo> = {
    connectionType: 'WiFi',
    dnsServers: []
  }

  // Escape adapterName for regex (e.g., if it contains special characters)
  const escapedAdapterName = adapterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const adapterSectionRegex = new RegExp(
    `\\s*${escapedAdapterName}[\\s\\S]*?(?:\\n\\n|$)`,
    'i'
  )

  const match = ipconfigAllOutput.match(adapterSectionRegex)

  if (!match) {
    log.warn(`Could not find ipconfig /all section for adapter: ${adapterName}`)
    return adapterInfo
  }

  const section = match[0]

  // IP Address
  const ipv4Match = section.match(
    /IPv4 Address[^:\r\n]*:\s*(\d{1,3}(\.\d{1,3}){3})/
  )
  if (ipv4Match) adapterInfo.ipAddress = ipv4Match[1]

  // MAC Address
  const macMatch = section.match(
    /Physical Address[^:\r\n]*:\s*([0-9A-Fa-f]{2}(-[0-9A-Fa-f]{2}){5})/
  )
  if (macMatch) adapterInfo.macAddress = macMatch[1]

  // Default Gateway
  const gatewayMatch = section.match(
    /Default Gateway[^:\r\n]*:\s*(\d{1,3}(\.\d{1,3}){3})/
  )
  if (gatewayMatch) adapterInfo.gateway = gatewayMatch[1]

  // DNS Servers
  const dnsMatch = section.match(
    /DNS Servers[^:\r\n]*:((?:\s*\d{1,3}(\.\d{1,3}){3})+)/
  )
  if (dnsMatch) {
    adapterInfo.dnsServers = dnsMatch[1].trim().split(/\s+/).filter(Boolean)
  }

  // Connection Type and SSID (infer from adapter description)
  if (section.includes('Wireless LAN adapter Wi-Fi')) {
    adapterInfo.connectionType = 'WiFi'
    const ssidMatch = section.match(/SSID[^:\r\n]*:\s*(.*)/)
    if (ssidMatch) adapterInfo.ssid = ssidMatch[1].trim()
  } else if (section.includes('Ethernet adapter')) {
    adapterInfo.connectionType = 'Ethernet'
  }

  // Lease Times
  const leaseObtainedMatch = section.match(/Lease Obtained[^:\r\n]*:\s*(.*)/)
  if (leaseObtainedMatch)
    adapterInfo.leaseObtained = leaseObtainedMatch[1].trim()
  const leaseExpiresMatch = section.match(/Lease Expires[^:\r\n]*:\s*(.*)/)
  if (leaseExpiresMatch) adapterInfo.leaseExpires = leaseExpiresMatch[1].trim()

  // MTU - This is typically derived from Get-NetAdapter directly, not ipconfig /all
  // We will fetch this separately or try to match it.
  // adapterInfo.mtu will be handled outside this function

  return adapterInfo
}

const getNetworkWin: INetworkProvider['getNetwork'] =
  async (): Promise<INetwork> => {
    const defaultNetwork: INetwork = {
      internalIP: '',
      externalIP: '',
      macAddress: '',
      ssid: '',
      signalStrength: 0,
      connectionType: 'WiFi', // Changed default to 'Unknown'
      dns: [],
      gateway: '',
      latency: 0,
      speed: { up: 0, down: 0 },
      status: 'offline', // Changed default to 'unknown'
      firewallEnabled: false,
      vpnActive: false,
      openPorts: [],
      activeConnections: 0,
      hostname: '',
      mtu: 1500,
      leaseTime: ''
    }

    const currentNetworkState = { ...defaultNetwork }

    try {
      const netAdapterInfoJson = await runCommand(
        'Get-NetAdapter -Physical | Select-Object Name,InterfaceDescription,LinkSpeed,Status,MacAddress,Nlmtu | Where-Object Status -eq Up | Sort-Object InterfaceMetric | ConvertTo-Json',
        {
          expectedType: 'string',
          defaultValue: '{}',
          timeout: 7000
        }
      )

      const activeAdapters: IAdapterInfo = safeJsonParse(netAdapterInfoJson, {
        Name: '',
        InterfaceDescription: '',
        LinkSpeed: '',
        Status: '',
        MacAddress: '',
        Nlmtu: null
      })

      if (!activeAdapters) {
        log.warn(
          'No active network adapters found. Returning default network state.'
        )

        return defaultNetwork
      }

      const primaryAdapter = activeAdapters

      if (!primaryAdapter) {
        log.warn('No primary active network adapter found.')
        return defaultNetwork
      }

      const [
        ipconfigAllOutput,
        externalIP,
        pingResult,
        firewallStatusJson,
        vpnAdaptersJson,
        openPortsRaw,
        activeConnectionsRaw,
        hostname
      ] = await Promise.all([
        runCommand('ipconfig /all', {
          expectedType: 'string',
          defaultValue: '',
          timeout: 5000
        }),
        runCommand('Invoke-RestMethod -Uri https://api.ipify.org', {
          match: /^\d{1,3}(\.\d{1,3}){3}$/,
          defaultValue: '',
          timeout: 5000
        }),
        runCommand('ping -n 1 8.8.8.8', {
          defaultValue: '',
          timeout: 2000
        }),
        runCommand(
          'Get-NetFirewallProfile | Select-Object Name,Enabled | ConvertTo-Json',
          {
            expectedType: 'string',
            defaultValue: '[]',
            timeout: 5000,
            transform: (v) => {
              try {
                const parsed = safeJsonParse(v, {
                  Name: '',
                  Enabled: false
                })
                return JSON.stringify(Array.isArray(parsed) ? parsed : [parsed])
              } catch (e) {
                log.error('Failed to parse firewall status JSON (win):', e)
                return '[]'
              }
            }
          }
        ),
        runCommand(
          "Get-NetAdapter -Physical -IncludeHidden | Where-Object {$_.Name -like '*VPN*' -or $_.Name -like '*Tunnel*' -or $_.Name -like '*Tap*' -or $_.Name -like '*tun*'} | Where-Object Status -eq 'Up' | Select-Object Name | ConvertTo-Json",
          {
            expectedType: 'string',
            defaultValue: '[]',
            timeout: 5000,
            transform: (v) => {
              try {
                if (!v) {
                  log.warn('No VPN adapters found or command returned empty.')
                  return '[]'
                }

                const parsed = safeJsonParse(v, '[]')
                return JSON.stringify(Array.isArray(parsed) ? parsed : [parsed])
              } catch (e) {
                log.error('Failed to parse VPN adapter JSON (win):', e)
                return '[]'
              }
            }
          }
        ),
        runCommand('netstat -anp TCP | findstr /i "LISTENING"', {
          expectedType: 'string',
          defaultValue: '',
          timeout: 5000
        }),
        runCommand('(netstat -an | Select-String ESTABLISHED).Count', {
          expectedType: 'string',
          defaultValue: '0',
          timeout: 5000
        }),
        runCommand('hostname', {
          expectedType: 'string',
          defaultValue: ''
        })
      ])

      // Parse ipconfig /all output specifically for the primary adapter
      const adapterDetails = await parseIpconfigAllForAdapter(
        ipconfigAllOutput,
        primaryAdapter.InterfaceDescription
      )

      // Populate currentNetworkState from primaryAdapter and adapterDetails
      currentNetworkState.internalIP = adapterDetails.ipAddress || ''
      currentNetworkState.macAddress =
        primaryAdapter.MacAddress || adapterDetails.macAddress || '' // Get from Get-NetAdapter first if available
      currentNetworkState.gateway = adapterDetails.gateway || ''
      currentNetworkState.dns = adapterDetails.dnsServers || []
      currentNetworkState.connectionType =
        adapterDetails.connectionType || 'WiFi'
      currentNetworkState.ssid = adapterDetails.ssid || ''
      currentNetworkState.mtu = primaryAdapter.Nlmtu || 1500 // Get MTU from Get-NetAdapter
      currentNetworkState.leaseTime = adapterDetails.leaseExpires || '' // Often lease expires is more useful
      currentNetworkState.externalIP = externalIP || ''

      // Ping for Latency and Status (ping Google DNS)
      const latencyMatch = pingResult.match(/Average = (\d+)ms/)
      currentNetworkState.latency = latencyMatch
        ? parseInt(latencyMatch[1], 10)
        : 0
      currentNetworkState.status = pingResult.includes('Sent = 1, Received = 1')
        ? 'online'
        : 'offline'

      // Signal Strength (for Wi-Fi adapters)
      if (currentNetworkState.connectionType === 'WiFi') {
        const signalRaw = await runCommand(
          `(netsh wlan show interface | Select-String 'Signal') -replace '\\s+'"` + // Example: Signal     : 98%
            `" | foreach { $_.ToString().Split(':')[1] } | Select-String '\\d+' -AllMatches | % {$_.Matches} | % {$_.Value}`,
          {
            expectedType: 'string',
            defaultValue: '0',
            timeout: 3000
          }
        )
        // This command needs careful testing. A more robust way might be:
        // `(netsh wlan show interface | Select-String 'Signal').ToString().split(':')[1].trim().replace('%','')`
        // But Signal Strength in dBm might be better if possible.
        currentNetworkState.signalStrength = parseInt(signalRaw, 10) || 0
      }

      const parsedFirewallStatus = safeJsonParse(firewallStatusJson, '[]')
      currentNetworkState.firewallEnabled =
        Array.isArray(parsedFirewallStatus) &&
        parsedFirewallStatus.some((profile: any) => profile?.Enabled === true)

      const parsedVpnAdapters = safeJsonParse(vpnAdaptersJson, '[]')
      currentNetworkState.vpnActive =
        Array.isArray(parsedVpnAdapters) && parsedVpnAdapters.length > 0

      // Open Ports (using netstat)
      const openPorts = openPortsRaw
        .split('\n')
        .map((line) => {
          const match = line.match(/:(\d+)\s+LISTENING/)
          return match ? parseInt(match[1], 10) : NaN
        })
        .filter((n) => !isNaN(n))
      currentNetworkState.openPorts = [...new Set(openPorts)]

      currentNetworkState.activeConnections =
        parseInt(activeConnectionsRaw.trim(), 10) || 0

      // Hostname
      currentNetworkState.hostname = hostname
    } catch (error) {
      log.error(`Critical error getting network info on Windows: ${error}`)
      return defaultNetwork
    }

    return currentNetworkState
  }
