use std::collections::{HashMap, BinaryHeap};
use std::cmp::Reverse;
use std::num::NonZero;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, Duration};

use once_cell::sync::Lazy;
use rayon::prelude::*;
use walkdir::WalkDir;
use lru::LruCache;

use tonic::{Request, Response, Status};

pub mod system {
    tonic::include_proto!("system");
}

use system::file_space_analyzer_server::{FileSpaceAnalyzer, FileSpaceAnalyzerServer};
use system::{FileSpaceRequest, FileSpaceResponse, ExtensionUsage, HeavyItem, OptimizationTip, SpecialFolder};

// Cache type: (path, cached result)
static CACHE: Lazy<Mutex<LruCache<String, (SystemTime, FileSpaceResponse)>>> =
    Lazy::new(|| Mutex::new(LruCache::new(NonZero::new(100).unwrap()))); // Cache last 100 paths

const CACHE_TTL: Duration = Duration::from_secs(60); // 1 minute TTL

pub struct MyFileSpaceAnalyzer {}

#[tonic::async_trait]
impl FileSpaceAnalyzer for MyFileSpaceAnalyzer {
    async fn get_file_space_overview(
        &self,
        request: Request<FileSpaceRequest>,
    ) -> Result<Response<FileSpaceResponse>, Status> {
        let req = request.into_inner();
        let path = req.path;
        let use_cache = req.use_cache;

        if use_cache {
            if let Some((ts, data)) = CACHE.lock().unwrap().get(&path) {
                if ts.elapsed().unwrap_or_default() < CACHE_TTL {
                    return Ok(Response::new(data.clone()));
                }
            }
        }

        let scan_path = PathBuf::from(&path);
        if !scan_path.exists() || !scan_path.is_dir() {
            return Err(Status::invalid_argument("Invalid path"));
        }

        let special_keywords = vec!["node_modules", "tmp", "temp", ".cache", "build", "target"];
        let mut special_sizes: HashMap<String, u64> = HashMap::new();

        // Use parallel iterator to collect per-thread results, then merge
        let (ext_map, heavy_items, total_size, special_hits) = WalkDir::new(&scan_path)
            .follow_links(false)
            .into_iter()
            .par_bridge()
            .filter_map(Result::ok)
            .filter(|entry| entry.file_type().is_file())
            .map(|entry| {
                let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                let ext = entry.path().extension()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_ascii_lowercase();

                // Special folder tracking
                let mut matched_special = None;
                for kw in &special_keywords {
                    if entry.path().to_string_lossy().contains(kw) {
                        matched_special = Some((kw.to_string(), size));
                        break;
                    }
                }

                let mut ext_map = HashMap::new();
                if !ext.is_empty() {
                    ext_map.insert(ext, size);
                }

                let mut heap = BinaryHeap::new();
                heap.push(Reverse((size, entry.path().to_path_buf())));

                // Return special folder info as part of tuple for merging
                let mut specials = Vec::new();
                if let Some(special) = matched_special {
                    specials.push(special);
                }
                (ext_map, heap, size, specials)
            })
            .reduce(
                || (HashMap::new(), BinaryHeap::new(), 0u64, Vec::new()),
                |(mut map1, mut heap1, size1, mut specials1), (map2, heap2, size2, specials2)| {
                    // Merge extension maps
                    for (k, v) in map2 {
                        *map1.entry(k).or_insert(0) += v;
                    }
                    // Merge heaps and keep only top 10
                    heap1.extend(heap2.into_iter());
                    while heap1.len() > 10 {
                        heap1.pop();
                    }
                    // Collect special folder hits
                    specials1.extend(specials2);
                    (map1, heap1, size1 + size2, specials1)
                }
            );

        // Accumulate special folder sizes
        for (folder, size) in special_hits {
            *special_sizes.entry(folder).or_insert(0) += size;
        }

        let ext_data: Vec<ExtensionUsage> = ext_map
            .into_iter()
            .map(|(ext, size)| ExtensionUsage {
                extension: ext,
                size_bytes: size,
                percentage: if total_size > 0 {
                    (size as f64 / total_size as f64 * 100.0) as f32
                } else {
                    0.0
                },
            })
            .collect();

        let heavy_list: Vec<HeavyItem> = heavy_items
            .into_sorted_vec()
            .into_iter()
            .rev()
            .map(|Reverse((size, path))| HeavyItem {
                path: path.to_string_lossy().to_string(),
                size_bytes: size,
            })
            .collect();

        let special_folders = special_sizes.into_iter().map(|(path, size_bytes)| {
            SpecialFolder { path, size_bytes }
        }).collect::<Vec<_>>();

        // Generate dynamic tips
        let mut tips = vec![];

        for sf in &special_folders {
            if sf.path.contains("node_modules") && sf.size_bytes > 1_000_000_000 {
                tips.push(OptimizationTip {
                    message: format!(
                        "Your '{}' folder is over {} — consider pruning unused dependencies with `npm prune` or switching to PNPM.",
                        sf.path,
                        format_bytes(sf.size_bytes),
                    ),
                });
            } else if sf.path.contains("cache") && sf.size_bytes > 500_000_000 {
                tips.push(OptimizationTip {
                    message: format!(
                        "Your '{}' is large — try clearing cache directories regularly.",
                        sf.path
                    ),
                });
            } else if sf.path.contains("tmp") && sf.size_bytes > 200_000_000 {
                tips.push(OptimizationTip {
                    message: format!(
                        "Your '{}' folder is large — consider cleaning up temporary files.",
                        sf.path
                    ),
                });
            } else if sf.path.contains("build") && sf.size_bytes > 500_000_000 {
                tips.push(OptimizationTip {
                    message: format!(
                        "Your '{}' folder is large — consider cleaning up old build artifacts.",
                        sf.path
                    ),
                });
            } else if sf.path.contains("target") && sf.size_bytes > 500_000_000 {
                tips.push(OptimizationTip {
                    message: format!(
                        "Your '{}' folder is large — consider cleaning up old build artifacts.",
                        sf.path
                    ),
                });
            }
        }

        if tips.is_empty() {
            tips.push(OptimizationTip {
                message: "Try deleting old downloads or temp files.".into(),
            });
        }

        let response = FileSpaceResponse {
            extensions: ext_data,
            heavy_items: heavy_list,
            tips,
            special_folders,
            total_size,
        };

        // Store in cache
        if use_cache {
            CACHE.lock().unwrap().put(path.clone(), (SystemTime::now(), response.clone()));
        }

        Ok(Response::new(response))
    }
}

pub fn get_service() -> FileSpaceAnalyzerServer<MyFileSpaceAnalyzer> {
    FileSpaceAnalyzerServer::new(MyFileSpaceAnalyzer {})
}

// Helper function to format bytes human-readably
fn format_bytes(bytes: u64) -> String {
    let units = ["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit = 0;
    while size >= 1024.0 && unit < units.len() - 1 {
        size /= 1024.0;
        unit += 1;
    }
    format!("{:.1} {}", size, units[unit])
}
