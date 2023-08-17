use std::{
    fs::{self},
    path::{Path, PathBuf},
};

use anyhow::{Context, Ok, Result};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use walkdir::{DirEntry, WalkDir};

mod features;
use self::features::{
    jpeg::optimize_jpeg,
    png::{optimize_png, optimize_png8},
    webp::generate_webp,
};

const IMAGE_EXTIONSIONS: [&str; 3] = ["png", "jpg", "jpeg"];

fn get_image_entries_from_path(path: &Path) -> Vec<DirEntry> {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .map(|ext| ext.to_string_lossy().to_lowercase())
                .map(|ext| IMAGE_EXTIONSIONS.contains(&ext.as_ref()))
                .unwrap_or(false)
        })
        .collect()
}

fn get_relative_path_str(abs_path: &Path, root_path: &Path) -> String {
    abs_path
        .strip_prefix(root_path)
        .unwrap_or(abs_path)
        .to_str()
        .unwrap()
        .to_string()
}

#[derive(Serialize)]
pub struct TargetImage {
    path: String,
    size: u64,
}

#[tauri::command(async)]
pub fn get_target_images(paths: Vec<&str>) -> Vec<TargetImage> {
    let mut target_images = paths
        .par_iter()
        .flat_map(|path| {
            let input_path = Path::new(path);
            get_image_entries_from_path(input_path)
                .into_iter()
                .map(|entry| TargetImage {
                    path: get_relative_path_str(entry.path(), input_path.parent().unwrap()),
                    size: entry.metadata().unwrap().len(),
                })
                .collect::<Vec<TargetImage>>()
        })
        .collect::<Vec<TargetImage>>();

    target_images.sort_by(|a, b| a.path.to_lowercase().cmp(&b.path.to_lowercase()));

    target_images
}

#[derive(Deserialize)]
pub struct Options {
    optimize_images: bool,
    jpg_quality: f32,
    generate_webp: bool,
    webp_quality: f32,
    webp_from_optimized: bool,
    use_png8: bool,
    png8_quality: u8,
}

#[derive(Serialize)]
pub struct OptimizeResult {
    path: String,
    original_path: String,
    original_size: u64,
    final_size: u64,
}

#[derive(Serialize)]
pub struct OptimizeError {
    path: String,
    error: String,
}

#[derive(Serialize)]
#[serde(tag = "type")]
pub enum OptimizeResultOrError {
    #[serde(rename = "result")]
    Result(OptimizeResult),
    #[serde(rename = "error")]
    Error(OptimizeError),
}

struct Input {
    input_root: PathBuf,
    entry: DirEntry,
}

fn optimize_image(
    input: &Input,
    dist_dir: &Path,
    options: &Options,
) -> Result<Vec<OptimizeResult>> {
    let Input { input_root, entry } = input;
    let entry_path = entry.path();
    // 選択された入力パスからの相対パス
    // NOTE:
    // 選択された対象がファイルの場合は、出力先ディレクトリ直下にファイルを出力し、
    // ディレクトリの場合は、出力先ディレクトリ直下にディレクトリを作成した上で保存する
    let path_from_input_root: &Path = if input_root.is_file() {
        let path_str = input_root.file_name().with_context(|| {
            format!(
                "Failed to get file name of {:?}",
                input_root.to_str().unwrap()
            )
        })?;
        Path::new(path_str)
    } else {
        let parent = input_root.parent().with_context(|| {
            format!("Failed to get parent of {:?}", input_root.to_str().unwrap())
        })?;
        entry_path.strip_prefix(parent).with_context(|| {
            format!(
                "Failed to strip prefix of {:?} from {:?}",
                parent.to_str().unwrap(),
                entry_path.to_str().unwrap()
            )
        })?
    };

    let output_file_path = dist_dir.join(path_from_input_root);
    let output_parent_path = output_file_path.parent().with_context(|| {
        format!(
            "Failed to get parent of {:?}",
            output_file_path.to_str().unwrap()
        )
    })?;

    if !output_parent_path.exists() {
        fs::create_dir_all(output_parent_path).with_context(|| {
            format!(
                "Failed to create directory {:?}",
                output_parent_path.to_str().unwrap()
            )
        })?;
    }

    let original_path = path_from_input_root.to_str().unwrap();
    let original_size = entry
        .metadata()
        .with_context(|| {
            format!(
                "Failed to get metadata of {:?}",
                entry_path.to_str().unwrap()
            )
        })?
        .len();
    let mut results: Vec<OptimizeResult> = vec![];

    if options.optimize_images {
        let entry_extension = entry_path
            .extension()
            .map(|ext| ext.to_string_lossy().to_lowercase())
            .with_context(|| {
                format!(
                    "Failed to get extension of {:?}",
                    entry_path.to_str().unwrap()
                )
            })?;

        match &entry_extension[..] {
            "jpg" | "jpeg" => {
                optimize_jpeg(entry_path, &output_file_path, options.jpg_quality)?;
            }
            "png" => {
                if options.use_png8 {
                    optimize_png8(entry_path, &output_file_path, options.png8_quality)?;
                } else {
                    optimize_png(entry_path, &output_file_path)?;
                }
            }
            _ => {
                return Err(anyhow!(
                    "Unsupported extension: {:?}",
                    entry_extension.to_string()
                ))
            }
        }

        let final_size = output_file_path
            .metadata()
            .with_context(|| {
                format!(
                    "Failed to get metadata of {:?}",
                    output_file_path.to_str().unwrap()
                )
            })?
            .len();

        results.push(OptimizeResult {
            path: get_relative_path_str(output_file_path.as_path(), dist_dir),
            original_path: original_path.to_string(),
            original_size,
            final_size,
        });
    }

    if options.generate_webp {
        let webp_input_path: &Path = if options.webp_from_optimized && options.optimize_images {
            &output_file_path
        } else {
            entry_path
        };
        let webp_output_path = Path::new(&output_file_path).with_extension("webp");
        generate_webp(webp_input_path, &webp_output_path, options.webp_quality)?;
        let final_size = webp_output_path
            .metadata()
            .with_context(|| {
                format!(
                    "Failed to get metadata of {:?}",
                    webp_output_path.to_str().unwrap()
                )
            })?
            .len();
        results.push(OptimizeResult {
            path: get_relative_path_str(webp_output_path.as_path(), dist_dir),
            original_path: original_path.to_string(),
            original_size,
            final_size,
        });
    }

    Ok(results)
}

