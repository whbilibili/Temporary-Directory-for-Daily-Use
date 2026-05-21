# Harness Engineering v2.1 — 项目架构使用说明

> 适用范围：所有采用 Harness Engineering 工程规范的项目（前端 / 后端 / 全栈）
> 文档维护人：架构师 / Tech Lead
> 最后更新：2025-04（v2.1.0 — active/ 语义重新定义：串行默认 + 并行按需）

---

### 一、什么是 Harness Engineering

Harness Engineering 是一套「AI Agent 优先」的工程规范，其核心思想是：**让每一个 AI Coding Session 都能在没有人类口头交代的情况下，从磁盘上的文档基准独立还原现场、锁定目标、完成任务、干净退出。**

它由三个核心设计原则支撑：

1. **无状态可重入**：任何 Session 都可以在任意时刻崩溃重启，不依赖上下文记忆，只依赖本地文件。
2. **文档即单一真相（Single Source of Truth）**：任务状态、架构约束、踩坑记录，全部以文件形式持久化在 Git 中，而非存储在对话记忆里。
3. **最小熵增**：每次 Session 只做一件事，只改声明过的文件，完成后立刻提交存档，不留中间状态。

---

### 二、项目文件骨架

```text
// 代码块
项目根目录/
│
├── AGENTS.md                           ← 路由入口，≤100 行，只做导航
├── ARCHITECTURE.md                     ← 系统地图，域和包分层，架构约束全集
├── PLANS.md                            ← 项目里程碑 & 长期规划
│
└── docs/
    │
    ├── exec-plans/                     ← 所有「执行状态」统一在这里
    │   ├── feature-list.json           ← 任务状态机（核心三件套之一）
    │   ├── progress.txt                ← 会话交接棒（核心三件套之一）
    │   ├── issues.json                 ← Bug 池
    │   ├── tech-debt-tracker.md        ← 技术债追踪
    │   ├── active/                     ← 串行时为空；并行按需启用（见 4.7 节）
    │   │   └── [task-name]/            ← 仅并行模式才创建
    │   │       ├── plan.md             ← 独立执行计划
    │   │       ├── progress.txt        ← 独立交接棒
    │   │       └── notes.md            ← 可选：临时笔记
    │   └── completed/                  ← 已归档的执行计划
    │       └── [task-name].YYYY-MM-DD.md
    │
    ├── design-docs/                    ← 设计文档库
    │   ├── index.md                    ← 设计文档目录索引
    │   └── core-beliefs.md             ← 核心设计理念
    │
    ├── product-specs/                  ← 产品规格库
    │   ├── index.md                    ← 产品规格目录
    │   └── [feature-name].md           ← 每个功能的产品规格
    │
    ├── generated/                      ← 自动生成物（只读）
    │   └── db-schema.md                ← 数据库 Schema 快照等
    │
    ├── references/                     ← 外部参考材料（只读）
    │   ├── design-system-llms.txt
    │   └── [framework]-llms.txt
    │
    ├── CHANGELOG/                      ← 会话 & 迭代摘要
    │   └── CHANGELOG-YYYY-MM-DD.md
    │
    ├── caveats.md                      ← 踩坑永久档案，只增不减
    ├── DESIGN.md                       ← 设计语言约定
    ├── FRONTEND.md                     ← 前端规范（前端项目专有）
    ├── QUALITY_SCORE.md                ← 质量评分面板
    ├── RELIABILITY.md                  ← 可靠性 & SLO 约定
    ├── SECURITY.md                     ← 安全约束，P0 红线零容忍
    └── PRODUCT_SENSE.md                ← 产品感知 & 用户价值
```

---

### 三、文件职责总表

#### 根目录（极简，只有 3 个文件）

| 文件 | 职责 | 填充时机 | 体积约束 |
| --- | --- | --- | --- |
| AGENTS.md | 导航地图，所有文件的路由入口 | 架构师初稿，Coding Worker 禁止大改 | ≤100 行 |
| ARCHITECTURE.md | 域和包分层，架构约束全集，安全红线 | 架构师初稿，持续追加 | 无硬限 |
| PLANS.md | 项目里程碑 & 长期规划 | 架构师，iteration-close 提示更新 | 无硬限 |

#### docs/exec-plans/（所有执行状态）

