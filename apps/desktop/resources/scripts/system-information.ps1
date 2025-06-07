$report = @{}
$ErrorActionPreference = "Stop"

function Safe-Invoke($scriptBlock, $default) {
    try { & $scriptBlock } catch { return $default }
}

# --- Windows Update ---
if (Get-Command Get-WindowsUpdate -ErrorAction SilentlyContinue) {
    $updates = Safe-Invoke { Get-WindowsUpdate | Select-Object -ExpandProperty Title } "unavailable"
    $report.software_updates = if ($updates) { $updates } else { "none" }
} else {
    $report.software_updates = "unsupported"
}

# --- Battery Info ---
$battery = Get-WmiObject Win32_Battery -ErrorAction SilentlyContinue
$report.battery = if ($battery) {
    @{ Status = $battery.BatteryStatus; Charge = $battery.EstimatedChargeRemaining }
} else { "no_battery" }

# --- Uptime ---
$boot = Safe-Invoke { (Get-CimInstance Win32_OperatingSystem).LastBootUpTime } (Get-Date)
$report.boot_time = $boot.ToString("yyyy-MM-dd HH:mm:ss")
$report.uptime = ((Get-Date) - $boot).ToString()

# --- Disk Usage ---
$report.disk_usage = @()
$disks = Get-WmiObject Win32_LogicalDisk -Filter "DriveType=3"
foreach ($d in $disks) {
    if ($d.Size -and $d.FreeSpace) {
        $report.disk_usage += @{
            drive = $d.DeviceID
            label = $d.VolumeName
            free_percent = [math]::Round(($d.FreeSpace / $d.Size) * 100, 2)
        }
    }
}

# --- Last Crash ---
$lastCrash = Safe-Invoke { Get-WinEvent -FilterHashtable @{LogName='System'; ID=1001} -MaxEvents 1 } $null
$report.last_crash = if ($lastCrash) { $lastCrash.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss") } else { "none" }

# --- Startup Programs ---
$report.startup_programs = Safe-Invoke {
    Get-CimInstance -ClassName Win32_StartupCommand | Select-Object -ExpandProperty Name
} @("unavailable")

# --- Focus Assist ---
$report.focus_assist = Safe-Invoke {
    $focus = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Notifications\Settings" | Select-Object -ExpandProperty NOC_GLOBAL_SETTING_TOASTS_ENABLED
    if ($focus -eq 1) { "disabled" } else { "enabled" }
} "unavailable"

# --- Bluetooth ---
$bt = Safe-Invoke {
    Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq "OK" }
} @()
$report.bluetooth = if ($bt.Count -gt 0) { "on" } else { "off" }

# --- External Displays ---
$report.external_displays = Safe-Invoke { (Get-CimInstance Win32_DesktopMonitor).Count } 0

# --- VPN ---
$vpn = Safe-Invoke {
    Get-VpnConnection -AllUserConnection | Where-Object { $_.ConnectionStatus -eq "Connected" }
} @()
$report.vpn = if ($vpn.Count -gt 0) { "active" } else { "inactive" }

# --- Antivirus ---
$report.antivirus = Safe-Invoke {
    (Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct).displayName
} "unavailable"

# --- Network ---
$netAdapters = Safe-Invoke {
    Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
} @()
$report.network = @{}

foreach ($adapter in $netAdapters) {
    try {
        $ipInfo = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction Stop | Select-Object -First 1
        $dnsInfo = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4 -ErrorAction Stop
        $gwInfo = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue | Select-Object -First 1

        $linkSpeedRaw = $adapter.LinkSpeed
        $linkSpeedMbps = if ($linkSpeedRaw -is [string]) {
            [double]($linkSpeedRaw -replace '[^\d.]', '')
        } else {
            [math]::Round($linkSpeedRaw / 1MB, 2)
        }

        $report.network[$adapter.Name] = @{
            ip_address       = $ipInfo.IPAddress
            link_speed_mbps  = $linkSpeedMbps
            gateway          = if ($gwInfo) { $gwInfo.NextHop } else { "none" }
            dns_servers      = $dnsInfo.ServerAddresses
        }
    } catch {
        $report.network[$adapter.Name] = @{
            error  = "Failed to gather network info"
            reason = $_.Exception.Message
        }
    }
}

