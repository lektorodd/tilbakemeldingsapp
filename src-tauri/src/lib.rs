use std::process::{Command, Child};
use std::sync::Mutex;
use std::path::PathBuf;
use std::net::TcpStream;
use std::time::Duration;
use std::thread;
use tauri::Manager;

// Hold the server child process so we can kill it on exit
static SERVER_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                // Dev mode: Next.js dev server is started by beforeDevCommand
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            } else {
                // Production mode: launch the standalone Next.js server
                let resource_dir = app
                    .path()
                    .resource_dir()
                    .expect("failed to resolve resource dir");

                let server_dir = resource_dir.join("server");
                let server_js = server_dir.join("server.js");

                if server_js.exists() {
                    let node = find_node();

                    // Build a rich PATH so the server can find typst and other tools
                    let system_path = std::env::var("PATH").unwrap_or_default();
                    let extra_paths = [
                        "/opt/homebrew/bin",
                        "/usr/local/bin",
                        "/usr/bin",
                        "/bin",
                        "/usr/sbin",
                        "/sbin",
                    ];
                    let full_path = extra_paths
                        .iter()
                        .chain(system_path.split(':').collect::<Vec<_>>().iter())
                        .copied()
                        .collect::<Vec<_>>()
                        .join(":");

                    let mut cmd = Command::new(node);
                    cmd.arg(&server_js)
                        .env("PORT", "3333")
                        .env("HOSTNAME", "localhost")
                        .env("PATH", &full_path)
                        .current_dir(&server_dir);

                    match cmd.spawn() {
                        Ok(child) => {
                            // Store the child process for cleanup on exit
                            *SERVER_PROCESS.lock().unwrap() = Some(child);

                            // Wait for the server to be ready before the WebView loads
                            wait_for_server("127.0.0.1", 3333, 30, 200);
                        }
                        Err(e) => {
                            eprintln!("Failed to start Next.js server: {}", e);
                        }
                    }
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // Run the app and handle exit cleanup
    app.run(|_app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            if let Ok(mut guard) = SERVER_PROCESS.lock() {
                if let Some(ref mut child) = *guard {
                    let _ = child.kill();
                    let _ = child.wait();
                }
            }
        }
    });
}

/// Wait for the server to accept TCP connections on the given port.
/// Retries up to `max_retries` times, sleeping `interval_ms` between attempts.
fn wait_for_server(host: &str, port: u16, max_retries: u32, interval_ms: u64) {
    for i in 0..max_retries {
        if TcpStream::connect_timeout(
            &format!("{}:{}", host, port).parse().unwrap(),
            Duration::from_millis(100),
        ).is_ok() {
            println!("Server ready on port {} (attempt {})", port, i + 1);
            return;
        }
        thread::sleep(Duration::from_millis(interval_ms));
    }
    eprintln!("Warning: server not ready after {} attempts, proceeding anyway", max_retries);
}

/// Find the node binary on the system
fn find_node() -> PathBuf {
    let candidates = [
        "/opt/homebrew/bin/node",
        "/usr/local/bin/node",
        "/usr/bin/node",
    ];

    for candidate in &candidates {
        let path = PathBuf::from(candidate);
        if path.exists() {
            return path;
        }
    }

    PathBuf::from("node")
}