| 文件 | 职责 | 填充时机 |
| --- | --- | --- |
| feature-list.json | 任务状态机（核心） | 架构师规划，Coding Worker 更新状态 |
| progress.txt | 会话交接棒（≤200 行） | session-handoff 维护 |
| issues.json | Bug 池 | issue-triage 维护 |
| active/[name]/plan.md | 并行任务独立执行计划（串行时不创建） | 仅并行模式由架构师创建，各自维护独立 progress.txt |
| active/[name]/notes.md | 任务临时笔记（可选） | Worker 随时写入 |
| completed/ | 已归档的执行计划 | iteration-close 从 active/ 移入 |
| tech-debt-tracker.md | 技术债追踪 | 人工 + issue-triage |

#### docs/（知识库根）

| 文件 | 职责 | 填充时机 |
| --- | --- | --- |
| caveats.md | 踩坑永久档案，只增不减 | session-handoff / iteration-close / issue-triage |
| DESIGN.md | 设计语言约定 | frontend-architect，设计变更时更新 |
| FRONTEND.md | 前端规范（框架选型、编码规范入口） | frontend-architect，前端项目专有 |
| QUALITY_SCORE.md | 质量评分面板 | coding-reviewer 自动填充 |
| RELIABILITY.md | 可靠性 & SLO 约定 | 上线前架构师填充，事故后追加 |
| SECURITY.md | 安全约束，P0 红线零容忍 | 架构师初始化，issue-triage 追加 |
| PRODUCT_SENSE.md | 产品感知 & 用户价值 | 产品架构师填充 |
| CHANGELOG/ | 会话 & 迭代摘要 | session-handoff / iteration-close |

#### docs/design-docs/ 和 docs/product-specs/

| 文件 | 职责 |
| --- | --- |
| design-docs/index.md | 设计文档目录，列出所有 design-docs 的标题和链接 |
| design-docs/core-beliefs.md | 团队核心设计理念，影响所有技术决策的底层价值观 |
| product-specs/index.md | 产品规格目录 |
| product-specs/[feature].md | 每个功能的产品规格文档 |

