use tokio::net::TcpStream;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tonic::{Request, Response, Status};
use futures::stream::{FuturesUnordered, StreamExt};

pub mod network {
    tonic::include_proto!("network");
}

use network::network_scanner_server::{NetworkScanner, NetworkScannerServer};
use network::{NetworkScanRequest, NetworkScanResponse, HostScanResult, PortStatus};

pub struct NetworkScannerService;

#[tonic::async_trait]
impl NetworkScanner for NetworkScannerService {
    async fn scan_network(
        &self,
        request: Request<NetworkScanRequest>,
    ) -> Result<Response<NetworkScanResponse>, Status> {
        let req = request.into_inner();

        let ip_list = req.ip_addresses;
        let ports = if req.full_scan {
            (1..=65535).collect::<Vec<u32>>()
        } else if req.ports.is_empty() {
            vec![22, 80, 443, 3306, 8080]
        } else {
            req.ports
        };

        let detect_services = req.detect_services;

        let mut host_results = Vec::new();

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
                host_results.push(HostScanResult {
                    ip,
                    ports: results,
                });
            }
        }

        Ok(Response::new(NetworkScanResponse {
            results: host_results,
        }))
    }
}

async fn scan_port(ip: String, port: u32, detect_services: bool) -> Option<PortStatus> {
    let addr = format!("{}:{}", ip, port);
    let timeout = Duration::from_secs(1);

    let connection = tokio::time::timeout(timeout, TcpStream::connect(&addr))
        .await
        .ok();

    let mut service = "open".to_string();

    if detect_services {
        if let Some(Ok(mut stream)) = connection {
            let mut buf = [0u8; 1024];

            let _ = stream.write_all(b"\n").await;
            if let Ok(n) = stream.read(&mut buf).await {
                if n > 0 {
                    let banner = String::from_utf8_lossy(&buf[..n]).to_string();
                    service = banner.lines().next().unwrap_or("open").to_string();
                }
            }
        }
    }

    Some(PortStatus {
        port,
        state: "open".to_string(),
        service,
    })
}

pub fn get_service() -> NetworkScannerServer<NetworkScannerService> {
    NetworkScannerServer::new(NetworkScannerService)
}
