use tonic::{transport::Server, Request, Status};

mod networking;

mod services;
use services::images;

use std::io;
/*
#[cfg(unix)]
#[tokio::main]
async fn main() -> io::Result<()> {
    use networking::unix::get_unix_stream;
    let r = get_unix_stream().await?;

    Server::builder()
        .add_service(images::get_service())
        .serve_with_incoming(tokio_stream::wrappers::UnixListenerStream::new(r))
        .await?;

    Ok(())
}
*/


fn auth_interceptor(request: Request<()>) -> Result<Request<()>, Status> {
    println!("Received request: {:?}", request);

    // Here you would implement your authentication logic.
    Ok(request)
}

#[cfg(unix)]
#[tokio::main]
async fn main() -> io::Result<()> {
    use std::net::SocketAddr;

    use tonic::service::InterceptorLayer;

    let addr: SocketAddr = "127.0.0.1:50051".parse().expect("Invalid address");
    println!("🧠 System service listening on {}", addr);


    let _ = Server::builder()
        .layer(InterceptorLayer::new(auth_interceptor))
        .add_service(images::get_service())
        .serve(addr)
        .await;

    Ok(())
}


#[cfg(windows)]
#[tokio::main]
async fn main() -> io::Result<()> {
    use std::net::SocketAddr;

    use tonic::service::InterceptorLayer;

    let addr: SocketAddr = "127.0.0.1:50051".parse().expect("Invalid address");
    println!("🧠 System service listening on {}", addr);


    let _ = Server::builder()
        .layer(InterceptorLayer::new(auth_interceptor))
        .add_service(images::get_service())
        .serve(addr)
        .await;

    Ok(())
}
