import { IAdapterInfo, IGeoLocation, INetwork } from '@manager/common/src' // Adjust this path as per your project structure
import { ProcessService } from '../../lib/process' // Assuming this path is correct
import { runCommand } from '../../utils/command' // Assuming this path is correct
import { INetworkProvider } from './network.d' // Assuming this is INetworkProvider as defined before
import { safeJsonParse } from '../../utils/json'
import { SessionStorage } from '../../lib/session'

ProcessService.getInstance().registerTask<INetwork>(
  'getNetwork',
  'win32',
  async () => {
    return getNetworkWin()
  }
)

ProcessService.getInstance().registerTask<IGeoLocation>(
  'getGeolocation',
  'all',
  async () => {
    return getGeolocationWin()
  }
)

interface IpConfigAdapterInfo {
  name: string
  description: string
  ipAddress: string
  macAddress: string
  gateway: string
  dnsServers: string[]
  ssid: string // Only for Wi-Fi adapters
  leaseObtained: string
  leaseExpires: string
  mtu: number // Will try to get this from Get-NetAdapter
}

async function parseIpconfigAllForAdapter(
  ipconfigAllOutput: string,
  adapter: IAdapterInfo
): Promise<Partial<IpConfigAdapterInfo>> {
  const adapterInfo: Partial<IpConfigAdapterInfo> = {
    dnsServers: []
  }

  // Escape adapterDescription for regex
  const escapedDesc = adapter.InterfaceDescription.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )

  // Find the section that includes this description
  const adapterRegex = new RegExp(
    `\\s*${escapedDesc}[\\s\\S]*?(?:\\n\\n|$)`,
    'i'
  )

  const match = ipconfigAllOutput.match(adapterRegex)

  if (!match) {
    log.warn(
      `No matching adapter found in ipconfig output for description: ${adapter.InterfaceDescription}`
    )
    return adapterInfo
  }

  const section = match[0]

  // Extract values
  const getMatch = (regex: RegExp) => {
    const m = section.match(regex)
    return m ? m[1].trim() : undefined
  }

  adapterInfo.ipAddress = getMatch(/IPv4 Address[^\n:]*:\s*([\d.]+)/i)
  adapterInfo.macAddress = getMatch(
    /Physical Address[^\n:]*:\s*([0-9A-Fa-f:-]+)/i
  )
  adapterInfo.gateway = getMatch(/Default Gateway[^\n:]*:\s*([\d.]+)/i)

  // DNS Servers (can be multiline)
  const dnsServers: string[] = []
  const dnsMatch = section.match(/DNS Servers[^\n:]*:\s*((?:\n?\s+[\d.]+)+)/i)
  if (dnsMatch) {
    dnsMatch[1].split('\n').forEach((line) => {
      const ip = line.trim()
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) dnsServers.push(ip)
    })
    adapterInfo.dnsServers = dnsServers
  }

  // SSID (optional, may not appear in ipconfig)
  const ssid = getMatch(/SSID[^\n:]*:\s*(.*)/i)
  if (ssid) adapterInfo.ssid = ssid

  adapterInfo.leaseObtained = getMatch(/Lease Obtained[^\n:]*:\s*(.*)/i)
  adapterInfo.leaseExpires = getMatch(/Lease Expires[^\n:]*:\s*(.*)/i)

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
        Name: 'WiFi' as IAdapterInfo['Name'],
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
        SessionStorage.getInstance().getItem<string>('externalIP') ||
          runCommand('curl -s https://api.ipify.org', {
            expectedType: 'string',
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
        primaryAdapter
      )

      // Populate currentNetworkState from primaryAdapter and adapterDetails
      currentNetworkState.internalIP = adapterDetails.ipAddress || ''
      currentNetworkState.macAddress =
        primaryAdapter.MacAddress || adapterDetails.macAddress || '' // Get from Get-NetAdapter first if available
      currentNetworkState.gateway = adapterDetails.gateway || ''
      currentNetworkState.dns = adapterDetails.dnsServers || []
      currentNetworkState.connectionType = primaryAdapter.Name || 'WiFi'
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

const getGeolocationWin: INetworkProvider['getGeolocation'] = async () => {
  const defaultGeoLocation: IGeoLocation = {
    ip: '127.0.0.1',
    hostname: 'localhost',
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    loc: '0,0',
    org: 'Unknown',
    postal: '00000',
    timezone: 'UTC',
    readme: 'https://ipinfo.io/missingauth'
  }

  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      log.warn(`Failed to fetch geolocation data: ${response.statusText}`)
      return defaultGeoLocation
    }

    const geoOutput = await response.json()
    const geoData = safeJsonParse(geoOutput, {
      ip: '',
      hostname: '',
      city: '',
      region: '',
      country: '',
      loc: '0,0',
      org: '',
      postal: '',
      timezone: '',
      readme: ''
    })

    if (!geoData || !geoData.loc) {
      log.warn('No geolocation data found. Returning default values.')
      return defaultGeoLocation
    }

    const [latitude, longitude] = geoData.loc.split(',').map(parseFloat)

    if (isNaN(latitude) || isNaN(longitude)) {
      log.warn('Invalid geolocation coordinates. Returning default values.')
      return defaultGeoLocation
    }

    return {
      ...geoData,
      loc: `${latitude},${longitude}`
    }
  } catch (error) {
    log.error(`Error getting geolocation on Windows: ${error}`)
    return defaultGeoLocation
  }
}
