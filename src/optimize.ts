import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { downloadDir } from '@tauri-apps/api/path';

export type OptimizeResult = {
  type: 'result';
  path: string;
  original_path: string;
  original_size: number;
  final_size: number;
};

export type OptimizeError = {
  type: 'error';
  path: string;
  error: string;
};

export type OptimizeOptions = {
  optimize_images: boolean;
  jpg_quality: number;
  generate_webp: boolean;
  webp_quality: number;
  webp_from_optimized: boolean;
  use_png8: boolean;
  png8_quality: number;
};

export async function optimize(paths: string[], options: OptimizeOptions) {
  const distDir = await open({
    title: 'Please select a destination',
    directory: true,
    multiple: false,
    defaultPath: await downloadDir(),
  });
  if (typeof distDir !== 'string') {
    return;
  }
  return invoke<(OptimizeResult | OptimizeError)[]>('optimize', {
    paths,
    distDir,
    options,
  });
}

const defaultOptions: OptimizeOptions = {
  generate_webp: true,
  jpg_quality: 80,
  optimize_images: true,
  png8_quality: 80,
  use_png8: false,
  webp_from_optimized: false,
  webp_quality: 80,
};

export function saveOptions(options: OptimizeOptions) {
  localStorage.setItem('options', JSON.stringify(options));
}

export function loadOptions(): OptimizeOptions {
  const optionsStr = localStorage.getItem('options');
  if (optionsStr) {
    try {
      const parsed = JSON.parse(optionsStr);
      if (isOption(parsed)) {
        const merged = {
          ...defaultOptions,
          ...parsed,
        };
        return merged;
      }
    } catch (error) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

const optionalMatch = (
  obj: Record<string, unknown>,
  key: string,
  primitiveType: 'boolean' | 'string' | 'number',
): boolean => {
  return !(key in obj) || typeof obj[key] === primitiveType;
};

function isOption(value: unknown): value is Partial<OptimizeOptions> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    optionalMatch(obj, 'optimize_images', 'boolean') &&
    optionalMatch(obj, 'jpg_quality', 'number') &&
    optionalMatch(obj, 'generate_webp', 'boolean') &&
    optionalMatch(obj, 'webp_quality', 'number') &&
    optionalMatch(obj, 'webp_from_optimized', 'boolean') &&
    optionalMatch(obj, 'use_png8', 'boolean') &&
    optionalMatch(obj, 'png8_quality', 'number')
  );
}

export type TargetImage = {
  path: string;
  size: number;
};

export async function getTargetImages(paths: string[]) {
  return invoke<TargetImage[]>('get_target_images', {
    paths,
  });
}
