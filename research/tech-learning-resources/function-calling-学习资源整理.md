# Function Calling 学习资源整理：官方文档、实战教程与评测基准

> 本文由 CatPaw 整理生成，收录时间：2026-04-09。
> 内容来源于官方文档、GitHub 开源项目及公开网络资料，信息时效性请以原始链接为准。

---

Function Calling（函数调用 / 工具调用）是让大语言模型具备"动手能力"的核心机制——模型不再只是生成文本，而是能够智能判断何时调用外部函数、生成结构化参数，由开发者执行后再将结果反馈给模型，从而完成数据获取、API 调用、自动化操作等复杂任务。这是构建 AI Agent 的基础能力之一。

### 一、核心概念

Function Calling 的基本工作流程分为五步：

1. **声明工具**：开发者在请求中附带工具列表（包含函数名、描述、参数 JSON Schema）
2. **模型决策**：模型根据用户意图判断是否需要调用工具，以及调用哪个工具
3. **生成调用参数**：模型返回结构化的函数调用请求（函数名 + 参数 JSON），而非自然语言
4. **开发者执行**：应用程序接收调用请求，在本地执行对应函数，获取结果
5. **结果回传**：将执行结果作为 tool_result 消息返回给模型，模型生成最终回答

**重要说明**：模型本身从不直接执行函数，始终由开发者代码控制执行权。

各主流厂商的命名略有差异：OpenAI 称为 Function Calling / Tool Use，Anthropic（Claude）称为 Tool Use，Google（Gemini）称为 Function Calling，但核心机制一致。

---

### 二、官方文档（首选参考）

#### 1. OpenAI 官方 Function Calling 文档

