use image::ImageFormat;
use tonic::{Request, Response, Status};
use std::io::{Cursor, Write};

use ico::{IconDir, IconImage};
use zip::write::FileOptions;
use zip::ZipWriter;

pub mod images {
    tonic::include_proto!("system");
}

use images::image_converter_server::{ImageConverter, ImageConverterServer};
use images::{ConvertImageRequest, ConvertImageResponse};

#[derive(Default)]
pub struct ImageService;

#[tonic::async_trait]
impl ImageConverter for ImageService {
    async fn convert_image(
        &self,
        request: Request<ConvertImageRequest>,
    ) -> Result<Response<ConvertImageResponse>, Status> {
        println!("Received convert_image request: {:?}", request);
        
        let input = request.into_inner();
        let image_data = input.buffer;
        let outputs = input.outputs;

        println!("Image data length: {}", image_data.len());

        let image = image::load_from_memory(&image_data)
            .map_err(|e| Status::invalid_argument(format!("Invalid image: {}", e)))?;

        println!("Image loaded successfully: {}x{}", image.width(), image.height());

        let mut zip_buf = Vec::new();
        let mut zip = ZipWriter::new(Cursor::new(&mut zip_buf));
        let options = FileOptions::<()>::default().compression_method(zip::CompressionMethod::Deflated);

        println!("Starting to process outputs...");

        for output in outputs {
            let resized = image.resize_to_fill(
                output.width as u32,
                output.height as u32,
                image::imageops::FilterType::Lanczos3,
            );

            println!("Resized image to: {}x{}", resized.width(), resized.height());

            let file_data = match output.format.as_str() {
                "png" => {
                    let mut buf = Vec::new();
                    resized
                        .write_to(&mut Cursor::new(&mut buf), ImageFormat::Png)
                        .map_err(|e| Status::internal(format!("PNG encode error: {}", e)))?;
                    buf
                }
                "ico" => {
                    let mut icon_dir = IconDir::new(ico::ResourceType::Icon);
                    let rgba = resized.to_rgba8();
                    let icon_image = IconImage::from_rgba_data(rgba.width(), rgba.height(), rgba.into_raw());
                    let icon_entry = ico::IconDirEntry::encode(&icon_image).map_err(|e| Status::internal(format!("ICO encode error: {}", e)))?;
                    icon_dir.add_entry(icon_entry);

                    let mut buf = Vec::new();
                    icon_dir
                        .write(&mut buf)
                        .map_err(|e| Status::internal(format!("ICO encode error: {}", e)))?;
                    buf
                }
                "icns" => {
                    // Placeholder: in production, use native tooling or a custom encoder
                    let mut buf = Vec::new();
                    resized
                        .write_to(&mut Cursor::new(&mut buf), ImageFormat::Png)
                        .map_err(|e| Status::internal(format!("ICNS placeholder error: {}", e)))?;
                    buf
                }
                other => {
                    return Err(Status::invalid_argument(format!("Unsupported format: {}", other)))
                }
            };

            println!("Adding file to zip: {}.{}", output.name, output.format);

            zip.start_file(output.name, options)
                .map_err(|e| Status::internal(format!("Zip error: {}", e)))?;
            zip.write_all(&file_data)
                .map_err(|e| Status::internal(format!("Zip write error: {}", e)))?;
        }

        println!("Finalizing zip...");

        zip.finish()
            .map_err(|e| Status::internal(format!("Zip finalize error: {}", e)))?;

        println!("Zip created successfully, size: {} bytes", zip_buf.len());

        Ok(Response::new(ConvertImageResponse {
            buffer: zip_buf,
            filename: "icons.zip".into(),
            mime: "application/zip".into(),
        }))
    }
}

pub fn get_service() -> ImageConverterServer<ImageService> {
    ImageConverterServer::new(ImageService::default())
}
