$report = @{}

# Skip Error Handling for now
$ErrorActionPreference = "SilentlyContinue"

# Windows Update
try {
    $updates = Get-WindowsUpdate -ErrorAction SilentlyContinue
    if ($updates) {
        $report.software_updates = $updates | Select-Object -ExpandProperty Title
    } else {
        $report.software_updates = "none"
    }
} catch {
    $report.software_updates = "unavailable"
}

#Battery Info
$battery = Get-WmiObject Win32_Battery
if ($battery) {
    $report.battery = @{
        Status = $battery.BatteryStatus
        Charge = $battery.EstimatedChargeRemaining
    }
} else {
    $report.battery = "no_battery"
}

# Uptime
$uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$report.uptime = ((Get-Date) - $uptime).ToString("d.hh\:mm\:ss")
$report.boot_time = $uptime.ToString("yyyy-MM-dd HH:mm:ss")

# Disk usage
$report.disk_usage = @()
$disks = Get-WmiObject Win32_LogicalDisk -Filter "DriveType=3"
foreach ($d in $disks) {
    $percentFree = [math]::Round(($d.FreeSpace / $d.Size) * 100, 2)
    $report.disk_usage += @{
        drive = $d.DeviceID
        label = $d.VolumeName
        free_percent = $percentFree
    }
}

# Last Crash (BSOD)
$lastCrash = Get-WinEvent -FilterHashtable @{LogName='System'; ID=1001} -MaxEvents 1
$report.last_crash = if ($lastCrash) { $lastCrash.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss") } else { "none" }

# Recent Warnings
$warnings = Get-WinEvent -FilterHashtable @{LogName='System'; Level=3; StartTime=(Get-Date).AddDays(-1)} -MaxEvents 5
$report.recent_warnings = $warnings | ForEach-Object { $_.Message }

# Startup Programs
$startupApps = Get-CimInstance -ClassName Win32_StartupCommand | Select-Object -ExpandProperty Name
$report.startup_programs = $startupApps

# Focus Assist
try {
    $focus = Get-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Notifications\Settings | Select-Object -ExpandProperty NOC_GLOBAL_SETTING_TOASTS_ENABLED
    $report.focus_assist = if ($focus -eq 1) { "disabled" } else { "enabled" }
} catch {
    $report.focus_assist = "unavailable"
}

# Bluetooth
$bt = Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq "OK" }
$report.bluetooth = if ($bt) { "on" } else { "off" }

# External Displays
$displays = Get-CimInstance Win32_DesktopMonitor
$report.external_displays = $displays.Count

# VPN
$vpn = Get-VpnConnection -AllUserConnection | Where-Object { $_.ConnectionStatus -eq "Connected" }
$report.vpn = if ($vpn) { "active" } else { "inactive" }

# Antivirus
$av = Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct
$report.antivirus = $av.displayName

# Network Details
$netAdapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
$report.network = @{}
foreach ($adapter in $netAdapters) {
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
}

# Public IP
try {
    $publicIp = Invoke-RestMethod -Uri "https://api.ipify.org?format=json"
    $report.public_ip = $publicIp.ip
} catch {
    $report.public_ip = "unavailable"
}

# Logged-in User
$report.current_user = $env:USERNAME

# Domain Status
$domain = (Get-WmiObject Win32_ComputerSystem).PartOfDomain
$report.domain_joined = if ($domain) { "yes" } else { "no" }

# Output JSON
$report | ConvertTo-Json -Depth 5