fn create_dist_dir(dist_dir: &str) -> Result<std::path::PathBuf> {
    let dist_dir = Path::new(dist_dir);
    let dist_dir_name = "opt";
    let mut dist_dir_path = dist_dir.join(dist_dir_name);
    let mut i = 1;
    while dist_dir_path.exists() {
        dist_dir_path = dist_dir.join(format!("{}_{}", dist_dir_name, i));
        i += 1;
    }
    fs::create_dir(&dist_dir_path)
        .with_context(|| format!("Failed to create {:?}", dist_dir_path))?;

    Ok(dist_dir_path)
}

#[derive(Clone, Serialize)]
struct ProgressEventPayload {
    path: String,
}

fn get_path_from_result(result: &OptimizeResultOrError) -> String {
    match result {
        OptimizeResultOrError::Result(result) => result.original_path.to_lowercase(),
        OptimizeResultOrError::Error(error) => error.path.to_lowercase(),
    }
}

#[tauri::command]
pub async fn optimize(
    app_handle: tauri::AppHandle,
    paths: Vec<&str>,
    dist_dir: &str,
    options: Options,
) -> std::result::Result<Vec<OptimizeResultOrError>, String> {
    let dist_dir_path_buf = create_dist_dir(dist_dir).map_err(|e| e.to_string())?;
    let dist_dir = dist_dir_path_buf.as_path();

    let mut result: Vec<OptimizeResultOrError> = paths
        .into_par_iter()
        .flat_map(|path| {
            get_image_entries_from_path(Path::new(path))
                .into_par_iter()
                .flat_map(|entry| {
                    let input = Input {
                        input_root: Path::new(path).to_path_buf(),
                        entry,
                    };
                    let results = optimize_image(&input, dist_dir, &options)
                        .map(|results| {
                            results
                                .into_iter()
                                .map(OptimizeResultOrError::Result)
                                .collect::<Vec<OptimizeResultOrError>>()
                        })
                        .unwrap_or_else(|e| {
                            vec![OptimizeResultOrError::Error(OptimizeError {
                                path: get_relative_path_str(
                                    input.entry.path(),
                                    input.input_root.parent().unwrap(),
                                ),
                                error: e.to_string(),
                            })]
                        });
                    let _ = app_handle.emit_all(
                        "progress",
                        ProgressEventPayload {
                            path: get_relative_path_str(
                                input.entry.path(),
                                input.input_root.parent().unwrap(),
                            ),
                        },
                    );
                    results
                })
                .collect::<Vec<OptimizeResultOrError>>()
        })
        .collect();

    result.sort_by(|a, b| get_path_from_result(a).cmp(&get_path_from_result(b)));

    std::result::Result::Ok(result)
}
