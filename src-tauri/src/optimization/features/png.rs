use std::{
    fs::{self, File},
    io::Write,
    path::Path,
};

use anyhow::{Context, Result};
use image::EncodableLayout;

pub fn optimize_png(input_path: &Path, output_path: &Path) -> Result<()> {
    oxipng::optimize(
        &input_path.try_into().unwrap(),
        &oxipng::OutFile::Path(Some(output_path.into())),
        &oxipng::Options::default(),
    )
    .map_err(|e| anyhow!(e))?;

    Ok(())
}

pub fn optimize_png8(input_path: &Path, output_path: &Path, quality: u8) -> Result<()> {
    // read
    let input = fs::read(input_path).with_context(|| format!("Failed to read {:?}", input_path))?;
    let bitmap = lodepng::decode32(input.as_bytes())
        .with_context(|| format!("Failed to decode {:?}", input_path))?;

    // optimize
    let mut liq = imagequant::new();
    let _ = liq.set_quality(0, quality);
    let mut img = liq
        .new_image(bitmap.buffer.as_slice(), bitmap.width, bitmap.height, 0.0)
        .with_context(|| format!("Failed to create image from {:?}", input_path))?;
    let mut res = liq
        .quantize(&mut img)
        .with_context(|| format!("Failed to quantize {:?}", input_path))?;
    res.set_dithering_level(1.0)
        .with_context(|| format!("Failed to set dithering level for {:?}", input_path))?;
    let (palette, pixels) = res
        .remapped(&mut img)
        .with_context(|| format!("Failed to remap {:?}", input_path))?;

    // write
    let mut encoder = lodepng::Encoder::new();
    encoder
        .set_palette(palette.as_slice())
        .with_context(|| format!("Failed to set palette for {:?}", input_path))?;
    let result = encoder
        .encode(pixels.as_slice(), bitmap.width, bitmap.height)
        .with_context(|| format!("Failed to encode {:?}", input_path))?;
    let mut output =
        File::create(output_path).with_context(|| format!("Failed to create {:?}", output_path))?;
    output.write_all(result.as_slice()).with_context(|| {
        format!(
            "Failed to write png8 to {:?}",
            output_path.to_str().unwrap()
        )
    })?;

    Ok(())
}
