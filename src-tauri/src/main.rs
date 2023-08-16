// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate anyhow;

mod optimization;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            optimization::optimize,
            optimization::get_target_images
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
