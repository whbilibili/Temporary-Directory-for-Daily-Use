# Codex 项目骨架构建完整方案

> 基于现有 skill 实现 + 图片调研 + 外部官方文档 + 内部学城文档的综合整理

---

## 一、背景与定位

### 1.1 什么是 Codex 项目骨架

Codex 项目骨架是一套**面向 AI Agent 优化的项目文件结构**，核心目标是让 AI 编码助手（OpenAI Codex、Claude Code、Cursor 等）能像"入职新员工读完所有文档后开始工作"一样理解项目。

核心公式（来自 Mitchell Hashimoto）：**Agent = Model + Harness**

项目骨架本身就是 Harness 的重要组成部分——它通过文件结构、规则文件、提示词模板、验证脚本等，为 Agent 提供结构化的工作环境。

### 1.2 为什么需要专门的骨架

传统项目结构面向人类开发者设计，AI Agent 面临三大挑战：

1. **上下文有限**：LLM 上下文窗口是稀缺资源，需要精心管理哪些信息"始终加载"、哪些"按需检索"
2. **缺乏持久记忆**：每次会话从零开始，需要外部化的状态管理
3. **容易重复犯错**：没有机制将教训固化为约束规则

---

## 二、设计原则

### 2.1 五层可组合架构（Daniel Vaughan 提出）

| 层级 | 名称 | 职责 | 对应文件 |
|------|------|------|----------|
| Layer 1 | 宪法 | 项目级持久指令 | `AGENTS.md` |
| Layer 2 | 能力 | 封装重复任务模板 | `.codex/skills/` |
| Layer 3 | 工具 | 连接外部服务 | `.codex/mcp.json` |
| Layer 4 | 角色 | 多 Agent 协作分工 | `.codex/agents/` |
| Layer 5 | 插件 | 可分发的能力包 | npm plugins |

### 2.2 Harness 工程六大组件

骨架中必须体现（来自 Harness Engineering 方法论）：

1. **系统提示**：AGENTS.md / CLAUDE.md — 项目地图与行为约束
2. **工具集**：Skills / MCP 定义 — Agent 可调用的能力
3. **基础设施**：沙箱、CI/CD、测试框架 — 执行环境
4. **编排逻辑**：子 Agent 分工、任务调度 — 协作模式
5. **校验层**：lint / test / 格式校验 — 质量门控
6. **监控与自愈**：日志、错误追踪、自动重试 — 可观测性

### 2.3 上下文工程三层策略

| 层次 | 策略 | 对应文件 |
|------|------|----------|
| 始终加载 | 短小精悍，每次会话自动读取 | `AGENTS.md`（<32KB） |
| 按需检索 | 渐进式披露，Agent 主动查找 | `docs/`、`prompts/`、`templates/` |
| 中间卸载 | 写入文件系统，释放上下文空间 | `tasks/`、`.codex/memory/daily/` |

### 2.4 关注点分离原则（GSD 框架启发）

每个文件只承担一个职责，设定大小限制防止上下文污染：

- 需求（REQUIREMENTS）/ 路线图（ROADMAP）/ 状态（STATE）/ 计划（PLAN）各自独立
- 每个文件建议 < 4KB，AGENTS.md 建议 < 2KB

---

## 三、完整目录结构方案

