/// 数据库初始化模块
/// 负责在 App 首次启动时创建 ~/.keydiary/ 目录和 data.db 空数据库文件。
/// Phase 0 只创建空文件，不建表（建表在 Phase 1 P1-004 实现）。
use std::env;
use std::fs;
use std::path::PathBuf;

use rusqlite::Connection;
use tauri::AppHandle;

/// 获取数据库文件路径：~/.keydiary/data.db
fn get_db_path() -> Result<PathBuf, String> {
    let home = env::var("HOME").map_err(|_| "无法获取 HOME 环境变量".to_string())?;
    Ok(PathBuf::from(home).join(".keydiary").join("data.db"))
}

/// 初始化数据库：确保目录存在并创建/打开 SQLite 数据库文件
pub fn init(_app: &AppHandle) -> Result<(), String> {
    let db_path = get_db_path()?;

    // 确保 ~/.keydiary/ 目录存在
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }

    // 打开/创建 data.db（Connection::open 不存在时自动创建文件）
    let conn = Connection::open(&db_path).map_err(|e| format!("打开数据库失败: {}", e))?;

    // 设置 WAL 模式以提升并发性能，并强制 SQLite 写入文件 header
    conn.execute_batch("PRAGMA journal_mode=WAL;")
        .map_err(|e| format!("设置数据库 WAL 模式失败: {}", e))?;

    Ok(())
}
