# 个人 AI 辅助全栈开发工作流 · 技能组合手册

个人 AI 辅助全栈开发工作流 · 技能组合手册

## 背景与目标

本文档面向**一个人借助 AI 完成前后端分离或全栈项目开发**的场景，将 CatDesk 中所有可用技能按开发阶段拆分成「技能组合包」，形成一套从需求到上线的完整闭环工作流。

文档由 CatDesk AI 自动整理生成，基于当前已安装的 65+ 个技能盘点而来。

---

## 总览：12 个阶段 × 技能组合包

整体流程：**需求设计 → 边界定义 → 项目初始化 → 前端 UI 设计 → 前端开发 → 后端开发 → 前后端对接 → 代码审查 → 自动化测试 → CI/CD → 问题修复 → 文档维护**

---

## Phase 1 · 需求设计

**目标**：把模糊想法变成可执行的规格说明，并从战略层面验证方向。

核心技能：`spec-driven-development`（写规格）、`plan-ceo-review`（战略校验）、`architecture-blueprint-generator`（分析现有架构）、`km-search`（调研）

工作流：想法/PRD → km-search 调研 → spec-driven-development 写规格 → plan-ceo-review 战略校验 → 确认 spec.md

**输出物**：spec.md（功能规格说明书）

---

## Phase 2 · 前后端边界定义

**目标**：把 spec 拆成前端/后端/协作三类，生成双方认可的契约文档。

核心技能：`fullstack-boundary-contract`（核心主力）、`architecture-patterns`（架构模式选型）、`mermaid-tools` / `drawio-generator`（可视化）

工作流：spec.md → fullstack-boundary-contract 边界分析 → boundary-contract.md + fe-tasks.md + be-tasks.md → mermaid-tools 生成架构图

**输出物**：boundary-contract.md、fe-tasks.md、be-tasks.md、架构图

---

## Phase 3 · 任务拆解 & 项目初始化

**目标**：把任务清单落地为可追踪的项目结构，搭建 AI 友好的工程骨架。

核心技能：`harness-init`（CLAUDE.md + docs/）、`agent-folder-init`（.agents/ 目录）、`harness-engineering-playbook`（AGENTS.md/PLANS.md）、`karpathy-coding-guidelines`（可验证成功标准）

**输出物**：CLAUDE.md、AGENTS.md、PLANS.md、.agents/ 目录

---

## Phase 4 · 前端 UI 设计

**目标**：在写代码前先确定视觉风格和组件规范，避免边做边改。

核心技能：`ui-ux-pro-max`（设计系统）、`frontend-design`（页面/组件代码）、`web-artifacts-builder`（复杂交互原型）、`sleek-design-mobile-apps`（移动端 UI 原型，新增）

**输出物**：设计系统文档、组件原型代码

---

## Phase 5 · 前端开发

**目标**：按任务清单高质量实现前端功能。

核心技能：`vercel-react-best-practices`（性能规范）、`typescript-advanced-types`（类型安全）、`frontend-design`（UI 组件迭代）、`webapp-testing`（实时验证 UI）、`karpathy-coding-guidelines`（最小代码原则）

---

## Phase 6 · 后端开发

**目标**：按任务清单高质量实现后端 API 和业务逻辑。

核心技能：`nodejs-backend-patterns`（生产级实现）、`backend-development`（API 设计 + DB schema）、`architecture-patterns`（Clean Architecture / DDD）、`typescript-advanced-types`（类型安全）、`database-migration`（数据库迁移，新增）

`database-migration` 支持 Sequelize/TypeORM/Prisma 三大 ORM，含零停机部署策略（蓝绿部署）和事务回滚方案。

---

## Phase 7 · 前后端对接

**目标**：前后端联调，生成交接文档，消除接口歧义。

核心技能：`backend-to-frontend-handoff-docs`（API 交接文档）、`papi-mock-generator`（PAPI Mock 数据，新增）、`contract-testing`（契约测试，新增）、`playwright`（联调验证）

`papi-mock-generator` 读取 PAPI 接口文档，自动生成正常/边界/错误三种场景的 Mock JSON，前端可在后端未完成时提前联调。`contract-testing` 基于 Pact 框架，在 CI 中阻断破坏性接口变更。

**输出物**：API 交接文档、Mock 数据、契约测试文件、联调验证报告

---

## Phase 8 · 代码审查

**目标**：提交前做全面代码质量检查，按优先级分级处理问题。

核心技能：`code-reviewer`（前端深度审查，P0/P1/P2 分级）、`frontend-code-reviewer`（Git diff 扫描）、`pr-code-review`（多语言后端审查）、`receiving-code-review`（技术严谨性验证）

