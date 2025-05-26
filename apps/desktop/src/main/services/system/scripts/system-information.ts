export const systemInformationScript = String.raw`
$report = @{}
$ErrorActionPreference = "Stop"

function Safe-Invoke($scriptBlock, $default) {
    try {
        & $scriptBlock
    } catch {
        return $default
    }
}

# Windows Update (only if available)
if (Get-Command Get-WindowsUpdate -ErrorAction SilentlyContinue) {
    $updates = Safe-Invoke { Get-WindowsUpdate | Select-Object -ExpandProperty Title } "unavailable"
    $report.software_updates = if ($updates) { $updates } else { "none" }
} else {
    $report.software_updates = "unsupported"
}

# Battery Info
$battery = Get-WmiObject Win32_Battery -ErrorAction SilentlyContinue
$report.battery = if ($battery) {
    @{
        Status = $battery.BatteryStatus
        Charge = $battery.EstimatedChargeRemaining
    }
} else {
    "no_battery"
}

# Uptime
$uptime = Safe-Invoke { (Get-CimInstance Win32_OperatingSystem).LastBootUpTime } (Get-Date)
$report.uptime = $uptime.ToString("yyyy-MM-dd HH:mm:ss")
$report.boot_time = $uptime.ToString("yyyy-MM-dd HH:mm:ss")

# Disk Usage
$report.disk_usage = @()
$disks = Get-WmiObject Win32_LogicalDisk -Filter "DriveType=3"
foreach ($d in $disks) {
    if ($d.Size -and $d.FreeSpace) {
        $percentFree = [math]::Round(($d.FreeSpace / $d.Size) * 100, 2)
        $report.disk_usage += @{
            drive = $d.DeviceID
            label = $d.VolumeName
            free_percent = $percentFree
        }
    }
}

# Last Crash
$lastCrash = Safe-Invoke { Get-WinEvent -FilterHashtable @{LogName='System'; ID=1001} -MaxEvents 1 } $null
$report.last_crash = if ($lastCrash) { $lastCrash.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss") } else { "none" }

# Recent Warnings
#$warnings = Safe-Invoke {
#    Get-WinEvent -FilterHashtable @{LogName='System'; Level=3; StartTime=(Get-Date).AddDays(-1)} -MaxEvents 5
#} @()
#$report.recent_warnings = $warnings | ForEach-Object { $_.Message }

# Startup Programs
$report.startup_programs = Safe-Invoke {
    Get-CimInstance -ClassName Win32_StartupCommand | Select-Object -ExpandProperty Name
} @("unavailable")

# Focus Assist
$report.focus_assist = Safe-Invoke {
    $focus = Get-ItemProperty -Path HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings | Select-Object -ExpandProperty NOC_GLOBAL_SETTING_TOASTS_ENABLED
    if ($focus -eq 1) { "disabled" } else { "enabled" }
} "unavailable"

# Bluetooth
$bt = Safe-Invoke {
    Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq "OK" }
} @()
$report.bluetooth = if ($bt.Count -gt 0) { "on" } else { "off" }

# External Displays
$report.external_displays = (Safe-Invoke { (Get-CimInstance Win32_DesktopMonitor).Count } 0)

# VPN
$vpn = Safe-Invoke {
    Get-VpnConnection -AllUserConnection | Where-Object { $_.ConnectionStatus -eq "Connected" }
} @()
$report.vpn = if ($vpn.Count -gt 0) { "active" } else { "inactive" }

# Antivirus
$report.antivirus = Safe-Invoke {
    (Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct).displayName
} "unavailable"

# Network Details
$netAdapters = Safe-Invoke {
    Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
} @()
$report.network = @{}

foreach ($adapter in $netAdapters) {
    try {
        $ip = (Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4).IPAddress
        $speedMbps = [math]::Round($adapter.LinkSpeed / 1MB, 2)
        $dns = (Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4).ServerAddresses
        $gw = (Get-NetRoute -DestinationPrefix "0.0.0.0/0" -InterfaceIndex $adapter.InterfaceIndex).NextHop

        $report.network[$adapter.Name] = @{
            ip_address = $ip
            link_speed_mbps = $speedMbps
            gateway = $gw
            dns_servers = $dns
        }
    } catch {
        $report.network[$adapter.Name] = @{ error = "Failed to gather network info" }
    }
}

# Public IP
$report.public_ip = Safe-Invoke {
    (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip
} "unavailable"

# Logged-in User
$report.current_user = $env:USERNAME

# Domain Status
$report.domain_joined = if ((Get-WmiObject Win32_ComputerSystem).PartOfDomain) { "yes" } else { "no" }

# FINAL OUTPUT - Always valid JSON
$output = try {
    $report | ConvertTo-Json -Depth 10
} catch {
    @{ error = "Failed to convert to JSON"; reason = $_.Exception.Message } | ConvertTo-Json -Depth 5 -Compress
}

# Write only the JSON without extra whitespace.
$output.Trim() | Write-Output
`
