# OpenAI Harness Engineering 深度笔记：智能体优先世界的工程实践

## OpenAI Harness Engineering 深度笔记

> 来源：[OpenAI 官方文章《Harness engineering: leveraging Codex in an agent-first world》](https://openai.com/zh-Hans-CN/index/harness-engineering/)
> 整理时间：2026-04-21
> 整理人：wanghong52

---

### 一、背景与核心主张

OpenAI 内部一个三人工程师团队，用五个月时间构建并交付了一款有内部日活用户的软件产品，**全程没有一行人工编写的代码**。最终代码库达到约 100 万行，1500 个 PR，人均日均处理 3.5 个 PR——随着团队扩展到 7 人，吞吐量还在增加。

核心主张：**人类掌舵，智能体执行**。工程师的工作重心不再是编写代码，而是设计环境、明确意图、构建反馈回路。

---

### 二、六大核心实践

#### 实践一：将 AGENTS.md 当地图而非说明书

**反模式**：把 AGENTS.md 写成一个几千行的"百科全书"。
**结果**：上下文空间被挤占、规则腐烂、Agent 局部模式匹配而非有意导航、无法机械验证。

**正确做法**：AGENTS.md 只有约 100 行，充当"内容目录"，指向 docs/ 目录下的具体知识源。

```
// 代码块
AGENTS.md          ← 100 行地图
ARCHITECTURE.md    ← 域和包分层顶层视图
docs/
├── design-docs/   ← 设计文档 + 核心理念
├── exec-plans/    ← 执行计划（active/completed）+ 技术债追踪
├── generated/     ← 自动生成物（如 db-schema.md）
├── product-specs/ ← 产品规格
├── references/    ← 外部参考（llms.txt 格式）
├── DESIGN.md
├── FRONTEND.md
├── PLANS.md
├── PRODUCT_SENSE.md
├── QUALITY_SCORE.md
├── RELIABILITY.md
└── SECURITY.md
```

**渐进式披露原则**：Agent 从小而稳定的切入点开始，被引导去找更深的知识源，而不是一开始就被淹没。

---

#### 实践二：仓库是唯一事实来源

**关键洞察**：对 Agent 来说，它在运行时无法在上下文中访问的任何内容都不存在。Google Docs、Slack 消息、人脑中的隐性知识——对 Agent 而言等同于不存在。

**行动准则**：凡是需要 Agent 知道的内容，必须以 Markdown、Schema、可执行计划等形式提交到仓库并版本化。

**配套机制**：

- 专职 linter + CI 作业验证知识库是否交叉链接、结构正确
- 定期运行"doc-gardening" Agent 扫描过时文档，自动提 PR 修复

---

#### 实践三：机械约束优先于口头约定

**问题**：仅靠文档无法保持百万行代码库的连贯性。

**解决方案**：通过强制执行不变量来约束架构，而不是微观管理实现细节。

**分层领域架构**：每个业务域划分为固定层次：

```
// 代码块
Types → Config → Repo → Service → Runtime → UI
                    ↑
              Providers（横切关注点入口）
```

只允许"向前"依赖，违反者通过自动化工具拦截。

**深层逻辑**：这套严格架构通常要等到有数百名工程师时才会引入。对编码 Agent 来说，它是早期必要条件——有了约束，速度才不会随规模增长而下降，架构才不会漂移。

---

#### 实践四：让应用程序对 Agent 可读

**可观测性闭环**：

- 通过 Chrome DevTools Protocol 接入 Agent 运行时，允许 Agent 驱动应用、对比 DOM 快照、截图、导航
- 建立本地临时可观测性栈（Logs/Metrics/Traces），Agent 可以用 LogQL/PromQL/TraceQL 查询
- 任务完成后，整个环境（包括日志和指标）都会被销毁

**效果**：Agent 单次运行可持续工作超过六小时。"确保服务启动在 800ms 内完成"这类提示变得可行。

**完整的端到端自主能力**：复现 Bug → 录制演示视频 → 实施修复 → 验证修复 → 开 PR → 响应反馈 → 合并变更（仅在需要判断时交由人工）。

---

#### 实践五：熵控制与垃圾回收

**问题**：Agent 会复现仓库中已有的模式——包括不良模式，且速度远快于人类。早期人工方式是每周五花 20% 时间清理"AI 残渣"，不可扩展。

**解决方案**：将"黄金原则"编码到仓库，建立循环清理流程：

- 倾向于使用共享工具包而不是手工辅助函数
- 不使用"YOLO 式"探测数据，必须验证边界或使用类型化 SDK
- 定期运行后台 Codex 任务扫描偏差、更新质量评级、发起针对性重构 PR

**类比**：技术债就像高息贷款——持续小额偿还，远好过积累到需要大规模重构。

---

#### 实践六：吞吐量改变合并理念

在 Agent 驱动的高吞吐量环境中：PR 生命周期很短，测试偶发失败通过后续重跑解决而不是阻塞进展。纠错成本低，等待成本高。机械约束（架构 linter、自动化测试）替代了人工 Review 的大部分工作。

---

### 三、深度思考

#### 3.1 上下文是稀缺资源，必须精心分配

Agent 的上下文窗口是固定且有限的。Harness 工程的核心思想之一，就是对上下文进行架构级的精心设计：

- **常驻层**（AGENTS.md 地图）：始终注入，极短
- **按需层**（docs/ 各文档）：被引导时才读取
- **生成层**（可执行计划、schema）：任务相关时注入

这与人类工程师的认知带宽管理如出一辙——工作记忆总是有限的，好的系统设计本质上是管理认知负荷。

#### 3.2 机械约束 > 口头约定的本质

| 维度 | 文档规则 | 机械约束 |
| --- | --- | --- |
| 覆盖范围 | 取决于是否读到 | 100% |
| 衰减速度 | 随时间快速腐烂 | 与代码同步更新 |
| 执行成本 | 每次 Review 重新判断 | 一次编写，永久执行 |
| 反馈速度 | 人工 Review（慢） | CI/本地即时报错（快） |

#### 3.3 "仓库即记录系统"是信息架构的根本转变

过去，知识分散在 Slack、Wiki、人脑……Agent 无法访问。将仓库作为唯一事实来源意味着：所有架构决策有可查的版本历史、新成员（无论人还是 Agent）的信息鸿沟大幅降低、知识腐烂可被 CI 检测。

这不只是 Agent 工程的最佳实践，也是大型工程团队的最佳实践——Agent 让这个问题的严重性从"推荐"变成了"必须"。

#### 3.4 熵控制是 Agent 工程的特有挑战

传统技术债主要来自人为妥协。Agent 引入了一种新形式——**模式复制**：Agent 倾向于以超快速度复现仓库中已有的不良模式。应对策略从"人工周期性审查"升级为"编码黄金原则 + 循环清理 Agent"，本质上是把技术债的感知和偿还也自动化了。

#### 3.5 工程师角色转变的深层含义

文章描述的是从 **L1（实现层）** 转向 **L2（系统层）** 的抽象层次跃迁：

- L1：知道怎么写代码
- L2：知道怎么设计让代码容易被正确写出来的系统
- L3：知道怎么设计让 L2 容易被正确执行的组织和文化

Harness 工程将工程师推向了 L2/L3，这是对工程师能力要求最大的挑战——不是"如何用好 AI 写代码"，而是"如何设计一个系统，让 AI 在这个系统里能可靠地工作"。

---

### 四、可直接借鉴的行动清单

1. **AGENTS.md 瘦身**：检查是否超过 150 行，超过就拆分到 docs/ 子目录
2. **仓库化隐性知识**：下次在 Slack 讨论架构决策后，立即提 PR 将结论写入对应 docs/ 文件
3. **建立架构 linter**：哪怕从一两条规则开始，用代码而非文档约束架构边界
4. **计划版本化**：将执行计划（feature-list.json / exec-plans/）纳入仓库，而不是放在聊天上下文里
5. **定期熵扫描**：建立"doc-gardening"或"harness-watchdog"机制，定期检测知识库腐烂
6. **可观测性优先**：日志、指标要对 Agent 可查，才能让 Agent 闭环自验证
7. **错误信息即修复指令**：自定义 linter 的错误信息里直接包含修复方法

---

### 五、与美团 Harness 工程实践的映射

| OpenAI 实践 | 美团对应实践 |
| --- | --- |
| AGENTS.md（地图） | AGENT.md + feature-list.json |
| docs/ 目录体系 | docs/tech-debt.md、docs/caveats.md |
| 执行计划（exec-plans） | feature-list.json 任务状态管理 |
| doc-gardening Agent | harness-watchdog 技能 |
| 品味不变式 / 架构 linter | ARCHITECTURE.md 约束 + coding-reviewer 技能 |
| 会话交接机制 | session-handoff 技能 |
| 缺陷追踪 | issue-triage 技能 |

两套体系在理念上高度一致。美团侧更强调多会话间的状态持久化和 Agent 角色分工（架构师/编码 Worker/评审者）；OpenAI 侧更强调可观测性闭环和端到端自主执行能力。两者互为补充，可以融合使用。

---

### 六、参考资料

- [OpenAI 官方原文](https://openai.com/zh-Hans-CN/index/harness-engineering/)
- [Learn Harness Engineering 中文资料库](https://walkinglabs.github.io/learn-harness-engineering/zh/resources/openai-advanced/)
- [执行计划最佳实践](https://cookbook.openai.com/articles/codex_exec_plans)
- [架构文档写法参考](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html)
- [边界处解析数据形状](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)