```text
<project>/
├── AGENTS.md                          # 🎯 AI Agent 入口（项目地图 + 行为约束）
├── CLAUDE.md                          # Claude Code 兼容入口（可引用 AGENTS.md）
├── README.md                          # 人类可读的项目说明
├── CHANGELOG.md                       # 变更日志
├── LICENSE                            # 许可证
├── .gitignore                         # Git 忽略规则
├── .gitattributes                     # Git 属性
├── .editorconfig                      # 编辑器统一配置
├── .env.example                       # 环境变量模板
│
├── .codex/                            # ═══ Codex 官方配置目录 ═══
│   ├── config.toml                    # 核心配置（模型、审批、沙箱、线程数）
│   ├── hooks.example.json             # Hook 事件处理器（示例，需信任后激活）
│   ├── mcp.json                       # MCP 服务器配置
│   │
│   ├── memory/                        # 📝 持久记忆（跨会话存活）
│   │   ├── README.md                  # 记忆使用说明
│   │   ├── project.md                 # 项目稳定事实与偏好
│   │   ├── decisions.md               # 重要决策及理由
│   │   ├── lessons.md                 # 教训与反模式（永不再犯）
│   │   └── daily/                     # 每日连续性笔记
│   │       └── .gitkeep
│   │
│   ├── agents/                        # 🤖 自定义子 Agent 角色
│   │   ├── explorer.toml              # 只读探索者（搜索、定位、分析）
│   │   ├── implementer.toml           # 实现者（聚焦编码）
│   │   ├── reviewer.toml              # 审查者（安全、正确性、回归）
│   │   ├── docs-researcher.toml       # 文档研究者（验证、引用）
│   │   └── test-writer.toml           # 测试编写者（覆盖率）
│   │
│   ├── hooks/                         # 🪝 Hook 脚本（示例）
│   │   ├── README.md                  # Hook 使用说明
│   │   ├── session_start.py           # 会话启动时加载上下文
│   │   ├── stop_summary.py            # 会话结束时生成摘要
│   │   ├── pre_tool_use_policy.py     # 工具调用前安全检查
│   │   └── post_tool_use_audit.py     # 工具调用后审计日志
│   │
│   ├── rules/                         # 🔒 命令权限规则（硬约束）
│   │   ├── README.md
│   │   └── templates/
│   │       └── default.rules.example  # 规则模板
│   │
│   └── skills/                        # ⚡ 可复用技能模板
│       ├── add-test.yaml              # 生成单元测试
│       ├── refactor.yaml              # 重构指导
│       └── fix-bug.yaml               # Bug 修复流程
│
├── .agents/                           # ═══ 跨工具兼容的 Agent 配置 ═══
│   └── skills/
│       └── project-context/           # 仓库级项目上下文 Skill
│           ├── SKILL.md
│           └── references/
│               └── project-map.md
│
├── docs/                              # 📚 项目知识文档
│   ├── INDEX.md                       # 文档索引（渐进式披露入口）
│   ├── architecture.md                # 系统架构、边界、约束
│   ├── context-engineering.md         # 上下文管理策略说明
│   ├── onboarding.md                  # 新人/新 Agent 入门指南
│   ├── operations.md                  # 运维命令、发布流程
│   └── decisions/                     # ADR（架构决策记录）
│       └── 0001-record-architecture-decisions.md
│
├── tasks/                             # ✅ 任务管理
│   ├── README.md                      # 任务系统说明
│   ├── active.md                      # 当前进行中的任务
│   ├── backlog.md                     # 待办任务池
│   ├── done.md                        # 已完成任务归档
│   └── task-template.md              # 任务模板
│
├── prompts/                           # 💬 可复用提示词
│   ├── README.md
│   ├── implementation-plan.md         # 实现计划提示
│   ├── code-review.md                 # 代码审查提示
│   ├── research.md                    # 调研提示
│   ├── handoff.md                     # 交接提示
│   └── debug.md                       # 调试提示
│
├── templates/                         # 📋 文档模板
│   ├── README.md
│   ├── adr.md                         # ADR 模板
│   ├── feature-spec.md                # 功能规格模板
│   ├── pr-description.md              # PR 描述模板
│   ├── bugfix-template.md             # Bug 修复模板
│   └── handoff.md                     # 交接模板
│
├── snippets/                          # 🧩 代码片段库
│   ├── code-snippets.md               # 常用代码片段
│   └── command-snippets.md            # 常用命令片段
│
├── scripts/                           # 🔧 确定性脚本
│   ├── README.md
│   ├── bootstrap.sh                   # 环境初始化
│   ├── check.sh                       # 项目验证（lint + test + typecheck）
│   ├── new-task.sh                    # 创建新任务
│   ├── sync.sh                        # 同步/更新操作
│   └── utils.sh                       # 工具函数
│
├── .github/                           # GitHub 集成
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
│
├── package.json                       # Node.js 项目信息（如有）
└── src/                               # 源代码目录（按项目类型调整）
```

