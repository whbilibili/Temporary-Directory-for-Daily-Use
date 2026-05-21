# LLM 可观测性（Observability & Tracing）学习指南

> 整理自业界主流实践，涵盖分布式追踪、指标监控、成本追踪、OpenTelemetry 标准，以及 Langfuse、LangSmith、Arize 等工具对比，帮助团队将 AI Agent 从"能跑"变成"能用"。

### 一、为什么需要 LLM 可观测性

将 AI Agent 部署到生产环境后，最常被问到的两个问题是：**"为什么会给出这样的回答？"** 和 **"这花了多少钱？"** 如果无法快速回答这两个问题，可以认为该系统已经失控。

#### 传统 APM 工具的局限

现有的应用性能监控（APM）工具——Datadog、New Relic、Dynatrace——在 AI Agent 监控方面存在本质局限：

| 传统 APM 能测量的 | AI Agent 真正重要的 |
| --- | --- |
| 响应时间（延迟） | 回答质量（幻觉率） |
| 错误率 | 工具调用成功率与失败模式 |
| CPU/内存使用率 | 推理链的逻辑一致性 |
| HTTP 状态码 | Token 成本与业务价值比 |
| - | 智能体间消息传递延迟 |

LLM 的随机性（Non-deterministic）使得传统软件监控指标已不足以衡量 Agent 的健康状态。

#### 可观测性的核心价值

- **调试**：能够重现 Agent 为何做出特定决策
- **成本控制**：追踪每次请求的 Token 消耗和费用
- **质量监控**：发现幻觉、质量漂移等问题
- **性能优化**：定位延迟瓶颈和低效工具调用
- **合规审计**：完整记录 AI 决策链路

### 二、可观测性的三大支柱

#### 1. 分布式追踪（Distributed Tracing）

在多智能体系统中，追踪不只是"哪个函数花了多少时间"，而是要能够**重现智能体为何做出特定决策**的完整过程。

**优秀的 LLM 追踪应记录的内容：**

- 完整输入消息（包括系统提示词）
- 模型选择的工具及其参数
- 每次工具调用的结果
- 后续 LLM 调用中的上下文变化
- 最终输出

**核心概念：**

- **Trace**：一次完整请求的全生命周期记录
- **Span**：Trace 中的一个操作单元（如一次 LLM 调用、一次工具调用）
- **Span 嵌套**：子 Agent 调用形成树状结构，清晰展示调用链

**代码示例（Langfuse + OpenTelemetry）：**

```Python
// 代码块
from langfuse import Langfuse

langfuse = Langfuse()

def run_agent_with_tracing(user_query: str):
    trace = langfuse.trace(
        name="agent-execution",
        input={"query": user_query},
        metadata={"agent_version": "2.1.0", "env": "production"}
    )
    
    # 编排器 Span
    span = trace.span(name="orchestrator-planning")
    plan = orchestrator.plan(user_query)
    span.end(output={"plan": plan})
    
    # 追踪子智能体调用
    for task in plan.tasks:
        with trace.span(name=f"sub-agent-{task.agent_id}") as agent_span:
            result = task.execute()
            agent_span.update(
                output=result,
                level="DEFAULT" if result.success else "WARNING"
            )
    
    trace.update(output={"final_answer": result.answer})
    return result

```

#### 2. 指标（Metrics）

**成本指标：**

- 每次请求的平均 Token 数（input/output 分开统计）
- 按模型划分的成本分布
- 每次 Agent 执行的总成本

**质量指标：**

- 工具调用成功率
- 重试率
- 用户反馈评分（点赞/点踩）
- 幻觉检测率

**性能指标：**

- 首个 Token 时间（TTFT，Time to First Token）
- 端到端延迟
- Agent 链深度（调用层数）

**业务指标：**

- 任务完成率
- 人工干预请求频率
- 升级率（需要人工接管的比例）

#### 3. 结构化日志（Structured Logging）

AI Agent 日志记录的核心原则是**可复现性（Reproducibility）**——发生故障时，必须能够精确重现当时的情况。

**推荐的日志结构：**

