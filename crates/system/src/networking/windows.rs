use std::io;
use interprocess::os::windows::named_pipe::{PipeListener, PipeListenerOptions, PipeStream};

pub async fn get_windows_stream() -> io::Result<PipeStream> {
    // Create a named pipe listener with default options
    // You can customize the options as needed, e.g., PipeListenerOptions::new().max_instances(5)
    let listener_options = PipeListenerOptions::new();

    Ok(stream)
}