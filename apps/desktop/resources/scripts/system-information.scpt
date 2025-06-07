-- Helper function to safely run shell commands
on safe_shell(command, fallback)
	try
		return do shell script command
	on error
		return fallback
	end try
end safe_shell

on replace_text(theText, searchString, replacementString)
	set AppleScript's text item delimiters to searchString
	set theTextItems to text items of theText
	set AppleScript's text item delimiters to replacementString
	set theText to theTextItems as text
	set AppleScript's text item delimiters to ""
	return theText
end replace_text

set report to "{"

-- Uptime & Boot Time
set boot_time to safe_shell("sysctl -n kern.boottime | awk -F'[=,]' '{print $2}' | xargs -I {} date -r {} '+%Y-%m-%d %H:%M:%S'", "unknown")
set uptime to safe_shell("uptime | sed 's/.*up \\(.*\\), [0-9]* users.*/\\1/'", "unknown")
set report to report & "\"boot_time\": \"" & boot_time & "\","
set report to report & "\"uptime\": \"" & uptime & "\","

-- Battery
set battery_percent to safe_shell("pmset -g batt | grep -Eo '\\d+%' | tr -d '%'", "0")
set battery_status to safe_shell("pmset -g batt | grep -o 'AC Power\\|Battery Power'", "unknown")
set report to report & "\"battery\": {\"charge\": " & battery_percent & ", \"status\": \"" & battery_status & "\"},"

-- Startup Programs (Login Items)
set startup_programs to safe_shell("osascript -e 'tell application \"System Events\" to get the name of every login item'", "")
set AppleScript's text item delimiters to ", "
set startup_items to text items of startup_programs
set report to report & "\"startup_programs\": ["
repeat with i from 1 to count of startup_items
	set app_name to item i of startup_items
	set report to report & "\"" & app_name & "\""
	if i is not (count of startup_items) then
		set report to report & ","
	end if
end repeat
set report to report & "],"
set AppleScript's text item delimiters to ""

-- Focus Assist (Do Not Disturb)
set focus_assist to safe_shell("defaults -currentHost read ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb 2>/dev/null", "0")
if focus_assist is "1" then
	set focus_status to "enabled"
else
	set focus_status to "disabled"
end if
set report to report & "\"focus_assist\": \"" & focus_status & "\","

-- Bluetooth
set bluetooth_status to safe_shell("defaults read /Library/Preferences/com.apple.Bluetooth ControllerPowerState", "0")
if bluetooth_status is "1" then
	set report to report & "\"bluetooth\": \"on\","
else
	set report to report & "\"bluetooth\": \"off\","
end if

-- External Displays
set external_displays to safe_shell("system_profiler SPDisplaysDataType | grep -c Resolution", "0")
set report to report & "\"external_displays\": " & external_displays & ","

-- VPN
set vpn_status to safe_shell("ifconfig | grep utun", "")
if vpn_status is "" then
	set report to report & "\"vpn\": \"inactive\","
else
	set report to report & "\"vpn\": \"active\","
end if

-- Primary network interface
set primary_interface to safe_shell("route get default | grep interface | awk '{print $2}'", "unknown")
set ip_address to safe_shell("ipconfig getifaddr " & primary_interface, "unavailable")
set gateway to safe_shell("ipconfig getoption " & primary_interface & " router", "unavailable")
set dns_raw to safe_shell("scutil --dns | awk '/nameserver/ {print $3}'", "")
set dns_cleaned to replace_text(dns_raw, return, ",")
set dns_cleaned to replace_text(dns_cleaned, linefeed, ",")

-- Link Speed
set link_speed_raw to safe_shell("networksetup -getMedia " & primary_interface & " | grep Speed | awk '{print $3}'", "0")
if link_speed_raw is "unavailable" then
	set link_speed_mbps to "0"
else
	set link_speed_mbps to round (link_speed_raw as number)
	if link_speed_mbps is 0 then
		set link_speed_mbps to "0"
	else
		set link_speed_mbps to link_speed_mbps
	end if
end if