**官方文档**：[https://platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling)
**中文文档**：[https://ai-doc.it-docs.cn/docs/guides_function-calling](https://ai-doc.it-docs.cn/docs/guides_function-calling)

OpenAI 官方发布的函数调用完整指南，是学习 Function Calling 的权威起点。内容涵盖：函数定义方式（JSON Schema）、tool_choice 参数控制（auto / none / required / 指定函数）、并行函数调用（Parallel Function Calling，单次响应中调用多个函数）、结构化输出（Structured Outputs，strict: true 保证参数严格符合 Schema）、完整代码示例（Python / JavaScript）。

**核心最佳实践**：函数描述要清晰准确（模型依赖描述决策）；参数 Schema 尽量简洁；生产环境建议开启 strict: true；合理使用 parallel_tool_calls 提升效率。

**适合人群**：使用 OpenAI API 的开发者，以及希望了解 Function Calling 标准规范的所有开发者。

---

#### 2. Anthropic 官方 Tool Use 文档与教程

**官方文档**：[https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/overview](https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/overview)
**官方交互式教程（GitHub）**：[https://github.com/anthropics/courses/tree/master/tool_use](https://github.com/anthropics/courses/tree/master/tool_use)

Anthropic 官方提供的 Claude Tool Use 完整文档和配套教程。教程共 6 课，以 Jupyter Notebook 形式呈现，覆盖 Tool Use 的全部核心用法。

6 课内容：基础工具定义与调用、工具选择控制（tool_choice）、构建工具调用循环（Agentic Loop）、并行工具调用（Parallel Tool Use）、工具结果处理与错误恢复、真实场景综合实战。

Claude Tool Use 的特色：支持 XML 结构化工具描述、支持 computer_use（计算机操作工具）、支持 Advanced Tool Use（动态工具发现与程序化工具调用）。

**适合人群**：使用 Claude API 的开发者，以及希望深入理解 Tool Use 在 Agent 场景中应用的工程师。

---

#### 3. OpenAI Cookbook：How to Call Functions with Chat Models

**GitHub**：[https://github.com/openai/openai-cookbook](https://github.com/openai/openai-cookbook)
**直接访问示例**：[https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb)

OpenAI 官方 Cookbook 中的函数调用示例集，提供可直接运行的 Jupyter Notebook。涵盖：如何生成函数参数、如何用模型生成的参数调用函数、如何构建完整的对话代理、多函数调用场景等。Cookbook 整体是 OpenAI API 各类能力的实战示例库，Function Calling 相关示例持续更新。

**适合人群**：希望通过可运行代码快速上手 Function Calling 的开发者。

---

### 三、评测与基准

#### 4. Berkeley Function-Calling Leaderboard（BFCL）

**GitHub**：[https://github.com/ShishirPatil/gorilla](https://github.com/ShishirPatil/gorilla)
**在线排行榜**：[https://gorilla.cs.berkeley.edu/leaderboard.html](https://gorilla.cs.berkeley.edu/leaderboard.html)

由加州大学伯克利分校发布的 Function Calling 能力评测排行榜，是目前最权威的 LLM 函数调用能力基准。包含 2000+ 问题-函数-答案对，覆盖多种编程语言（Python、Java、JavaScript、REST API）、多种调用场景（单函数、多函数、并行调用、多轮对话）。

Gorilla 项目本身也是首个专门训练 LLM 准确调用 1600+ API 的开源模型，通过检索增强减少幻觉，是 Function Calling 领域的奠基性工作。

**适合人群**：希望了解各模型函数调用能力横向对比的研究者和选型工程师。

---

### 四、框架集成

#### 5. LangChain Tool Calling 文档

**中文文档**：[https://www.langchain.com.cn/docs/how_to/function_calling/](https://www.langchain.com.cn/docs/how_to/function_calling/)
**官方英文文档**：[https://python.langchain.com/docs/how_to/function_calling/](https://python.langchain.com/docs/how_to/function_calling/)

LangChain 对 Function Calling / Tool Use 的统一封装，屏蔽了 OpenAI、Anthropic、Google 等不同厂商的接口差异，提供一致的工具调用 API。支持内置工具（搜索、计算器、代码执行等）和自定义工具，可与 Agent、Chain 无缝集成。

核心用法：`@tool` 装饰器定义工具、`bind_tools()` 绑定工具到模型、`ToolMessage` 传递工具执行结果、`create_react_agent` 构建工具调用 Agent。

**适合人群**：使用 LangChain 框架构建 AI 应用、希望跨模型统一管理工具调用的开发者。

---

#### 6. 阿里云百炼 Qwen Function Calling 文档

**文档地址**：[https://help.aliyun.com/zh/model-studio/qwen-function-calling](https://help.aliyun.com/zh/model-studio/qwen-function-calling)

通义千问（Qwen）系列模型的 Function Calling 官方文档，适合使用国内模型的开发者参考。详细介绍了 Qwen 的工具调用流程、请求格式、响应解析、多轮工具调用实现，以及与 OpenAI 接口格式的兼容性说明。

**适合人群**：使用通义千问或其他兼容 OpenAI 接口的国内模型进行开发的工程师。

---

### 五、核心技术要点速查

**工具定义规范**：每个工具需包含 name（函数名）、description（功能描述，模型决策依赖此字段）、parameters（JSON Schema 格式的参数定义，含类型、描述、required 字段）。描述越清晰，模型调用越准确。

**tool_choice 控制**：auto（模型自主决定是否调用，默认）、none（禁止调用工具，强制文本回答）、required（强制必须调用工具）、指定函数名（强制调用特定工具）。

**并行工具调用（Parallel Tool Calls）**：模型在单次响应中返回多个工具调用请求，开发者并发执行后批量回传结果，显著提升多工具场景效率。GPT-4o、Claude 3.5+ 均支持。

**多轮工具调用（Multi-turn）**：复杂任务需要多轮"调用→执行→回传→再调用"循环，即 Agentic Loop。每轮工具结果都追加到 messages 历史中，模型基于完整上下文决策下一步。

**结构化输出（Structured Outputs）**：OpenAI 在 2024 年 8 月推出，在函数定义中设置 strict: true，保证模型生成的参数 100% 符合 JSON Schema，消除参数格式错误。

**错误处理**：工具执行失败时，应将错误信息作为 tool_result 返回给模型，让模型决定重试或换策略，而非直接抛出异常中断流程。

---

### 六、延伸阅读

- **Anthropic Advanced Tool Use 技术博客**：[https://www.anthropic.com/engineering/advanced-tool-use](https://www.anthropic.com/engineering/advanced-tool-use) — Anthropic 工程团队介绍动态工具发现（Tool Search Tool）、程序化工具调用（Programmatic Tool Calling）、工具调用示例（Tool Use Examples）三项高级能力，是 Agent 工具调用的前沿实践。
- **LLMCompiler：并行函数调用编译器**：[https://github.com/SqueezeAILab/LLMCompiler](https://github.com/SqueezeAILab/LLMCompiler) — 斯坦福出品，自动识别可并行执行的工具调用任务并编排执行，大幅提升多工具 Agent 效率，附论文和代码。
- **菜鸟教程：工具调用（Function Calling）**：[https://www.runoob.com/ai-agent/ai-agent-function-calling.html](https://www.runoob.com/ai-agent/ai-agent-function-calling.html) — 中文入门级教程，概念清晰，适合快速了解 Function Calling 基础原理。
- **北京大学 AI x Physics 课程：工具调用章节**：[https://aiphy.pku.edu.cn/course/llm-agent/tool-calling](https://aiphy.pku.edu.cn/course/llm-agent/tool-calling) — 北大课程中的 Function Calling 专章，含理论讲解和实践练习，学术视角清晰。
- **All-in-RAG（DataWhale）**：[https://github.com/datawhalechina/all-in-rag](https://github.com/datawhalechina/all-in-rag) — RAG 全栈教程中包含 Agentic RAG 章节，涵盖 Function Calling 在 RAG 场景中的应用。
