# Cursor Code Agent 自动注入（可开关）

在**每次新开 Agent 会话**时，可选地自动把 **Code Agent 提示词**（`.cursor/code-agent.md`）和 **Agent.md** 通过 Hook 注入到上下文中（`additional_context`）。关闭开关后行为与未配置时一致。

## 前置条件

- Cursor 已支持第三方 Hooks（见 [Hooks 文档](https://cursor.com/docs/agent/hooks)）。
- 本机已安装 **Node.js**（用于执行 `.mjs` 脚本）。

## 使用方法

1. 用 Cursor **打开本文件夹**作为工作区根目录（或把 `.cursor/`、`Agent.md`、`package.json` 复制到你的项目根目录）。
2. **默认关闭**：`.cursor/code-agent-config.json` 里 `enabled` 为 `false`。
3. 需要自动加载时，在项目根执行：

   ```bash
   npm run code-agent:on
   ```

4. 不需要时执行：

   ```bash
   npm run code-agent:off
   ```

5. 查看当前状态：

   ```bash
   npm run code-agent:status
   ```

6. **新开一条 Agent/Chat 会话**验证：开启后，模型上下文应出现「Code Agent 提示词」与「Agent.md」两段内容。

也可直接运行：

```bash
node .cursor/hooks/toggle.mjs on
node .cursor/hooks/toggle.mjs off
node .cursor/hooks/toggle.mjs status
```

## 配置说明

编辑 `.cursor/code-agent-config.json`：

| 字段 | 含义 |
|------|------|
| `enabled` | `true` 时在新会话注入；`false` 时不注入 |
| `agent_md_path` | 相对仓库根的路径，默认 `Agent.md` |
| `code_agent_path` | 相对仓库根的路径，默认 `.cursor/code-agent.md` |

## 团队与隐私

- 若希望每人本地决定是否开启：将 `.cursor/code-agent-config.json` 加入 `.gitignore`（本仓库 `.gitignore` 里已预留注释说明），并把 `code-agent-config.example.json` 复制为本地配置。
- Hook 与脚本可提交到仓库，便于团队统一行为。

## 注意事项

- Hook **stdout 必须是合法 JSON**，字段名为 **`additional_context`**（蛇形命名）。
- 注入内容过长会占用上下文窗口，可按需缩短 `Agent.md` 或只注入摘要。
- 不同 Cursor 版本对 Hook 的 payload 字段可能略有差异；脚本已用 `workspace_roots[0]`，若无则回退 `process.cwd()`。

## 文件结构

```
.cursor/
  hooks.json                 # 注册 sessionStart
  code-agent.md              # Code Agent 提示词（可替换为你的无状态 prompt）
  code-agent-config.json     # 开关与路径
  code-agent-config.example.json
  hooks/
    session-start.mjs        # 会话开始时执行
    toggle.mjs               # 命令行开关
Agent.md                     # 项目/进度上下文（示例）
package.json                 # npm scripts
```