-- Network
set report to report & "\"network\": {\"interfaces\": [{"
set report to report & "\"name\": \"" & primary_interface & "\","
set report to report & "\"ip_address\": \"" & ip_address & "\","
set report to report & "\"link_speed_mbps\": " & link_speed_mbps & ","
set report to report & "\"gateway\": \"" & gateway & "\","
set report to report & "\"dns_servers\": ["
set AppleScript's text item delimiters to ","
set dns_items to text items of dns_cleaned
repeat with i from 1 to count of dns_items
	set d to item i of dns_items
	set report to report & "\"" & d & "\""

	if i is not (count of dns_items) then
		set report to report & ","
	end if

end repeat
set AppleScript's text item delimiters to ""
set report to report & "]}],"
set public_ip to safe_shell("curl -s https://api.ipify.org", "unavailable")
set report to report & "\"public_ip\": \"" & public_ip & "\"},"

-- System Info
set computer_name to safe_shell("scutil --get ComputerName", "unknown")
set current_user to short user name of (system info)
set os_version to safe_shell("sw_vers -productVersion", "unknown")
set os_build to safe_shell("sw_vers -buildVersion", "unknown")
set os_caption to safe_shell("sw_vers -productName", "macOS")
set arch to safe_shell("uname -m", "unknown")
set time_zone to safe_shell("systemsetup -gettimezone | awk '{print $3}'", "unknown")
set report to report & "\"os_caption\": \"" & os_caption & "\","
set report to report & "\"computer_name\": \"" & computer_name & "\","
set report to report & "\"current_user\": \"" & current_user & "\","
set report to report & "\"os_version\": \"" & os_version & "\","
set report to report & "\"os_build\": \"" & os_build & "\","
set report to report & "\"architecture\": \"" & arch & "\","
set report to report & "\"time_zone\": \"" & time_zone & "\","

-- CPU
set cpu_name to safe_shell("sysctl -n machdep.cpu.brand_string", "unknown")
set core_count to safe_shell("sysctl -n hw.physicalcpu", "0")
set logical_cores to safe_shell("sysctl -n hw.logicalcpu", "0")
set clock_speed to safe_shell("sysctl -n hw.cpufrequency", "0")
set clock_mhz to round ((clock_speed as number) / 1.0E6)
set report to report & "\"cpu\": {"
set report to report & "\"name\": \"" & cpu_name & "\","
set report to report & "\"cores\": " & core_count & ","
set report to report & "\"logical_processors\": " & logical_cores & ","
set report to report & "\"max_clock_speed_mhz\": " & clock_mhz & "},"

-- RAM & GPU
set ram to safe_shell("sysctl -n hw.memsize", "unknown")
set ramGB to round ((ram as number) / 1.073741824E+9)
set gpu to safe_shell("system_profiler SPDisplaysDataType | grep 'Chipset Model' | awk -F': ' '{print $2}'", "unknown")
set report to report & "\"ram_gb\": " & ramGB & ","
set report to report & "\"gpus\": \"" & gpu & "\","

-- Time Sync
set time_source to safe_shell("systemsetup -getnetworktimeserver | awk '{print $4}'", "unknown")
set report to report & "\"time_sync\": \"" & time_source & "\","

-- Defaults and placeholders for required fields
set report to report & "\"pending_reboot\": \"unknown\","
set report to report & "\"firewall\": {\"private\": 1, \"domain\": 1, \"public\": 1},"
set report to report & "\"environment\": {\"os_locale\": \"en-US\", \"system_drive\": \"/\", \"user_sid\": \"unknown\", \"current_ui\": \"Aqua\"},"
set report to report & "\"bios\": {\"version\": \"N/A\", \"release_date\": \"N/A\"},"
set report to report & "\"bitlocker\": {\"protection_status\": 0, \"drive\": \"/\"},"
set report to report & "\"motherboard\": {\"manufacturer\": \"Apple\", \"product\": \"MacBook\"},"
set report to report & "\"critical_services\": [],"
set report to report & "\"disk_usage\": [],"
set report to report & "\"software_updates\": \"unknown\","
set report to report & "\"system_uuid\": \"unknown\","
set report to report & "\"recent_warnings\": [],"
set report to report & "\"last_crash\": \"none\","
set report to report & "\"domain_joined\": \"false\","
set report to report & "\"antivirus\": \"none\""

set report to report & "}"

-- Output Final JSON
return report
