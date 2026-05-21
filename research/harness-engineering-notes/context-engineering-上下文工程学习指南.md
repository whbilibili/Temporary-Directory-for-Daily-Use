# Context Engineering（上下文工程）学习指南

> 整理自 Andrej Karpathy、Anthropic、LangChain、Manus 等一线团队的实践经验，系统梳理上下文工程的核心概念、策略与最佳实践。

### 一、什么是上下文工程

**上下文工程（Context Engineering）** 是 2025 年 AI Agent 开发领域最热门的话题之一。Andrej Karpathy 将其定义为：

> "为 LLM 在正确的时间提供正确的信息和工具，以便它能够合理地完成任务的艺术。"

一个直观的类比：LLM 就像一种新型操作系统，LLM 相当于 CPU，而其"上下文窗口"则类似于 RAM，代表了模型的"工作内存"。上下文可以通过多种方式进入 LLM：提示（用户指令）、检索（外部文档）、工具调用（API 反馈）。

和 RAM 一样，LLM 的上下文窗口有带宽和容量限制，无法无限制加载信息。如何像操作系统管理内存一样，科学地"打包"和"管理"上下文，成为智能体开发的关键——这就是上下文工程。

Cognition 在构建 Devin 时强调：**"上下文工程实际上是构建 AI 智能体工程师的头号工作。"** Anthropic 也指出：**"智能体经常参与持续数百轮的对话，这需要仔细的上下文管理策略。"**

### 二、为什么上下文工程如此重要

#### 上下文爆炸问题

随着 AI Agent 执行日益复杂的长期任务，其上下文窗口会因大量的工具调用而急剧膨胀，导致：

- **成本激增**：token 消耗呈指数级增长
- **延迟上升**：处理超长上下文耗时更长
- **性能下降**：Google 和 Percy Liang 团队描述了"上下文退化综合症"（Context Rot）——过长的上下文会限制 LLM 回忆事实或遵循指令的能力

#### 与 Prompt Engineering 的区别

| 维度 | Prompt Engineering | Context Engineering |
| --- | --- | --- |
| 关注点 | 单次输入的措辞优化 | 整个 Agent 运行周期的信息流管理 |
| 适用场景 | 单轮对话、简单任务 | 多轮 Agent、长任务、工具调用 |
| 核心问题 | 如何说清楚需求 | 如何在正确时机提供正确信息 |
| 技术手段 | 提示词模板、Few-shot | 摘要、检索、隔离、持久化 |

### 三、上下文工程的三大发展阶段

1. **提示工程（Prompt Engineering）**：随着聊天机器人兴起，提示工程成为引导 LLM 行为的首要手段
2. **检索增强生成（RAG）**：为了让 LLM 连接外部数据源，RAG 作为第二阶段应运而生
3. **智能体与工具调用（Agent + Tool Calls）**：LLM 工具调用能力提升后，Agent 通过 LLM 与工具的反复交互，推动上下文工程进入第三阶段

### 四、五大核心策略（Offload / Reduce / Retrieve / Isolate / Cache）

LangChain 工程师 Lance Martin 联合 Manus 联合创始人季逸超，总结出生产级 Agent 的五大上下文管理策略：

#### 1. 卸载（Offload）

将工作内存或冗余信息转移到外部存储，避免塞满上下文窗口。

**实践案例：**

- Manus 将任务计划、中间结果写入文件系统，Agent 按需读取
- Claude Code 使用 `CLAUDE.md` 存储项目规范，每次启动时加载
- Cursor / Windsurf 使用规则文件管理项目上下文

**适用场景：** 长任务中产生的大量中间结果、不需要每步都可见的历史信息

#### 2. 压缩（Reduce）

对上下文进行摘要或裁剪，减少 token 消耗同时保留关键信息。

**实践案例：**

- Claude Code 在上下文窗口超 95% 时自动"压缩"整个对话历史
- Anthropic 的多智能体研究系统对已完成的工作阶段应用摘要
- Cognition 在 Devin 中用微调模型专门处理摘要，保留关键决策节点
- 对工具调用反馈（如大量 token 的搜索结果）进行摘要，从源头抑制膨胀

**技巧：** 在工具调用边界进行筛选是最自然的节点，可用小型 LLM 对 token 消耗大的工具调用结果进行摘要。

#### 3. 检索（Retrieve）

不把所有信息一次性塞入上下文，而是按需动态检索最相关的内容。

**实践案例：**

- RAG 系统：根据当前问题检索相关文档片段
- 记忆系统：Letta、Mem0、LangGraph/Mem 存储嵌入文档，按需检索
- 知识图谱：Zep、Neo4J 对事实或关系进行连续/时序索引

**检索策略：**

- 语义检索（Embedding Search）：适合非结构化知识
- 图谱检索（Graph Retrieval）：适合关系型知识
- 全量加载：记忆量小时（如 Claude Code 每次读取所有 CLAUDE.md）

#### 4. 隔离（Isolate）

将上下文在不同 Agent 或环境间分区，优化 token 使用和任务协作。

**多智能体隔离：**
Anthropic 研究表明，多智能体 + 隔离上下文的表现比单智能体高出 90.2%，主要归功于 token 使用效率提升。子 Agent 并行工作，各自拥有独立的上下文窗口，同时探索问题的不同方面。