```JSON
// 代码块
{
  "timestamp": "2025-10-01T03:15:22Z",
  "trace_id": "abc123",
  "span_id": "def456",
  "agent_id": "research-agent-v2",
  "event_type": "tool_call",
  "tool": "web_search",
  "input": {
    "query": "latest AI Agent best practices 2025",
    "max_results": 5
  },
  "output": {
    "results_count": 5,
    "latency_ms": 342
  },
  "model": "claude-sonnet",
  "tokens": {
    "input": 1243,
    "output": 87
  },
  "cost_usd": 0.0024,
  "session_id": "user_session_789"
}

```

### 三、OpenTelemetry：AI Agent 的标准检测框架

业界正在将 **OpenTelemetry（OTEL）** 作为 AI Agent 遥测数据的标准。其核心优势是无需供应商锁定即可收集数据并路由到各种后端。

**LLM 的 OpenTelemetry 语义约定：**

```Python
// 代码块
from opentelemetry.semconv.ai import SpanAttributes

span.set_attribute(SpanAttributes.LLM_SYSTEM, "anthropic")
span.set_attribute(SpanAttributes.LLM_REQUEST_MODEL, "claude-sonnet")
span.set_attribute(SpanAttributes.LLM_REQUEST_MAX_TOKENS, 4096)
span.set_attribute(SpanAttributes.LLM_USAGE_PROMPT_TOKENS, 1243)
span.set_attribute(SpanAttributes.LLM_USAGE_COMPLETION_TOKENS, 87)
span.set_attribute(SpanAttributes.LLM_RESPONSE_FINISH_REASON, "stop")

```

使用这些标准属性，无论切换到 Langfuse、Arize 还是 Datadog，都无需重写数据模式。

### 四、主流工具对比

#### Langfuse（开源，推荐首选）

**定位：** 开源 LLM 工程平台，可自托管

**核心功能：**

- 完整的 Trace 可视化（LLM 调用、工具调用、检索步骤）
- Token 用量和成本追踪
- 提示词版本管理（Prompt CMS）
- 内置评估（Evals）功能
- 支持 LangChain、LlamaIndex、OpenAI 等主流框架

**优势：** 完全开源、自托管保障数据主权、成本效益高

**适合：** 数据隐私要求高的企业、对成本敏感的团队

**快速接入：**

```Python
// 代码块
from langfuse import Langfuse
from langfuse.openai import openai  # 自动追踪 OpenAI 调用

langfuse = Langfuse()
# 之后所有 openai.chat.completions.create() 调用都会自动被追踪

```

#### LangSmith（LangChain 生态）

**定位：** LangChain 官方 LLMOps 平台

**核心功能：**

- 与 LangChain/LangGraph 完美集成，自动追踪
- 强大的 Playground（可直接在 UI 中调试 Chain）
- 数据集管理和评估
- 提示词 Hub

**优势：** 与 LangChain 生态无缝集成，开发体验极佳

**适合：** 基于 LangChain 构建系统的团队

**快速接入：**

```Shell
// 代码块
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
# 之后所有 LangChain 调用自动被追踪，无需修改代码

```

#### Arize AI（企业级）

**定位：** ML + LLM 统一可观测性平台

**核心功能：**

- ML 模型和 LLM 统一监控
- 漂移检测（数据漂移、概念漂移）
- 企业级安全和合规
- 与 OpenTelemetry 深度集成

**优势：** 同时运营 ML 和 LLM 系统的大型企业首选

**适合：** 有传统 ML 系统需要统一监控的大型企业

#### Braintrust（评估专精）

**定位：** LLM 评估（Eval）专精平台

**核心功能：**

- LLM 评估最佳工具
- A/B 测试（模型对比、提示词对比）
- 提示词版本管理
- 与 CI/CD 集成

**适合：** 以提示词优化和模型比较为核心工作流的团队

#### Helicone（零代码接入）

**定位：** API 代理方式的轻量级监控

**核心功能：**

- 无需修改代码，作为 API 代理运行
- 基础成本追踪和请求日志
- 缓存功能（降低成本）

**适合：** 希望快速启动基础监控的团队

#### 工具选型总结

