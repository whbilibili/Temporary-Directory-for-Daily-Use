# AGENTS.md

Plant Care Reminder 的全局导航索引。先读本文件，再按顺序加载其他文档。

## 启动工作流

1. 读本文件，确认当前任务目标。
2. 读 [ARCHITECTURE.md](/Users/wanghong/Projects/日常临时目录/projects/plant-care-reminder/ARCHITECTURE.md) 了解红线和分层约束。
3. 读 [docs/SECURITY.md](/Users/wanghong/Projects/日常临时目录/projects/plant-care-reminder/docs/SECURITY.md) 和 [docs/DESIGN.md](/Users/wanghong/Projects/日常临时目录/projects/plant-care-reminder/docs/DESIGN.md)。
4. 读 [docs/caveats.md](/Users/wanghong/Projects/日常临时目录/projects/plant-care-reminder/docs/caveats.md)。
5. 读 [docs/exec-plans/feature-list.json](/Users/wanghong/Projects/日常临时目录/projects/plant-care-reminder/docs/exec-plans/feature-list.json) 定位模块与 Task。
6. 只加载当前 Task 所属模块文件，不要全量扫描其余模块。
7. 最后才读 `metadata.files_affected` 指向的源码文件。

## 上下文加载顺序（Coding Worker 启动时严格遵守）

| 优先级 | 文件 | 作用 | 最大行数 |
|--------|------|------|---------|
| 1 | `AGENTS.md` | 导航地图 | ≤100 行 |
| 2 | `ARCHITECTURE.md` | 架构约束全集 | 无限制 |
| 3 | `docs/SECURITY.md` | 安全红线 | 无限制 |
| 4 | `docs/DESIGN.md` | 设计语言约定 | 无限制 |
| 5 | `docs/caveats.md` | 已知陷阱 | 无限制 |
| 6 | `docs/exec-plans/feature-list.json` | 全局模块索引 | ≤200 行 |
| 6.1 | `docs/exec-plans/modules/[module].json` | 当前 Task 契约 | 按需 |
| 7 | `docs/exec-plans/active/[task]/plan.md` | 并行工作区计划 | 按需 |
| 8 | `metadata.files_affected` 对应源码 | 最后才读源码 | 按需 |

## 文档索引

| 文件 | 职责 |
|------|------|
| `ARCHITECTURE.md` | 架构、分层、数据层、设计系统约束 |
| `PLANS.md` | 里程碑与长期规划 |
| `docs/product-specs/` | 需求与功能规格 |
| `docs/design-docs/` | 技术方案、moodboard、设计理念 |
| `docs/exec-plans/feature-list.json` | 全局任务状态机（模块化索引） |
| `docs/exec-plans/modules/*.json` | 模块级任务契约 |
| `docs/exec-plans/progress.txt` | 会话交接棒 |
| `docs/exec-plans/issues.json` | Bug 池 |
| `docs/exec-plans/tech-debt-tracker.md` | 技术债 |
| `docs/RELIABILITY.md` / `docs/SECURITY.md` / `docs/DESIGN.md` | 可靠性、安全、设计红线 |

## 架构红线

- 客户端组件禁止直接操作 Convex 管理端能力；业务写操作必须走 Convex functions。
- 所有数据实体必须以 `familyId` 做隔离，禁止跨家庭读写。
- `app/` 是代码工作区，本次 harness 改造之外的目录已重构，后续新增代码不要散落到根目录。

## 验证命令

- 自动断言：`cd app && npm run typecheck && npm run test`
- 数据层验证：`cd app && npx convex dev --once --typecheck enable`
- 视觉验证：在 iPhone 尺寸下检查植物列表、待办页、任务完成路径

## DoD

- TypeScript 编译无 error
- Convex schema 可通过类型检查
- 当前 Task 的 API / mutation / query 可调通
- 关键页面在 375px 宽度下可用
- 关联文档与 feature-list 状态已更新

## 会话结束 Checklist

- 更新 `docs/exec-plans/progress.txt`
- 更新对应模块 Task 状态
- 新坑写入 `docs/caveats.md`
- 新约束补进 `ARCHITECTURE.md`
- 如有视觉变更，检查 `docs/DESIGN.md` 是否需要补充
