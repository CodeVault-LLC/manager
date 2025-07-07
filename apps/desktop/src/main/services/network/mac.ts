import { INetwork } from '@manager/common/src'
import { ProcessService } from '../../lib/process'
import { runCommand } from '../../utils/command'
import { INetworkProvider } from './network'

ProcessService.getInstance().registerTask<INetwork>(
  'getNetwork',
  'darwin',
  async () => {
    return getNetworkMac()
  }
)

const getNetworkMac: INetworkProvider['getNetwork'] = async () => {
  const [
    networkJSONRaw,
    internalIP,
    macAddress,
    mtu,
    gateway,
    connectionTypeRaw,
    externalIP,
    signalStrength,
    dns,
    latency,
    pingResult,
    firewallEnabledRaw,
    vpnActiveRaw,
    openPortsRaw,
    activeConnections,
    hostname,
    leaseTime
  ] = await Promise.all([
    // networkJSON (for SSID)
    runCommand('system_profiler SPAirPortDataType -json', {
      expectedType: 'string',
      defaultValue: '{}',
      timeout: 10000
    }),
    // internalIP
    runCommand('ipconfig getifaddr en0', {
      expectedType: 'string',
      defaultValue: '',
      timeout: 2000 // Add timeout
    }),
    // macAddress
    runCommand(
      "ifconfig en0 | awk '/ether/ {print $2}'",
      { expectedType: 'string', defaultValue: '', timeout: 2000 } // Add timeout
    ),
    // mtu
    runCommand("ifconfig en0 | grep mtu | awk '{print $4}'", {
      expectedType: 'number',
      defaultValue: 1500,
      timeout: 2000 // Add timeout
    }),
    // gateway
    runCommand(
      'route get default | grep "gateway" | awk \'{print $2}\'',
      { expectedType: 'string', defaultValue: '', timeout: 2000 } // Add timeout
    ),
    // connectionType
    runCommand(
      'networksetup -getinfo Wi-Fi | grep "Link Status" | awk \'{print $3}\'',
      {
        expectedType: 'string',
        defaultValue: 'WiFi', // Default to 'Unknown'
        match: /^(Wi-Fi|Ethernet|Not Connected)$/, // Added 'Not Connected' for robustness
        timeout: 2000 // Add timeout
      }
    ),
    // externalIP (can be slow, larger timeout)
    runCommand('curl -s https://api.ipify.org', {
      match: /^\d{1,3}(\.\d{1,3}){3}$/,
      defaultValue: '',
      timeout: 7000 // Longer timeout for external call
    }),
    // signalStrength
    runCommand(
      "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk -F': ' '/agrCtlRSSI/{print $2}'",
      { expectedType: 'number', defaultValue: 0, timeout: 3000 } // Add timeout
    ),
    // dns
    runCommand('networksetup -getdnsservers Wi-Fi', {
      transform: (v) => v.split('\n').filter(Boolean),
      defaultValue: [],
      timeout: 3000 // Add timeout
    }),
    // latency
    runCommand(
      "ping -c 1 8.8.8.8 | tail -1 | awk -F '/' '{print $5}'",
      { expectedType: 'number', defaultValue: 0, timeout: 2000 } // Add timeout
    ),
    // pingResult (for status)
    runCommand('ping -c 1 8.8.8.8', {
      defaultValue: '',
      timeout: 2000 // Add timeout
    }),
    // firewallEnabled
    runCommand(
      'defaults read /Library/Preferences/com.apple.alf globalstate',
      { defaultValue: '0', timeout: 2000 } // Add timeout
    ),
    // vpnActive
    runCommand('scutil --nc list | grep Connected', {
      defaultValue: '',
      timeout: 2000 // Add timeout
    }),
    // openPorts
    runCommand(
      "lsof -i -n -P | grep LISTEN | awk '{print $9}' | cut -d ':' -f2",
      {
        defaultValue: '', // Default to empty string for initial transform
        timeout: 5000 // Add timeout
      }
    ),
    // activeConnections
    runCommand(
      'netstat -an | grep ESTABLISHED | wc -l',
      { expectedType: 'number', defaultValue: 0, timeout: 3000 } // Add timeout
    ),
    // hostname
    runCommand('scutil --get LocalHostName', {
      defaultValue: '',
      timeout: 2000 // Add timeout
    }),
    // leaseTime
    runCommand('ipconfig getoption en0 lease_time', {
      defaultValue: '',
      timeout: 2000 // Add timeout
    })
  ])

  // --- Step 2: Process results that depend on prior parsing or transformations ---
  let ssid = ''
  try {
    const parsedNetworkJSON = JSON.parse(networkJSONRaw)
    for (const iface of parsedNetworkJSON?.['SPAirPortDataType']?.[0]?.[
      'spairport_airport_interfaces'
    ] || []) {
      if (iface['_name'] === 'en0' || iface['_name'] === 'en1') {
        const currentNetwork = iface['spairport_current_network_information']
        if (currentNetwork && currentNetwork['_name']) {
          ssid = currentNetwork['_name'] || ''
          break // Found SSID, no need to check other interfaces
        }
      }
    }
  } catch (e) {
    log.error('Failed to parse network JSON for SSID (concurrent mac):', e)
  }

  const status = pingResult.includes(
    '1 packets transmitted, 1 packets received'
  )
    ? 'online'
    : 'offline'

  const firewallEnabled = firewallEnabledRaw === '1'
  const vpnActive = !!vpnActiveRaw.trim() // Ensure it's truly active if any output

  let parsedOpenPorts: number[] = []
  try {
    parsedOpenPorts = openPortsRaw
      .split('\n')
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n))
  } catch (e) {
    log.error('Failed to parse open ports (concurrent mac):', e)
  }

  return {
    internalIP,
    externalIP,
    macAddress,
    ssid, // Processed separately
    signalStrength,
    connectionType:
      connectionTypeRaw === 'WiFi' || connectionTypeRaw === 'Ethernet'
        ? connectionTypeRaw
        : 'WiFi',
    dns: Array.isArray(dns) ? dns : [], // Ensure DNS is an array
    gateway,
    latency,
    speed: { up: 0, down: 0 }, // Add speed test CLI later
    status, // Processed separately
    firewallEnabled, // Processed separately
    vpnActive, // Processed separately
    openPorts: parsedOpenPorts, // Processed separately
    activeConnections,
    hostname,
    mtu,
    leaseTime
  }
}
