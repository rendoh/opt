use std::{fs::File, io::Write, path::Path};

use anyhow::{Context, Result};
use image::GenericImageView;

pub fn optimize_jpeg(input_path: &Path, output_path: &Path, quality: f32) -> Result<()> {
    let image =
        image::open(input_path).with_context(|| format!("Failed to open {:?}", input_path))?;
    let (width, height) = image.dimensions();
    let pixels = image.into_bytes();
    let mut comp = mozjpeg::Compress::new(mozjpeg::ColorSpace::JCS_RGB);
    comp.set_scan_optimization_mode(mozjpeg::ScanMode::AllComponentsTogether);
    comp.set_size(width as usize, height as usize);
    comp.set_mem_dest();
    comp.set_quality(quality);
    comp.start_compress();
    comp.write_scanlines(&pixels[..]);
    comp.finish_compress();
    let jpeg_bytes = comp
        .data_to_vec()
        .map_err(|_| anyhow!("Failed to convert jpeg to vec"))?;
    let mut file =
        File::create(output_path).with_context(|| format!("Failed to create {:?}", output_path))?;
    file.write_all(&jpeg_bytes)
        .with_context(|| format!("Failed to write jpeg to {:?}", output_path))?;

    Ok(())
}
