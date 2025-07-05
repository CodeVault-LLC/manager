use tokio::net::TcpStream;
use std::time::Duration;
use tonic::{Request, Response, Status};
use tonic::Response as TonicResponse;
use futures::stream::{FuturesUnordered, StreamExt};
use chrono::Utc;
use tokio::net::lookup_host;
use ipnet::IpNet;
use std::net::IpAddr;
use std::str::FromStr;
use tokio_stream::wrappers::ReceiverStream;
use tokio::sync::mpsc;
use once_cell::sync::OnceCell;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::services::network::service_probe::NmapProbe;

pub static NMAP_PROBES: OnceCell<Vec<NmapProbe>> = OnceCell::new();

pub mod network_grpc {
    tonic::include_proto!("network");
}

use network_grpc::network_scanner_server::{NetworkScanner, NetworkScannerServer};
use network_grpc::{NetworkScanRequest, NetworkScanResponse, HostScanResult, RmapPort};

pub struct NetworkScannerService;

#[tonic::async_trait]
impl NetworkScanner for NetworkScannerService {
    type ScanNetworkStream = ReceiverStream<Result<NetworkScanResponse, Status>>;

    async fn scan_network(
        &self,
        request: Request<NetworkScanRequest>,
    ) -> Result<Response<Self::ScanNetworkStream>, Status> {
        let req = request.into_inner();

        let mut ip_list = Vec::new();
        for ip in req.ip_addresses {
            if let Ok(net) = IpNet::from_str(&ip) {
                for ip in net.hosts() {
                    ip_list.push(ip.to_string());
                }
            } else if let Ok(ip_addr) = ip.parse::<IpAddr>() {
                ip_list.push(ip_addr.to_string());
            }
        }

        let ports = if req.full_scan {
            (1..=65535).collect::<Vec<u32>>()
        } else if !req.ports.is_empty() {
            req.ports
        } else {
            vec![22, 80, 443]
        };

        let total: usize = ip_list.len() * ports.len();
        let mut scanned: i32 = 0;

        let detect_services = req.detect_services;

        let (tx, rx) = mpsc::channel(32);

        tokio::spawn(async move {
            for ip in ip_list {
                let mut port_futures = FuturesUnordered::new();

                for &port in &ports {
                    let ip_clone = ip.clone();
                    port_futures.push(tokio::spawn(scan_port(ip_clone, port, detect_services)));
                }

                let mut results = Vec::new();
                while let Some(res) = port_futures.next().await {
                    if let Ok(Some(status)) = res {
                        results.push(status);
                    }
                }

                if !results.is_empty() {
                    let hostname = reverse_dns(&ip).await;
                    let os = guess_os(&results);
                    let risk = evaluate_risk(&results);
                    let last_seen = Utc::now().to_rfc3339();
                    scanned += 1;

                    let host_result = HostScanResult {
                        host: ip.clone(),
                        hostname,
                        status: "up".to_string(),
                        os,
                        last_seen,
                        risk,
                        ports: results,
                    };

                    println!("Sending result for host: {}", ip);

                    let _ = tx.send(Ok(NetworkScanResponse {
                        scanned: scanned.to_string(),
                        total: total.to_string(),
                        results: vec![host_result],
                    })).await;
                }
            }
        });

        Ok(TonicResponse::new(ReceiverStream::new(rx)))
    }
}

async fn scan_port(ip: String, port: u32, detect_services: bool) -> Option<RmapPort> {
    let addr = format!("{}:{}", ip, port);
    let timeout = Duration::from_secs(1);

    let connection = match tokio::time::timeout(timeout, TcpStream::connect(&addr)).await {
        Ok(Ok(_)) => true,
        _ => false,
    };

    println!("Scanning {}:{}", ip, port);

    if connection {
        let mut service = "unknown".to_string();
        let mut version = "".to_string();

        /*if detect_services {
            println!("Detecting service on {}:{}", ip, port);

            if let Some(probes) = NMAP_PROBES.get() {
                println!("Using {} probes for service detection", probes.len());

                for probe in probes.iter().filter(|p| p.protocol.to_uppercase() == "TCP") {
                    println!("Trying probe: {}", probe.name);

                    if let Ok(Ok(mut stream)) =
                        tokio::time::timeout(timeout, TcpStream::connect(&addr)).await
                    {
                        if stream.write_all(&probe.payload).await.is_err() {
                            println!("Failed to send probe payload to {}:{}", ip, port);
                            continue;
                        }

                        let mut buf = [0u8; 1024];

                        match tokio::time::timeout(timeout, stream.read(&mut buf)).await {
                            Ok(Ok(n)) if n > 0 => {
                                println!("Received {} bytes from {}:{}", n, ip, port);
                                let banner = String::from_utf8_lossy(&buf[..n]);
                                println!("Banner: {}", banner);

                                for m in &probe.matches {
                                    println!("Checking match: {}", m.service);
                                    if m.regex.is_match(&banner) {
                                        println!("Match found for service: {}", m.service);
                                        service = m.service.clone();
                                        version = m
                                            .version_info
                                            .clone()
                                            .unwrap_or_else(|| banner.to_string());
                                        break;
                                    }
                                }

                                if service != "unknown" {
                                    println!("Service detected: {} on port {}", service, port);
                                    break;
                                }
                            }
                            Ok(Ok(_)) => {
                                println!("Received 0 bytes from {}:{}", ip, port);
                            }
                            Ok(Err(e)) => {
                                println!("Read error from {}:{} -> {}", ip, port, e);
                            }
                            Err(_) => {
                                println!("Timed out reading from {}:{}", ip, port);
                            }
                        }
                    }
                }
            }
        }*/

        return Some(RmapPort {
            port,
            state: "open".to_string(),
            service,
            protocol: "tcp".to_string(),
            version,
        });
    }

    None
}

async fn reverse_dns(ip: &str) -> String {
    match lookup_host((ip, 0)).await {
        Ok(mut addrs) => {
            if let Some(addr) = addrs.next() {
                return addr.ip().to_string();
            }
        }
        Err(_) => {}
    }
    "".to_string()
}

fn guess_os(ports: &[RmapPort]) -> String {
    for port in ports {
        if port.service.contains("Microsoft") || port.port == 445 {
            return "Windows (heuristic)".to_string();
        }
        if port.service.contains("OpenSSH") || port.port == 22 {
            return "Linux (heuristic)".to_string();
        }
    }
    "Unknown".to_string()
}

fn evaluate_risk(ports: &[RmapPort]) -> String {
    if ports.iter().any(|p| p.port == 23 || p.service == "telnet") {
        "high".to_string()
    } else if ports.len() > 10 {
        "medium".to_string()
    } else {
        "low".to_string()
    }
}

pub fn get_service() -> NetworkScannerServer<NetworkScannerService> {
    NetworkScannerServer::new(NetworkScannerService)
}