| 工具 | 开源 | 自托管 | 评估能力 | 适合场景 |
| --- | --- | --- | --- | --- |
| Langfuse | ✅ | ✅ | ✅ | 通用，数据隐私要求高 |
| LangSmith | ❌ | ❌ | ✅ | LangChain 生态 |
| Arize | ❌ | ❌ | ✅ | 大型企业，ML+LLM 统一 |
| Braintrust | ❌ | ❌ | ✅✅ | 评估驱动开发 |
| Helicone | ✅ | ✅ | ❌ | 快速启动，零代码 |

### 五、监控仪表盘设计（三层结构）

#### 第一层：业务级 KPI

```
// 代码块
任务完成率：94.2%（目标：95%+）
平均任务耗时：47 秒
成本/任务：$0.12（与上周相比 -8%）
用户满意度：4.3/5.0

```

#### 第二层：系统健康指标

```
// 代码块
按 Agent 划分的成功率：
  research-agent：98.1%
  code-agent：91.3% ⚠️
  review-agent：99.7%

按工具划分的失败率：
  web_search：0.8%
  code_executor：7.2% ⚠️
  database_query：0.3%

```

#### 第三层：成本与资源

```
// 代码块
今日总成本：$47.23
按模型分布：
  claude-sonnet：68%
  claude-haiku：32%

Token 效率（对比目标）：
  input：103%（略微超出）
  output：94%（健康）

```

### 六、告警设计原则

AI Agent 告警设置过于敏感会导致告警疲劳（Alert Fatigue）。推荐分级设计：

**Critical（立即响应）：**

- Agent 整体错误率 > 10%（5 分钟平均）
- 成本超过每小时预算的 200%
- 特定工具在 5 分钟内连续失败 3 次

**Warning（日常审查）：**

- 特定 Agent 成功率较前一天下降超 5%
- 平均响应延迟比基准增加超 50%
- 检测到新错误类型

**Info（每周报告）：**

- 成本趋势分析
- 使用模式变化
- 提示词效率变化

### 七、可观测性能发现的典型问题

**隐藏的成本黑洞：**

> research-agent 的 web_search 工具即使在短查询上也在执行全页面抓取。通过 Token 追踪发现后，修改提示词使相关成本降低了 40%。

**Agent 循环检测：**

> 在特定条件下，code-agent 和 review-agent 相互无限调用产生循环。Span 深度监控在 3 分钟内发现，自动 Circuit Breaker 触发。

**质量漂移：**

> 模型更新后，特定领域的回答质量悄然下降。用户反馈评分追踪在 2 天内发现，通过为相关查询类型补充 few-shot 示例解决了问题。

### 八、落地路线图

**立即（第 1 天）：** 结构化日志 + 成本追踪（Helicone 或 Langfuse 基础设置）

**1~2 周：** 追踪标准化（应用 OpenTelemetry 语义约定）

**1 个月：** 指标仪表盘 + 告警设计

**季度：** 评估（Eval）流水线建设，与 CI/CD 集成

> 生产环境 AI 系统的可靠性，不是从更好的模型开始的，而是从更好的观察开始的。

### 九、学习资源

**工具官方文档：**

- [Langfuse 文档](https://langfuse.com/docs)
- [LangSmith 文档](https://docs.smith.langchain.com/)
- [Arize AI 文档](https://docs.arize.com/)
- [OpenTelemetry LLM 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/)

**深度阅读：**

- [AI 智能体可观测性实战指南](https://jangwook.net/zh/blog/zh/ai-agent-observability-production-guide/)
- [Agentic AI 基础设施实践：可观测性在 Agent 中的应用（AWS）](https://aws.amazon.com/cn/blogs/china/agentic-ai-infrastructure-practice-series-7/)
- [全栈 AI 可观测性：使用 OpenTelemetry 与 Arize 追踪智能体循环](https://www.tiptinker.com/zh-hans/full-stack-ai-observability-tracing-agentic-loops-with-opentelemetry-arize/)
- [Langfuse 完整教程（2025）](https://hugging-face.cn/blog/daya-shankar/langfuse-llm-observability-guide)