**docs/generated/ 和 docs/references/**：自动生成物（db-schema、API 快照等）和外部参考材料（llms.txt 格式的设计系统文档等），Coding Worker **只读不改**。

---

### 四、核心文件职责详解

#### 4.1 AGENTS.md — AI 导航地图

**职责**：告诉 AI Agent「这个项目有什么文件，去哪里找什么信息」。是 AI 读取的第一个文件，相当于整个工程的 README for Agents。

**包含内容**：文件索引表格、架构约束红线快速索引、已知 Dead End 快速索引、常用命令速查。

**体积约束**：严格控制在 **100 行以内**，只放「路标」，不放详细内容。

**更新角色**：架构师（初始化）+ Coding Worker（增量追加）

**更新时机**：初始化时由架构师生成；每次 Coding Session 结束时，如果新增了目录/模块/架构约束/Dead End，Coding Worker 做外科手术式追加。

**禁止行为**：不允许 AI 重写全文；不允许堆砌内容导致超过 100 行。

#### 4.2 ARCHITECTURE.md — 架构约束全集

**职责**：定义项目的技术红线和架构边界，任何 Agent 在编码前必须对照它做校验。违反即停止。

**包含内容**：域和包分层约束（Controller/Service/DAO 边界）、模块间调用规范、标识体系规范、安全红线、已废弃方案列表、命名约定。

**更新角色**：架构师 / Tech Lead（唯一写入者）

**更新时机**：项目初始化时建立；每次引入新的架构决策时由人工更新；Coding Worker 不允许修改此文件，只能读取。

**禁止行为**：Coding Worker 不得修改；不得将「建议」写成「强制」，混淆 Agent 的执行优先级。

#### 4.3 PLANS.md — 项目里程碑与长期规划

**职责**：记录项目的阶段性里程碑、长期规划方向和迭代目标，供架构师和 Tech Lead 对齐大方向。

**与 feature-list.json 的区别**：feature-list.json 是「当前迭代的任务状态机」（细粒度、可执行）；PLANS.md 是「项目级里程碑地图」（粗粒度、战略性）。

**更新角色**：架构师（初始化 + 迭代结项时更新）；`iteration-close` 技能运行后会提示更新。

#### 4.4 docs/exec-plans/feature-list.json — 任务清单

**职责**：项目所有任务的结构化清单，每个 Task 包含：任务描述、验收标准、影响文件、接口契约、验证命令、当前状态。

**Task 状态流转**：`pending` → `in_progress` → `completed` / `failed` / `blocked`

**关键字段说明**：`task_id`（唯一标识）、`status`（当前状态）、`acceptance_criteria`（可量化验收标准，Coding Worker 完成任务的唯一判据）、`metadata.files_affected`（允许修改的文件列表）、`verification.auto`（自动化验证命令）、`plan_path`（可选，指向 `docs/exec-plans/active/[task-name]/plan.md`）。

```json
// 代码块
{
  "task_id": "TASK-003",
  "title": "实现用户登录接口",
  "status": "pending",
  "description": "实现 POST /api/auth/login，校验账号密码，返回 JWT",
  "acceptance_criteria": [
    "正确账号密码返回 200 + token",
    "错误密码返回 401",
    "账号不存在返回 404"
  ],
  "metadata": {
    "files_affected": ["src/controller/AuthController.java", "src/service/AuthService.java"]
  },
  "verification": {
    "auto": "./scripts/verify-task003.sh"
  },
  "plan_path": "docs/exec-plans/active/auth-module/plan.md"
}
```

**更新角色**：架构师（创建 / 追加 Task）+ Coding Worker（更新 status 和 completed_at）

**禁止行为**：Coding Worker 不得新增 Task；不得跳过状态流转（如直接 pending→completed）。

#### 4.5 docs/exec-plans/progress.txt — 会话交接棒

**职责**：跨 Session 的纯文本交接棒，由 `session-handoff` 技能负责维护。记录「上一个 Session 做了什么、遇到了什么问题、下一个 Session 从哪里接」。

**包含区块**：`[Session Log]`（每次完成后的简报）和 `[Dead Ends]`（已知陷阱/失败路径/尸检报告，永久保留，不允许删除）。

```text
// 代码块
[Session Log]
2025-04-18 | TASK-002 已完成，实现了商品列表查询接口，分页正常 | 下一步: TASK-003
2025-04-17 | TASK-001 已完成，初始化项目骨架，init.sh 可正常运行 | 下一步: TASK-002

[Dead Ends]
- TASK-003: JWT 签名用了 HS256，但测试环境没有配置密钥环境变量，导致启动报 NPE。
  解决方案：确保 init.sh 中有 JWT_SECRET 环境变量检查。
```

**长度控制**：≤200 行。超出后由 `session-handoff` / `iteration-close` 将旧记录归档到 `docs/exec-plans/completed/`。

#### 4.6 docs/exec-plans/issues.json — Bug 池

**职责**：结构化的缺陷记录池，由 `issue-triage` 技能负责写入和维护。每个 Issue 包含：缺陷描述、根因分析、优先级、状态、关联 Task。技术债相关的系统性问题同步更新 `tech-debt-tracker.md`。

**更新角色**：`issue-triage` 技能（写入）+ 架构师（排期确认）

#### 4.7 docs/exec-plans/active/ — 串行默认为空，并行按需启用

`active/` 目录的语义在 v2.1 中重新定义。**串行开发（默认模式）** 时，所有任务共享全局 `feature-list.json` 和 `progress.txt`，`active/` 目录保持为空，`plan_path` = null。**并行开发（按需启用）** 时，每个并行任务在 `active/[task-name]/` 下拥有独立的 `plan.md`、`progress.txt`、`notes.md`，互不干扰。

**并行模式触发规则**（满足任一即可启用）：① 2 个以上任务的 `files_affected` 无交集，可以安全并行；② 用户明确要求多会话 / 多 worktree 并行开发；③ 任务之间有清晰的模块边界（如前端 + 后端独立开发）。

**更新角色**：架构师决定是否启用并行并创建 `active/[task-name]/` 目录；Worker 在并行模式下只读写自己任务目录下的 `progress.txt` 和 `notes.md`，不触碰全局 `progress.txt`。串行模式下，Worker 完全不使用 `active/` 目录。

#### 4.8 docs/exec-plans/completed/ — 已归档的执行计划

迭代结项后，`iteration-close` 技能将 `active/` 中已完成的任务目录移入此处存档，文件名格式为 `[task-name].YYYY-MM-DD.md`。Coding Worker 不得直接操作此目录，存档后不得修改。

#### 4.9 docs/exec-plans/tech-debt-tracker.md — 技术债追踪

**职责**：跨迭代的技术债记录，按优先级管理待偿还的技术欠债（如裸 catch、硬编码配置、缺少索引等）。与 issues.json 的区别：issues.json 是功能性缺陷（Bug）；tech-debt-tracker.md 是「代码能跑但质量需要日后偿还」的系统性欠债。

**更新角色**：人工 + `issue-triage` 技能。迭代启动前架构师评估是否安排偿还。

#### 4.10 docs/caveats.md — 踩坑永久档案

**职责**：跨迭代的全局踩坑记录库，**只增不减**。防止不同 Session、不同 Agent 重复踩同一个坑。

**与 progress.txt Dead Ends 的区别**：progress.txt Dead Ends 是任务粒度的临时记录；caveats.md 是模块/系统粒度的长期存档。

**更新角色**：多技能协作——`session-handoff`、`iteration-close`、`issue-triage` 均可写入；Coding Worker 发现新坑时直接追加。

#### 4.11 docs/SECURITY.md / RELIABILITY.md / QUALITY_SCORE.md

这三个文件是专项的约束与评分文档，Coding Worker 在涉及相关领域时需要读取：

- **SECURITY.md**：安全约束，P0 红线零容忍。由架构师初始化，`issue-triage` 发现安全问题时追加。
- **RELIABILITY.md**：可靠性 & SLO 约定。上线前由架构师填充，发生事故后追加。
- **QUALITY_SCORE.md**：质量评分面板，由 `coding-reviewer` 技能自动填充，记录代码质量得分趋势。

---

### 五、角色职责矩阵

| 文件 | 架构师 / Tech Lead | Coding Worker（AI） | 维护技能 | 备注 |
| --- | --- | --- | --- | --- |
| AGENTS.md | 初始化 + 重大重构时更新 | 外科手术式追加（新目录/约束/Dead End） | — | 不允许 AI 重写全文，≤100 行 |
| ARCHITECTURE.md | 唯一写入者 | 只读 | — | AI 违反红线时必须停止 |
| PLANS.md | 初始化 + 迭代结项后更新 | 只读 | iteration-close | — |
| feature-list.json | 创建 / 追加 Task | 更新 Task status | — | AI 不得新增 Task |
| progress.txt | 定期归档 | 禁止修改历史记录 | session-handoff | ≤200 行 |
| issues.json | 排期确认 | 只读 | issue-triage | — |
| active/[name]/plan.md | 创建（复杂任务） | 只读 | — | 简单任务不强制创建 |
| active/[name]/notes.md | — | 随时写入 | — | 临时笔记，可清理 |
| completed/ | — | 禁止操作 | iteration-close | 只归档，不修改 |
| tech-debt-tracker.md | 评估排期 | 只读 | issue-triage | — |
| docs/caveats.md | 定期提炼归档 | 发现新坑时追加 | session-handoff / iteration-close / issue-triage | 只增不减 |
| SECURITY.md | 唯一写入者 | 只读 | issue-triage 追加 | P0 红线 |
| RELIABILITY.md | 唯一写入者 | 只读 | — | 事故后追加 |
| QUALITY_SCORE.md | 只读 | 只读 | coding-reviewer | 自动填充 |
| DESIGN.md / FRONTEND.md | 设计变更时更新 | 只读 | frontend-architect | 前端项目专有 |
| PRODUCT_SENSE.md | 产品架构师填充 | 只读 | — | — |
| CHANGELOG/ | — | — | session-handoff / iteration-close | 自动生成 |
| docs/generated/ | — | 只读 | 自动生成 | 禁止手动修改 |
| docs/references/ | 初始化 | 只读 | — | — |

---

### 六、Coding Worker 上下文加载优先级

Coding Worker 在每次 Session 启动时，按以下优先级顺序加载上下文，找到足够信息后立即停止，不继续向下扫描：

```text
// 代码块
优先级 1  AGENTS.md                                    — 导航地图，告诉你去哪里找什么（≤100 行）
优先级 2  ARCHITECTURE.md                              — 架构约束全集，红线不得违反
优先级 3  docs/caveats.md                              — 已知陷阱，避免重蹈覆辙
优先级 4  SECURITY.md                                  — 安全红线（涉及安全相关任务时）
优先级 5  feature-list.json 当前 Task 的 contracts    — 本次任务的契约
优先级 6  plan_path 指向的 plan.md（如存在）            — 任务级详细执行计划
优先级 7  metadata.files_affected 列出的具体文件        — 最后才读源码
```

如果在优先级 1-2 就能定位所有信息，不要主动读取优先级 7 的源码文件。每次多读一个无关文件，就是给本次 Session 增加一份幻觉风险。

---

### 七、迭代启动 SOP（架构师视角）

1. 根据产品需求，运行 `backend-architect`  或 `frontend-architect` Skill，生成 feature-list.json 初稿。
2. Review 生成的 Task，补充 `acceptance_criteria` 和 `verification` 命令（这是 Coding Worker 判断任务完成的唯一标准）。
3. 对复杂 Task（3+ 个文件、跨模块调用），在 `docs/exec-plans/active/[task-name]/` 下创建 plan.md，并在 feature-list.json 的对应 Task 中填写 `plan_path`。
4. 确保 `init.sh` 包含了所有新增的环境依赖检查项。
5. 如果有新的架构决策，更新 `ARCHITECTURE.md`；如果有安全相关变更，更新 `SECURITY.md`。
6. 更新 `PLANS.md` 中的当前迭代目标。
7. 告知 Coding Worker：「请开始执行」。

---

### 八、迭代结项 SOP（iteration-close 技能）

`iteration-close` 技能会自动执行以下操作：

1. 将 `docs/exec-plans/active/` 中已完成的任务目录移入 `docs/exec-plans/completed/`，文件名加日期后缀。
2. 清理 `progress.txt`，将旧 Session Log 归档，保持 ≤200 行。
3. 提示架构师更新 `PLANS.md` 中的里程碑进度。
4. 生成本次迭代的 `docs/CHANGELOG/CHANGELOG-YYYY-MM-DD.md`。

---

### 九、常见问题

**Q：PLANS.md 和 feature-list.json 有什么区别？**

A：PLANS.md 是战略层面的里程碑地图（如「Q2 完成核心交易链路」），粒度粗，面向人类决策；feature-list.json 是战术层面的任务状态机（如「TASK-003：实现登录接口」），粒度细，面向 AI 执行。

**Q：active/ 下的 notes.md 和 plan.md 有什么区别？**

A：plan.md 是任务启动前架构师写的「执行计划」，相对稳定；notes.md 是 Worker 在执行过程中的「临时笔记」，可以记录中间状态、调试思路、待确认问题，Session 结束后可以清理。

**Q：progress.txt 越来越长怎么办？**

A：progress.txt 上限是 200 行。`session-handoff` 或 `iteration-close` 技能会自动将旧的 Session Log 归档到 `docs/exec-plans/completed/`，只保留最近若干条 Session Log 和全部 Dead Ends。

**Q：tech-debt-tracker.md 和 issues.json 有什么区别？**

A：issues.json 是缺陷（Bug）池，记录具体的功能问题；tech-debt-tracker.md 是技术债追踪，记录「代码能跑但质量存在问题需要日后偿还」的系统性欠债（如裸 catch、硬编码配置、缺少索引等）。

**Q：Coding Worker 完成了一个 Task，直接开始了下一个，怎么办？**

A：这违反了「单步闭环」原则。在 AGENTS.md 的架构约束中明确写入「每次 Session 只做一个 Task，完成后必须退出」，Coding Worker v3 的 Phase 5-E 会强制执行这条。

**Q：多个 AI Agent 能不能同时工作？**

A：可以，但需要满足并行触发条件。v2.1 定义了「串行默认 + 并行按需」模式：默认情况下所有任务串行执行，共享全局 feature-list.json 和 progress.txt，active/ 保持为空。当满足并行触发规则时（如 2+ 任务 files_affected 无交集、用户明确要求多会话并行、任务有清晰模块边界），架构师在 active/[task-name]/ 下为每个并行任务创建独立的 plan.md 和 progress.txt，各 Worker 只操作自己目录下的文件，避免冲突。Git worktree 负责代码隔离，active/ 负责 harness 状态隔离。