**状态 Schema 隔离：**
用结构化的运行时状态（如 Pydantic 模型定义的 schema）替代无序的消息列表，更好地控制每轮 LLM 可见内容。例如深度研究 Agent 用 schema 将 `messages`（每轮传递）与 `sections`（token 多，按需加载）分离。

**基于环境的隔离：**
HuggingFace 的 CodeAgent 输出代码来调用工具，代码在沙盒中运行，执行反馈再传递给 LLM。沙盒存储执行过程中生成的对象（图片、音频等），将其与 LLM 上下文窗口隔离，但 Agent 可以用变量随时引用。

#### 5. 缓存（Cache）

利用 KV Cache 等机制，避免重复计算相同的上下文前缀，降低成本和延迟。

**实践案例：**

- Anthropic Prompt Caching：对系统提示、工具定义等静态内容启用缓存，可节省 90% 的 token 成本
- 将不变的内容（系统提示、工具列表）放在上下文前部，将变化的内容（对话历史）放在后部，最大化缓存命中率

### 五、上下文的七大组成部分

Anthropic 在其工程博客中系统梳理了 Agent 上下文的七大组成部分：

1. **系统提示（System Prompt）**：定义 Agent 的角色、能力边界和行为规范
2. **对话历史（Conversation History）**：用户与 Agent 的交互记录
3. **工具定义（Tool Definitions）**：Agent 可调用的工具列表及其描述
4. **工具调用结果（Tool Results）**：工具执行后返回的数据
5. **长期记忆（Long-term Memory）**：跨会话持久化的知识和偏好
6. **背景知识（Background Knowledge）**：通过 RAG 检索的相关文档
7. **任务状态（Task State）**：当前任务的进度、中间结果和计划

### 六、Manus 的实战经验

Manus 联合创始人季逸超在 LangChain 研讨会上分享了构建 Manus 的核心经验：

**押注上下文工程而非端到端训练**：Manus 选择在前沿大模型的上下文学习能力基础上构建 Agent，而非从头训练端到端模型。这使得团队能在几小时而非几周内交付改进，并使产品与底层模型保持正交——"如果模型进步是上涨的潮水，我们希望 Manus 成为那条船，而不是固定在海床上的柱子。"

**核心实践：**

- 用文件系统作为外部工作内存，存储任务计划和中间结果
- 对工具调用结果进行即时摘要，防止上下文膨胀
- 设计清晰的 Agent 状态 schema，区分"每步必须可见"和"按需加载"的信息

### 七、Claude Code 的上下文工程实践

Claude Code 是目前上下文工程做得最精细的 AI Coding 工具之一：

- **CLAUDE.md**：项目级记忆文件，存储代码规范、架构决策、常用命令
- **自动压缩**：上下文窗口超 95% 时自动触发压缩，保留关键决策
- **手动记忆**：用户可用 `#` 快捷键手动创建或更新记忆
- **层级加载**：全局 CLAUDE.md -> 项目 CLAUDE.md -> 子目录 CLAUDE.md，按需加载

### 八、最佳实践总结

**工程原则：**

1. **优先做数据监控**：始终关注 token 统计和追踪，及时发现 token 过度消耗并定位高消耗的工具调用，这是一切上下文工程的基础
2. **关注 Agent 状态设计**：梳理 Agent 在运行时需要收集和使用的信息，定义良好的状态 schema，避免无序堆叠消息列表
3. **在工具调用边界进行筛选**：工具调用是添加筛选的天然节点，可用小型 LLM 对 token 消耗大的工具调用结果进行摘要
4. **并行任务考虑多智能体**：在问题易于并行、无需子 Agent 间紧密协作的场景下，采用多智能体方案
5. **静态内容前置**：将系统提示、工具定义等不变内容放在上下文前部，最大化 KV Cache 命中率

**常见反模式（要避免的）：**

- 把所有历史消息无差别地塞入上下文
- 工具调用结果不经处理直接追加到消息列表
- 没有状态 schema，完全依赖消息列表传递信息
- 忽略 token 监控，不知道上下文在哪里膨胀

### 九、学习资源

**必读文章：**

- LangChain：智能体的 Context 工程（Lance Martin）：https://rlancemartin.github.io/2025/06/23/context_engineering/
- Manus：AI Agents 的上下文工程——构建 Manus 的经验教训：https://manus.im/zh-cn/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- Anthropic：构建多智能体研究系统：https://www.anthropic.com/engineering/built-multi-agent-research-system
- Spring AI Alibaba：上下文工程文档：https://java2ai.com/docs/frameworks/agent-framework/advanced/context-engineering/
- awesome-context-engineering（GitHub 资源合集）：https://github.com/yzfly/awesome-context-engineering

**进阶阅读：**

- Cognition：上下文工程是 Agent 工程师的头号工作：https://cognition.ai/blog/dont-build-multi-agents
- Anthropic Prompt Caching 文档：https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Reflexion 论文：通过反思提升 Agent 记忆：https://arxiv.org/abs/2303.11366

**工具推荐：**

- **记忆管理**：Mem0、Letta、LangGraph Memory
- **知识图谱**：Zep、Neo4J
- **上下文追踪**：LangSmith、Langfuse（详见 LLM 可观测性专题）