工作流：提交前 → frontend-code-reviewer → code-reviewer → pr-code-review → receiving-code-review → 修复 P0/P1 后合并

---

## Phase 9 · 自动化测试

**目标**：建立测试体系，覆盖单元/集成/E2E/契约四层。

核心技能：`testing-strategies`（测试策略设计）、`playwright`（E2E 测试）、`webapp-testing`（本地验证）、`contract-testing`（契约测试，新增）

---

## Phase 10 · CI/CD

**目标**：自动化构建、测试、部署流水线。

核心技能：`building-ci-pipelines`（GitHub Actions / GitLab CI）、`vercel`（前端部署）、`harness-engineering-playbook`（确定性 harness 命令）、`monitoring-observability`（监控告警，新增）

`monitoring-observability` 基于 Prometheus + Grafana，内置 Golden Signals 告警规则（错误率 > 5%、P95 响应时间 > 1s、内存使用 > 90%）和 Winston 结构化日志。

**输出物**：.github/workflows/*.yml、Vercel 部署配置、Prometheus 告警规则

---

## Phase 11 · 问题修复

**目标**：线上问题快速定位、最小化修复、验证。

核心技能：`monitoring-observability`（Grafana 定位根因，新增）、`playwright`（复现问题）、`karpathy-coding-guidelines`（外科手术式修复）、`webapp-testing`（验证修复）、`self-improving-agent`（提取 bug 模式）

---

## Phase 12 · 文档维护

**目标**：代码变更后同步更新所有相关文档，保持文档与代码一致。

核心技能：`fe-update-docs`（AGENTS.md/ARCHITECTURE.md/tech-debt.md）、`update-docs`（Next.js MDX 文档）、`architecture-blueprint-generator`（架构蓝图）、`mermaid-tools` / `drawio-generator`（架构图更新）

---

## 完整技能组合包速查表

| 阶段 | 核心技能 | 辅助技能 |
| --- | --- | --- |
| 需求设计 | spec-driven-development | plan-ceo-review、km-search |
| 边界定义 | fullstack-boundary-contract | architecture-patterns、mermaid-tools |
| 项目初始化 | harness-init | agent-folder-init、harness-engineering-playbook |
| 前端 UI 设计 | ui-ux-pro-max + frontend-design | web-artifacts-builder、sleek-design-mobile-apps ★ |
| 前端开发 | vercel-react-best-practices | typescript-advanced-types、webapp-testing |
| 后端开发 | nodejs-backend-patterns + backend-development | architecture-patterns、database-migration ★ |
| 前后端对接 | backend-to-frontend-handoff-docs | papi-mock-generator ★、contract-testing ★、playwright |
| 代码审查 | code-reviewer + pr-code-review | frontend-code-reviewer、receiving-code-review |
| 自动化测试 | testing-strategies + playwright | contract-testing ★、webapp-testing |
| CI/CD | building-ci-pipelines + vercel | harness-engineering-playbook、monitoring-observability ★ |
| 问题修复 | karpathy-coding-guidelines | playwright、monitoring-observability ★、self-improving-agent |
| 文档维护 | fe-update-docs | update-docs、architecture-blueprint-generator |

★ 标注为本次新安装的技能

---

## 本次新安装的 5 个补充技能

**database-migration**（wshobson/agents，9523 次安装）：跨 ORM 数据库迁移，支持 Sequelize/TypeORM/Prisma，含零停机部署策略和回滚方案。→ Phase 6

**monitoring-observability**（美团 Skill 市场 #2664）：Prometheus + Grafana 监控，Golden Signals 告警规则，Winston 结构化日志。→ Phase 10、11

**papi-mock-generator**（美团 Skill 市场 #10575）：PAPI 接口 Mock 数据生成器，自动生成正常/边界/错误三种场景 Mock JSON。→ Phase 7

**contract-testing**（proffesor-for-testing/agentic-qe）：Pact 消费者驱动契约测试，CI 中阻断破坏性接口变更，含 Breaking Change 检测。→ Phase 7、9

**sleek-design-mobile-apps**（sleekdotdesign/agent-skills，53610 次安装）：AI 驱动移动端 App 设计，通过 Sleek API 生成 UI 原型并截图，支持导出 HTML 代码作为 React Native 实现参考。→ Phase 4

---

## 横切关注点（贯穿全程）

`karpathy-coding-guidelines` 是编码全程的行为准则，每次写代码前都应该激活。`self-improving-agent` + `self-improvement` 是持续学习机制，每次犯错都要沉淀。`harness-engineering-guide` 是 Agent 行为治理的总纲，确保 AI 在整个项目中不跑偏。

---

最后更新：2026-04-17 | 技能总数：65+