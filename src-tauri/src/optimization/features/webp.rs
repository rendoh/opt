use std::{io::Write, path::Path};

use anyhow::{Context, Result};
use image::{EncodableLayout, GenericImageView};
use webp::{Encoder, WebPMemory};

pub fn generate_webp(input_path: &Path, output_path: &Path, quality: f32) -> Result<()> {
    let input_image =
        image::open(input_path).with_context(|| format!("Failed to open {:?}", input_path))?;
    let (w, h) = input_image.dimensions();
    let size_factor = 1.0;
    let input_image: image::DynamicImage =
        image::DynamicImage::ImageRgba8(image::imageops::resize(
            &input_image,
            (w as f64 * size_factor) as u32,
            (h as f64 * size_factor) as u32,
            image::imageops::FilterType::Triangle,
        ));
    let encoder = Encoder::from_image(&input_image)
        .map_err(|_| anyhow!("Failed to create encoder from image"))?;
    let webp: WebPMemory = encoder.encode(quality);
    let mut file = std::fs::File::create(output_path)
        .with_context(|| format!("Failed to create {:?}", output_path))?;
    file.write_all(webp.as_bytes()).with_context(|| {
        format!(
            "Failed to write webp to {:?}",
            output_path.to_str().unwrap()
        )
    })?;

    Ok(())
}
