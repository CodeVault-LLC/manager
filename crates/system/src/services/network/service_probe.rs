use regex::Regex;
use std::fs::{self, File};
use std::io::{BufReader, BufRead, Write};
use std::path::PathBuf;

#[derive(Debug)]
pub struct NmapProbe {
    pub name: String,
    pub payload: Vec<u8>,
    pub fallback: Vec<String>,
    pub matches: Vec<NmapMatch>,
    pub protocol: String,
}

#[derive(Debug)]
pub struct NmapMatch {
    pub service: String,
    pub regex: Regex,
    pub version_info: Option<String>,
}

pub fn parse_nmap_service_probes<R: BufRead>(reader: R) -> Vec<NmapProbe> {
    let mut probes = Vec::new();
    let mut current_probe: Option<NmapProbe> = None;

    for line in reader.lines().flatten() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if line.starts_with("Probe ") {
            if let Some(probe) = current_probe.take() {
                probes.push(probe);
            }

            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                let name = parts[1].to_string();
                let payload = parse_payload(parts[2..].join(" "));
                let protocol = if parts.len() > 3 {
                    parts[3].to_string()
                } else {
                    "TCP".to_string() // Default to TCP if not specified
                };
                current_probe = Some(NmapProbe {
                    name,
                    payload,
                    fallback: vec![],
                    matches: vec![],
                    protocol,
                });
            }
        } else if let Some(probe) = current_probe.as_mut() {
            if line.starts_with("match ") {
                if let Some((service, regex)) = parse_match_rule(line) {
                    probe.matches.push(NmapMatch {
                        service,
                        regex,
                        version_info: None,
                    });
                }
            } else if line.starts_with("fallback ") {
                let fallbacks = line
                    .strip_prefix("fallback ").unwrap()
                    .split(',')
                    .map(str::to_string)
                    .collect();
                probe.fallback = fallbacks;
            }
        }
    }

    if let Some(probe) = current_probe {
        probes.push(probe);
    }

    probes
}

fn parse_payload(payload_str: String) -> Vec<u8> {
    let unescaped = payload_str
        .replace("\\r", "\r")
        .replace("\\n", "\n")
        .replace("\\0", "\0")
        .replace("\\\\", "\\");
    unescaped.into_bytes()
}

fn parse_match_rule(line: &str) -> Option<(String, Regex)> {
    let re = Regex::new(r"match\s+(\S+)\s+m/(.+)/").ok()?;
    let caps = re.captures(line)?;
    let service = caps.get(1)?.as_str().to_string();
    let pattern = caps.get(2)?.as_str();
    let regex = Regex::new(pattern).ok()?;
    Some((service, regex))
}

pub async fn init_service_probes() -> Vec<NmapProbe> {
    let url = "https://raw.githubusercontent.com/nmap/nmap/master/nmap-service-probes";

    let mut file_path = get_os_default_probe_path();

    // Try to read the file locally first
    if file_path.exists() {
        if let Ok(file) = File::open(&file_path) {
            return parse_nmap_service_probes(BufReader::new(file));
        }
    }

    // If not found, try to download
    if let Ok(response) = reqwest::get(url).await {
        if response.status().is_success() {
            if let Ok(text) = response.text().await {
                if let Some(parent) = file_path.parent() {
                    let _ = fs::create_dir_all(parent);
                }
                if let Ok(mut file) = File::create(&file_path) {
                    let _ = file.write_all(text.as_bytes());
                }

                return parse_nmap_service_probes(BufReader::new(text.as_bytes()));
            }
        }
    }

    // Fallback: Minimal Probes
    println!("WARNING: Using fallback probes. Network detection will be limited.");
    vec![
        NmapProbe {
            name: "basic".to_string(),
            payload: b"\r\n".to_vec(),
            fallback: vec![],
            protocol: "TCP".to_string(),
            matches: vec![
                NmapMatch {
                    service: "http".to_string(),
                    regex: Regex::new("(?i)Server:.*Apache|nginx").unwrap(),
                    version_info: None,
                },
                NmapMatch {
                    service: "ssh".to_string(),
                    regex: Regex::new("(?i)^SSH-").unwrap(),
                    version_info: None,
                },
            ],
        },
    ]
}

fn get_os_default_probe_path() -> PathBuf {
    let mut path: PathBuf;

    #[cfg(target_os = "windows")]
    {
        path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("nmap");
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("/tmp"));
        path.push("nmap");
    }

    path.push("nmap-service-probes");
    path
}
