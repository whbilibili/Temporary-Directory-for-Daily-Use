# 踩坑档案 — 击刻 (KeyDiary)

> 记录开发过程中遇到的坑和解决方案，避免重复踩坑

## 格式

```
### [日期] 问题简述
- **现象**：描述遇到的问题
- **根因**：分析原因
- **解法**：如何解决
- **教训**：下次如何避免
```

---

### [2026-05-26] DMG 打包失败

- **现象**：`npm run tauri build -- --debug` 编译和 .app 打包成功，但 DMG 打包阶段报错 `failed to run bundle_dmg.sh`
- **根因**：`tauri.conf.json` 中 `productName: "击刻 KeyDiary"` 含中文和空格，导致 bundle_dmg.sh 脚本路径解析失败
- **解法**：暂不处理，开发阶段使用 `cargo build` 或 `.app` 验证即可。正式发布时考虑将 productName 改为 `KeyDiary` 然后在 app 内部显示中文名
- **教训**：Tauri 的 DMG 打包对含特殊字符的路径支持不佳，productName 尽量使用 ASCII 字符

### [2026-05-26] Tauri 2.x menu_on_left_click 已 deprecated

- **现象**：`cargo clippy` 报 `menu_on_left_click` deprecated 警告
- **根因**：Tauri 2.11.x 标记该方法为弃用，但尚无官方替代方案来区分左右键菜单行为
- **解法**：使用 `#[allow(deprecated)]` 消除警告，保留该调用以实现「左键 toggle 窗口、右键弹菜单」的行为
- **教训**：关注 Tauri release notes，待官方提供新 API 后迁移