---

## 四、核心文件内容设计

### 4.1 AGENTS.md — 项目宪法

AGENTS.md 是 AI Agent 的第一入口，必须精简（< 2KB），包含六大部分：

```markdown
# <项目名> Agent Instructions

## Mission
一句话描述项目角色和目标。

## Project Map
- `docs/`: 架构、运维、决策记录
- `.codex/memory/`: 持久记忆
- `.codex/agents/`: 子 Agent 角色
- `tasks/`: 任务管理
- `scripts/`: 确定性脚本

## Working Agreements
- 改代码前先读相关文件，不凭印象覆写
- 保持小而可审查的变更
- 更新 CHANGELOG.md
- 不修改任务范围外的文件

## Coding Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits

## Security
- 不读取 .env 或 credentials/
- 不执行 rm -rf 或 git reset --hard

## Verification
- Run `scripts/check.sh` before delivery
```

### 4.2 AGENTS.md 合并优先级

Codex 按如下优先级从低到高搜索并合并：

1. `~/.codex/AGENTS.md` — 全局用户级偏好（最低）
2. Git 仓库根目录 `AGENTS.md` — 项目级规范
3. 子目录 `AGENTS.md`（如 `frontend/AGENTS.md`）— 子模块级覆盖
4. `AGENTS.override.md` — 紧急覆盖（如发布冻结期）

合并规则是"叠加而非覆盖"：子目录只对冲突规则优先，非冲突规则全部保留。

### 4.3 .codex/config.toml — 核心配置

```toml
# 项目级 Codex 配置
[agents]
max_threads = 6          # 最大并行子 Agent 数
max_depth = 2            # 子 Agent 嵌套深度

[sandbox]
mode = "network-off"     # 沙箱模式：network-off / read-only / full

[model]
default = "o4-mini"      # 默认模型
reasoning = "high"       # 推理级别

# 信任 hooks 后取消注释
# [features]
# hooks = true
```

### 4.4 子 Agent 角色定义示例

`.codex/agents/reviewer.toml`：

```toml
name = "project_reviewer"
description = "审查者：聚焦正确性、安全、回归和缺失测试"
sandbox_mode = "read-only"
model = "o4-mini"

developer_instructions = """
Review like an owner.
Lead with concrete findings ordered by severity (P0 > P1 > P2 > P3).
Cite file paths and line numbers.
Avoid style-only comments unless they hide real risk.
Do not modify files.
"""
```

### 4.5 Hooks 事件模型

| 事件 | 触发时机 | 典型用途 |
|------|----------|----------|
| `SessionStart` | 会话启动/恢复 | 注入项目上下文 |
| `UserPromptSubmit` | 用户提交提示前 | 拦截/增强提示 |
| `PreToolUse` | 工具调用执行前 | 安全门控（deny 危险命令） |
| `PostToolUse` | 工具调用执行后 | 审计日志、触发后续动作 |
| `Stop` | Agent 决定停止时 | 阻止过早停止 |

设计原则：**Fail-open**（Hook 超时/崩溃不阻塞主流程）。

### 4.6 Rules — 硬约束 vs 软指导

| 类型 | 文件 | 性质 | 示例 |
|------|------|------|------|
| 软指导 | `AGENTS.md` | AI 应该怎么做 | "优先使用 pnpm" |
| 硬约束 | `.codex/rules/` | AI 能/不能做什么 | `deny: rm -rf *` |

---

## 五、常见目录语义参考

来自社区调研的目录命名共识（第二张图片内容）：

