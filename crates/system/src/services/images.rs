use image::{DynamicImage, ImageFormat};
use tonic::{Request, Response, Status};
use std::io::{Cursor, Write};
use ico::{IconDir, IconImage};
use zip::{write::FileOptions, ZipWriter};

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
        let input = request.into_inner();
        let image_data = input.buffer;
        let outputs = input.outputs;

        let image = image::load_from_memory(&image_data)
            .map_err(|e| Status::invalid_argument(format!("Invalid image: {}", e)))?;

        let zip_buf = tokio::task::spawn_blocking(move || {
            let mut zip_buf = Vec::with_capacity(64 * 1024);
            let mut zip = ZipWriter::new(Cursor::new(&mut zip_buf));
            let options = FileOptions::<()>::default().compression_method(zip::CompressionMethod::Deflated);

            for output in outputs {
                let resized = image.resize_to_fill(
                    output.width as u32,
                    output.height as u32,
                    image::imageops::FilterType::Lanczos3,
                );

                let file_data = match output.format.as_str() {
                    "png" => encode_image(&resized, ImageFormat::Png)?,
                    "jpeg" | "jpg" => encode_image(&resized, ImageFormat::Jpeg)?,
                    "bmp" => encode_image(&resized, ImageFormat::Bmp)?,
                    "ico" => encode_ico(&resized)?,
                    "icns" => encode_image(&resized, ImageFormat::Png)?, // Placeholder
                    f => return Err(format!("Unsupported format: {}", f)),
                };

                let filename = format!("{}.{}", output.name, output.format);
                zip.start_file(filename, options)
                    .map_err(|e| format!("Zip error: {}", e))?;
                zip.write_all(&file_data)
                    .map_err(|e| format!("Zip write error: {}", e))?;
            }

            let cursor = zip.finish().map_err(|e| format!("Zip finalize error: {}", e))?;

            Ok(cursor.into_inner().to_vec())
        })
        .await
        .map_err(|e| Status::internal(format!("Task failed: {}", e)))?
        .map_err(|e| Status::invalid_argument(e))?;

        Ok(Response::new(ConvertImageResponse {
            buffer: zip_buf,
            filename: "icons.zip".into(),
            mime: "application/zip".into(),
        }))
    }
}

fn encode_image(image: &DynamicImage, format: ImageFormat) -> Result<Vec<u8>, String> {
    let mut buf = Vec::with_capacity(16 * 1024);
    image
        .write_to(&mut Cursor::new(&mut buf), format)
        .map_err(|e| format!("{:?} encode error: {}", format, e))?;
    Ok(buf)
}

fn encode_ico(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let mut icon_dir = IconDir::new(ico::ResourceType::Icon);
    let rgba = image.to_rgba8();
    let icon_image = IconImage::from_rgba_data(rgba.width(), rgba.height(), rgba.into_raw());
    let icon_entry = ico::IconDirEntry::encode(&icon_image)
        .map_err(|e| format!("ICO encode error: {}", e))?;
    icon_dir.add_entry(icon_entry);

    let mut buf = Vec::new();
    icon_dir
        .write(&mut buf)
        .map_err(|e| format!("ICO write error: {}", e))?;
    Ok(buf)
}

pub fn get_service() -> ImageConverterServer<ImageService> {
    ImageConverterServer::new(ImageService::default())
}
