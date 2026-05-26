/// IPC 命令模块：暴露给前端的所有 Tauri Command
///
/// 前端通过 `invoke("command_name", { params })` 调用这些函数，
/// Tauri 框架负责 JSON 序列化/反序列化。

/// 返回应用状态文字，用于验证前后端通信链路是否通畅。
#[tauri::command]
pub fn get_app_status() -> String {
    "Hello, KeyDiary".to_string()
}