| 目录 | 默认语义 |
|------|----------|
| `app/` | 服务或工具主代码 |
| `services/` | 多服务仓里的服务代码单元 |
| `jobs/` | 批任务、定时任务、离线任务代码 |
| `common/` / `shared/` | 稳定共享层，不带单元私货 |
| `deploy/` | 部署脚本、服务模板、部署说明 |
| `docs/` | 源码文档常驻；交付 README 需按目标链路选择 |
| `delivery/` | 交给别人或交给部署机的包 |
| `dist/` | 构建直接产出，不一定长期保留 |
| `artifacts/` | 评测、实验、报告产物 |
| `models/` | 是否迁移取决于是否随项目交付 |
| `runtime/` | 项目内运行时或运行时安装器 |
| `wheelhouse/` | 离线依赖包 |
| `.runtime/` | 运行期环境，不应当成源码一部分 |
| `logs/` | 日志、失败样本、运行输出 |
| `data/` | 不默认进入部署交付；如需要应分流到 `datasets/` |
| `datasets/` | 训练、评测、构建数据，不默认进入部署 |
| `samples/` | 调试或验活样例，按项目需要决定 |

---

## 六、Profile 分层策略

根据项目类型选择不同的骨架 Profile：

| Profile | 适用场景 | 重点目录 |
|---------|----------|----------|
| `full` | 完整工程项目 | 所有目录 |
| `code` | 纯编码项目 | `scripts/`、`templates/pr`、`.github/`、`snippets/` |
| `knowledge` | 研究/文档项目 | `docs/`、`prompts/`、`templates/`、`.codex/memory/` |
| `agent` | Agent 开发项目 | `.codex/agents/`、`.codex/hooks/`、`.codex/rules/`、`.agents/skills/` |

---

## 七、与其他 AI 工具的兼容策略

### 7.1 多工具兼容矩阵

| 工具 | 入口文件 | 配置目录 | 兼容方式 |
|------|----------|----------|----------|
| OpenAI Codex | `AGENTS.md` | `.codex/` | 原生支持 |
| Claude Code | `CLAUDE.md` | `.claude/` | CLAUDE.md 引用 AGENTS.md |
| Cursor | `.cursorrules` | `.cursor/` | 规则文件引用 AGENTS.md |
| GitHub Copilot | `copilot-instructions.md` | `.github/` | 内容同步 |
| Windsurf | `.windsurfrules` | — | 内容同步 |

### 7.2 推荐兼容方案

在项目根目录同时维护：

```markdown
# CLAUDE.md
<!-- 引用 AGENTS.md 作为主要指令源 -->
Read and follow AGENTS.md for all project conventions.
Additional Claude-specific instructions below:
...
```

AGENTS.md 正朝着**开放标准**发展（由 OpenAI、Amp、Google Jules、Cursor、Factory 等协作推动），建议以 AGENTS.md 为主，其他工具配置文件引用它。

---

## 八、知识工程与持续改进

### 8.1 知识飞轮

```
犯错 → 识别模式 → 固化为规则 → 写入 lessons.md / rules → 永不再犯
```

每次 Agent 做出错误假设时才添加规则，从最小开始，持续收紧。

### 8.2 Sprint 回顾

每个 Sprint 审查 AGENTS.md 内容，防止过时。推荐流程：

1. 创建初始骨架
2. 运行 Agent 执行任务
3. 发现异常行为
4. 补充指令/规则
5. PR Review 合并
6. 重测验证

### 8.3 会话连续性

通过 `.codex/memory/daily/` 实现跨会话断点续传：

- 每次会话结束前，Agent 将当前状态写入 `daily/YYYY-MM-DD.md`
- 下次会话启动时，Hook 自动加载最近的 daily 笔记
- 长期有效的信息提升到 `project.md` 或 `decisions.md`

---

## 九、与现有 Skill 的差异与改进建议

### 9.1 现有 skill 已覆盖的部分

- 基本目录结构（AGENTS.md、docs、tasks、prompts、templates、scripts）
- Profile 分层（full/code/knowledge/agent）
- 子 Agent 角色定义（explorer/implementer/reviewer/docs-researcher）
- Hook 示例（session_start/stop_summary/pre_tool_use_policy）
- Rules 模板
- 生成脚本（Python，支持 dry-run/force/init-git）