# --- Public IP ---
$report.public_ip = Safe-Invoke {
    (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip
} "unavailable"

# --- System & User Info ---
$os = Get-CimInstance Win32_OperatingSystem
$report.os_caption = $os.Caption
$report.os_version = $os.Version
$report.os_build = $os.BuildNumber
$report.architecture = $os.OSArchitecture
$report.time_zone = (Get-TimeZone).Id
$report.computer_name = $env:COMPUTERNAME
$report.current_user = $env:USERNAME
$report.system_uuid = (Get-CimInstance Win32_ComputerSystemProduct).UUID
$report.domain_joined = if ((Get-WmiObject Win32_ComputerSystem).PartOfDomain) { "yes" } else { "no" }

# --- Hardware ---
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$ram = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
$gpu = Get-CimInstance Win32_VideoController
$board = Get-CimInstance Win32_BaseBoard | Select-Object -First 1
$bios = Get-CimInstance Win32_BIOS | Select-Object -First 1

$report.cpu = @{
    name = $cpu.Name
    cores = $cpu.NumberOfCores
    logical_processors = $cpu.NumberOfLogicalProcessors
    max_clock_speed_mhz = $cpu.MaxClockSpeed
}
$report.ram_gb = [math]::Round($ram / 1GB, 2)
$report.gpus = $gpu | Select-Object -ExpandProperty Name
$report.motherboard = @{
    manufacturer = $board.Manufacturer
    product = $board.Product
}
$report.bios = @{
    version = $bios.SMBIOSBIOSVersion
    release_date = $bios.ReleaseDate
}

# --- BitLocker ---
$report.bitlocker = Safe-Invoke {
    Get-BitLockerVolume | ForEach-Object {
        @{
            drive = $_.MountPoint
            protection_status = $_.ProtectionStatus
        }
    }
} "unsupported"

# --- Firewall Status ---
$fw = Safe-Invoke { Get-NetFirewallProfile } $null
if ($fw) {
    $report.firewall = @{
        domain  = $fw | Where-Object {$_.Name -eq "Domain"} | Select-Object -ExpandProperty Enabled
        private = $fw | Where-Object {$_.Name -eq "Private"} | Select-Object -ExpandProperty Enabled
        public  = $fw | Where-Object {$_.Name -eq "Public"} | Select-Object -ExpandProperty Enabled
    }
}

# --- Time Sync Source ---
$report.time_sync = Safe-Invoke {
    $status = w32tm /query /status 2>&1
    $source = ($status | Where-Object { $_ -match "Source" }) -replace '.*:\s+', ''
    $source
} "unknown"

# --- Pending Reboot ---
$rebootKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\RebootPending"
$report.pending_reboot = if (Test-Path $rebootKey) { "yes" } else { "no" }

# --- Stopped Critical Services ---
$services = "WinDefend","w32time","wuauserv","BITS"
$stopped = Get-Service | Where-Object { $services -contains $_.Name -and $_.Status -ne "Running" }
$report.critical_services = $stopped | Select-Object Name, Status

# --- Environment Details ---
$report.environment = @{
    os_locale    = (Get-Culture).Name
    current_ui   = (Get-UICulture).Name
    system_drive = $env:SystemDrive
    user_sid     = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
}

# --- Final JSON Output ---
$output = try {
    $report | ConvertTo-Json -Depth 10
} catch {
    @{ error = "Failed to convert to JSON"; reason = $_.Exception.Message } | ConvertTo-Json -Depth 5 -Compress
}

$output.Trim() | Write-Output
