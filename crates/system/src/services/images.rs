use image::{DynamicImage, ImageFormat, imageops::FilterType};
use tonic::{Request, Response, Status};
use std::io::{Cursor, Write};
use ico::{IconDir, IconImage};
use zip::{write::FileOptions, ZipWriter};
use rayon::prelude::*;

pub mod images {
    tonic::include_proto!("system");
}

use images::image_converter_server::{ImageConverter, ImageConverterServer};
use images::{ConvertImageRequest, ConvertImageResponse, OutputFormat};

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

        let base_image = image::load_from_memory(&image_data)
            .map_err(|e| Status::invalid_argument(format!("Invalid image: {}", e)))?;

        let results: Vec<_> = outputs
            .into_par_iter()
            .map(|output| process_image_output(&base_image, &output))
            .collect();

        let mut zip_buf = Vec::with_capacity(64 * 1024);
        let mut zip = ZipWriter::new(Cursor::new(&mut zip_buf));
        let options = FileOptions::<()>::default().compression_method(zip::CompressionMethod::Deflated);

        let mut metadata = String::from("Image Conversion Metadata:\n\n");

        for result in results {
            match result {
                Ok((filename, buffer, meta)) => {
                    zip.start_file(&filename, options)
                        .map_err(|e| Status::internal(format!("Zip error: {}", e)))?;
                    zip.write_all(&buffer)
                        .map_err(|e| Status::internal(format!("Zip write error: {}", e)))?;
                    metadata.push_str(&meta);
                    metadata.push('\n');
                }
                Err(e) => {
                    metadata.push_str(&format!("ERROR: {}\n", e));
                }
            }
        }

        // Add metadata.txt
        zip.start_file("metadata.txt", options)
            .map_err(|e| Status::internal(format!("Metadata zip error: {}", e)))?;
        zip.write_all(metadata.as_bytes())
            .map_err(|e| Status::internal(format!("Metadata write error: {}", e)))?;

        let cursor = zip.finish()
            .map_err(|e| Status::internal(format!("Zip finalize error: {}", e)))?;

        Ok(Response::new(ConvertImageResponse {
            buffer: cursor.into_inner().to_vec(),
            filename: "converted_images.zip".into(),
            mime: "application/zip".into(),
        }))
    }
}

fn process_image_output(image: &DynamicImage, output: &OutputFormat) -> Result<(String, Vec<u8>, String), String> {
    let mut img = image.clone();

    // Resize
    let (w, h) = (output.width as u32, output.height as u32);
    img = if output.preserve_aspect {
        img.resize(w, h, FilterType::Lanczos3)
    } else {
        img.resize_to_fill(w, h, FilterType::Lanczos3)
    };

    // Grayscale
    if output.grayscale {
        img = DynamicImage::ImageLuma8(img.to_luma8());
    }

    let filename = format!("{}.{}", output.name, output.format);
    let buffer = match output.format.as_str() {
        "png" => encode_image(&img, ImageFormat::Png)?,
        "jpeg" | "jpg" => encode_image(&img, ImageFormat::Jpeg)?,
        "bmp" => encode_image(&img, ImageFormat::Bmp)?,
        "ico" => encode_ico(&img)?,
        "icns" => encode_image(&img, ImageFormat::Png)?, // Placeholder
        "tiff" => encode_image(&img, ImageFormat::Tiff)?,
        "webp" => encode_image(&img, ImageFormat::WebP)?,
        "avif" => encode_image(&img, ImageFormat::Avif)?,
        "tga" => encode_image(&img, ImageFormat::Tga)?,
        "ppm" => encode_image(&img, ImageFormat::Pnm)?,
        other => return Err(format!("Unsupported format: {}", other)),
    };

    let meta = format!(
        "- {}: {}x{}, format={}, grayscale={}, aspect={}",
        filename, img.width(), img.height(), output.format, output.grayscale, output.preserve_aspect
    );

    Ok((filename, buffer, meta))
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