### 9.2 建议新增的部分

| 新增项 | 理由 |
|--------|------|
| `CLAUDE.md` 兼容文件 | 跨工具兼容，Claude Code 用户量大 |
| `.codex/mcp.json` | MCP 工具集成是 Layer 3 的核心 |
| `.codex/skills/` 目录 | 区别于 `.agents/skills/`，Codex 原生技能模板 |
| `post_tool_use_audit.py` Hook | 审计日志，可观测性 |
| `test-writer.toml` 子 Agent | 测试编写是高频场景 |
| `snippets/` 目录 | 代码片段库（图一中的设计） |
| `debug.md` 提示词 | 调试是高频场景 |
| `AGENTS.override.md` 说明 | 运维模式切换（发布冻结期） |
| 文件大小限制建议 | 防止上下文污染 |
| 常见目录语义参考 | 帮助用户选择正确的目录名 |

### 9.3 建议优化的部分

| 优化项 | 当前状态 | 建议 |
|--------|----------|------|
| AGENTS.md 内容 | 偏长，包含 Project Map | 精简到 < 2KB，Project Map 移到 docs/INDEX.md |
| config.toml | 只有 agents 配置 | 增加 sandbox、model、features 配置 |
| 任务管理 | 纯 Markdown | 可选支持 JSON 格式（feature-list.json 兼容） |
| 验证脚本 | 占位符 | 提供按技术栈的模板（Node/Python/Go） |

---

## 十、实施路径建议

### Phase 1：增强现有 Skill

1. 新增 `CLAUDE.md` 生成（引用 AGENTS.md）
2. 新增 `.codex/mcp.json` 模板
3. 新增 `snippets/` 目录
4. 优化 AGENTS.md 内容（精简 + 大小限制提示）
5. 增加 `test-writer.toml` 子 Agent

### Phase 2：跨工具兼容

1. 支持生成 `.cursorrules`（引用 AGENTS.md）
2. 支持生成 `copilot-instructions.md`
3. 增加 `--compat` 参数选择兼容哪些工具

### Phase 3：深度集成

1. 支持 `--tech-stack` 参数（node/python/go/java）自动填充 check.sh
2. 支持 `--harness` 参数生成完整 Harness 三件套（feature-list.json、progress.txt、init.sh）
3. 支持 `--monorepo` 参数生成子目录 AGENTS.md

---

## 十一、参考资料

### 外部资料

- [OpenAI Codex AGENTS.md 指南](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex Hooks 指南](https://developers.openai.com/codex/hooks)
- [OpenAI Codex Subagents 指南](https://developers.openai.com/codex/subagents)
- [OpenAI Codex Rules 指南](https://developers.openai.com/codex/rules)
- Daniel Vaughan: Codex CLI 五层定制架构

### 内部资料（学城）

- [OpenCode vs Claude Code vs Codex 深度对比](https://km.sankuai.com/collabpage/2759928687)
- [MDP-Context 使用文档（AGENTS.md 规范）](https://km.sankuai.com/collabpage/2741183128)
- [Harness Engineering 系统实践](https://km.sankuai.com/collabpage/2754132872)
- [Agent Harness Engineering — Addy Osmani](https://km.sankuai.com/collabpage/2761525985)
- [Context Engineering 学习指南](https://km.sankuai.com/collabpage/2755869314)
- [AI 编码 Agent 框架对比：GSD vs Superpowers](https://km.sankuai.com/collabpage/2757763362)
- [AI Coding 最佳实践](https://km.sankuai.com/collabpage/2725504379)
- [Harness Engineering 到底是什么](https://km.sankuai.com/collabpage/2757277087)
- [关于 Harness Engineering 的讨论与思考](https://km.sankuai.com/collabpage/2756920223)
- [上下文工程：AI Agent 开发的下一个核心范式](https://km.sankuai.com/collabpage/2760731381)
