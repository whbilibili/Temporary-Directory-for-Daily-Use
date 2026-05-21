# Prompt 评测资料大全：方法论、工具、开源项目与最佳实践

本文系统整理了 Prompt/LLM 评测相关的教程、工具、开源项目和最佳实践，涵盖美团内部实践、业界权威指南和 GitHub 开源生态三大来源，旨在为团队开展 Prompt 评测提供一站式参考。

---

### 一、美团内部评测资料（学城沉淀）

#### 1.1 核心评测方法论与框架

**Evals is all you need - 评测驱动大模型应用迭代**

- 链接：[km.sankuai.com/collabpage/1964136355](https://km.sankuai.com/collabpage/1964136355)
- 内容：系统性介绍基于 OpenAI Evals 的大模型评测方法论，涵盖评测定义、大模型软件工程特点、基于 evals 框架的工程化评测工具搭建（问题鲁棒性、安全性、功能准确性等）、评测体系建设（业务层 + 数据层 + 评测层），以及 HPSV2 打分和多模态大模型评测实现。

**大模型评测维度介绍**

- 链接：[km.sankuai.com/collabpage/2423790845](https://km.sankuai.com/collabpage/2423790845)
- 内容：详细介绍 AI 评测工具的运行流程（基于 toolchain-eval 框架），涵盖调用器、数据适配器、打分器（含大模型打分 DefaultTemplateScorer）、Reducer、报表生成器等完整链路，并给出安全评测、体验类评测等多维度评测的详细流程。

**大模型评测工具使用介绍**

- 链接：[km.sankuai.com/collabpage/2123644779](https://km.sankuai.com/collabpage/2123644779)
- 内容：介绍 toolchain-llmeval（Python SDK）工具搭建 AI 应用评测 WorkFlow 的方法，覆盖意图识别、改写 query、问答回复的准确率评测，包含向量相似度打分、大模型打分、规则匹配等多种打分方式。

**实践04：大模型评测篇**

- 链接：[km.sankuai.com/collabpage/2712306564](https://km.sankuai.com/collabpage/2712306564)
- 内容：大模型评测实践指引，介绍如何选择评测对象（Bots/Friday/图灵 Turing 等）和评测工具（Friday 评测工具、Bots 工作流、EvalCap、EvalScope、OpenCompass），包含操作流程和评测报告输出要求。

#### 1.2 内部评测框架与工具

**评测框架对比（EvalCap vs PikaEval）**

- 链接：[km.sankuai.com/collabpage/2740985493](https://km.sankuai.com/collabpage/2740985493)
- 内容：对比 EvalCap（Python 框架）和 PikaEval（Java 框架）两个内部评测框架在开发语言、评测方式（全量/增量/DAG）、扩展性、评测报告、调度方式等方面的差异。PikaEval 支持知识图谱 + 大模型构造评测数据、归因分析等高级特性。

**EvalCap 评测最佳实践**

- 链接：[km.sankuai.com/collabpage/2716614850](https://km.sankuai.com/collabpage/2716614850)
- 内容：EvalCap 评测框架的最佳实践，包含评测代码参考、工作流组装示例、大模型评分 Scorer 实现、EVE 评测平台等内容。

**EvalCap 评测用法分享**

- 链接：[km.sankuai.com/collabpage/2713464530](https://km.sankuai.com/collabpage/2713464530)
- 内容：EvalCap 评测用法分享，包含用法文档、评测代码参考、评测流程及工作流组装等内容。

**Prompt 执行评测数据集处理接口**

- 链接：[km.sankuai.com/collabpage/1891874481](https://km.sankuai.com/collabpage/1891874481)
- 内容：Prompt 评测数据集的接口文档，涵盖下载模板、检查上传文件、解析保存文本集、获取已有数据样本集等 API 说明。

**评测 Prompt 模板合集（问答/推荐/安全等）**

- 链接：[km.sankuai.com/collabpage/2704668331](https://km.sankuai.com/collabpage/2704668331)
- 内容：收录多种评测用 Prompt 模板，包括问答相关性检查、推荐事实性检查、行程规划相似性检查、大模型总结改写一致性检查、安全检查 Prompt 等，均输出 JSON 格式评分结果。

#### 1.3 业务场景评测实践

**推荐词质量评估体系 v8.4**

- 链接：[km.sankuai.com/collabpage/2755168422](https://km.sankuai.com/collabpage/2755168422)
- 内容：外卖推荐词质量评估体系，包含完整的评估 SYSTEM_PROMPT 设计、5 档评分标准（-1/0/1/2/3）、一致性参考示例锚定，以及 S/A/B/C 等级判定规则。是 LLM-as-Judge 在推荐词场景的成熟落地案例。

**酒店推荐场景评测 Prompt 校准系列**

- [km.sankuai.com/collabpage/2734365354](https://km.sankuai.com/collabpage/2734365354) — 0917版-1121，准确率达 92%
- [km.sankuai.com/collabpage/2733399299](https://km.sankuai.com/collabpage/2733399299) — 0917版-1118
- [km.sankuai.com/collabpage/2731193413](https://km.sankuai.com/collabpage/2731193413) — 0917版-1030
- [km.sankuai.com/collabpage/2731071825](https://km.sankuai.com/collabpage/2731071825) — 0917版-1029
- 内容：逐条 case 分析人工与机器评测不一致情况，通过迭代优化评测 Prompt 提升准确率。

**服务零售大模型评测现状调研**

- 链接：[km.sankuai.com/collabpage/2714533375](https://km.sankuai.com/collabpage/2714533375)
- 内容：对服务零售行业组 28 个大模型应用项目的评测现状调研，分析评测覆盖率（71%）、评测方案完善度（40%）、QA/PM/RD 的评测分工情况。

#### 1.4 行业分享与综合资料

**大模型评测与质量保障 — 多篇分享合集**

- 链接：[km.sankuai.com/collabpage/2506731889](https://km.sankuai.com/collabpage/2506731889)
- 内容：包含研发大模型评测探索与实践、大模型及 AI 应用效果评估实践、文生图效果评估体系设计与实践、大模型机器问答质量保障评测实践、AIGC 音乐生成效果评测等多篇分享 PDF。

**AI 模型评估（AI Model Evaluation）**

- 链接：[km.sankuai.com/collabpage/2706423474](https://km.sankuai.com/collabpage/2706423474)
- 内容：MDP-AI 继承 Spring AI 的 Model Evaluation 能力，介绍 RelevancyEvaluator 的使用方法，适用于 RAG 流程质量评估。

**Agent 工程实践笔记**

- 链接：[km.sankuai.com/collabpage/2753223547](https://km.sankuai.com/collabpage/2753223547)
- 内容：涵盖传统 LLM 评测在 Agent 时代失效的原因、评测原子单位（Task/Trial/Grader）、Pass@k 与 Pass^k 验证策略、Harness 比模型更关键等核心观点。

**Ragas 评测框架**

- 链接：[km.sankuai.com/collabpage/2750634066](https://km.sankuai.com/collabpage/2750634066)
- 内容：Ragas RAG 评测框架的介绍文档。

**Claude 上新：一键生成、测试和评估 Prompt**

- 链接：[km.sankuai.com/collabpage/2395982502](https://km.sankuai.com/collabpage/2395982502)
- 内容：介绍 Anthropic Console 的 Prompt 生成、测试和评估功能，包括自动生成测试用例、5 分制响应质量评分、多 Prompt A/B 对比评估等。

**Eugene Yan — 让 LLM 充当裁判救不了产品，改善流程才行**

- 链接：[km.sankuai.com/collabpage/2714938303](https://km.sankuai.com/collabpage/2714938303)
- 内容：翻译自亚马逊首席应用科学家 Eugene Yan 的文章，探讨评估驱动开发（EDD）理念，强调 LLM-as-Judge 不能替代人工监督。

**LongCat 团队发布 AMO-Bench**

- 链接：[km.sankuai.com/collabpage/2733565055](https://km.sankuai.com/collabpage/2733565055)
- 内容：美团 LongCat 团队发布的数学推理评测基准，50 道竞赛专家原创试题，揭示当前 LLM 在复杂推理上的局限性。

---

### 二、业界权威指南与教程

#### 2.1 大厂官方文档

**Anthropic — Demystifying Evals for AI Agents**

- 链接：[anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- 内容：Anthropic 工程团队撰写的 Agent 评测实战指南，涵盖 single-turn / multi-turn 评测、LLM-as-a-Judge 等方法。

**Anthropic — Prompt Evaluations 完整课程（9 课时）**

- 链接：[github.com/anthropics/courses/prompt_evaluations](https://github.com/anthropics/courses/blob/master/prompt_evaluations/README.md)
- 内容：Anthropic 官方开源的 Prompt Evaluations 课程，共 9 节课，从 Evaluations 101 开始，含 Jupyter Notebook 实操。强烈推荐作为入门教材。

**Anthropic — Define Success Criteria and Build Evaluations**

- 链接：[platform.claude.com/docs/en/test-and-evaluate/develop-tests](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- 内容：Claude 官方文档中关于如何定义成功标准、构建评测集的指导页面。

**OpenAI — Evals Framework**

- 链接：[github.com/openai/evals](https://github.com/openai/evals)
- 内容：OpenAI 官方评测框架，提供标准评测注册表、自定义评测能力，是业界最早的系统化 LLM 评测工具之一。

**OpenAI — Evals API 使用教程**

- 链接：[apidog.com/blog/openais-evals-api](https://apidog.com/blog/openais-evals-api/)
- 内容：详解 OpenAI Evals API 的编程式使用方法，包括定义测试、自动化评测运行、在 CI/CD 中迭代 Prompt。

**OpenAI — Prompt Engineering Guide**

- 链接：[ai-doc.it-docs.cn/docs_en/guides_prompt-engineering](https://ai-doc.it-docs.cn/docs_en/guides_prompt-engineering)
- 内容：OpenAI 官方 Prompt Engineering 指南，包括六大策略：明确指令、提供参考文本、拆分复杂任务、让模型充分思考、结合外部工具及系统测试。

**Hugging Face — Evaluation Guidebook**

- 链接：[huggingface.co/spaces/OpenEvals/evaluation-guidebook](https://huggingface.co/spaces/OpenEvals/evaluation-guidebook)
- 内容：Hugging Face OpenEvals 团队编写的评测指南，基于 3 年评测 15000+ 模型的经验，系统讲解评测目标、方法选择、Benchmark 设计、LLM-as-Judge 等内容。极为全面。

**Google — Stax Evaluation Best Practices**

- 链接：[developers.google.com/stax/best-practices](https://developers.google.com/stax/best-practices)
- 内容：Google 基于 DeepMind 评测经验构建的评测最佳实践文档，教开发者如何从凭感觉过渡到系统化 LLM 评测。

**LangChain/LangSmith — Evaluation Quickstart**

- 链接：[docs.langchain.com/langsmith/evaluation-quickstart](https://docs.langchain.com/langsmith/evaluation-quickstart)
- 内容：LangSmith 官方评测快速入门，讲解评测三要素（数据集、目标函数、评估器）及如何在 Prompt Playground 中运行评测。

**MLflow — Evaluating Prompts**

- 链接：[mlflow.org/docs/latest/genai/eval-monitor/running-evaluation/prompts](https://mlflow.org/docs/latest/genai/eval-monitor/running-evaluation/prompts/)
- 内容：MLflow 官方文档，讲解如何系统化评测 Prompt 模板、跟踪性能变化，并支持自动 Prompt 优化。

**Databricks — Best Practices and Methods for LLM Evaluation**

- 链接：[databricks.com/blog/best-practices-and-methods-llm-evaluation](https://www.databricks.com/blog/best-practices-and-methods-llm-evaluation)
- 内容：涵盖自动化工具、LLM-as-Judge、人工评测及未来方向（多 Agent 评测等）。

#### 2.2 业界专家深度文章

**Hamel Husain — LLM Evals: Everything You Need to Know（必读）**

- 链接：[hamel.dev/blog/posts/evals-faq](https://hamel.dev/blog/posts/evals-faq/)
- 内容：业界最受推崇的 LLM 评测 FAQ 指南，源自为 3000+ 学员（含 OpenAI/Anthropic/Google 团队）授课的经验，从入门到高级话题全面覆盖。

**Hamel Husain — Your AI Product Needs Evals**

- 链接：[hamel.dev/blog/posts/evals](https://hamel.dev/blog/posts/evals/)
- 内容：以真实产品 Lucy 为案例，展示如何通过系统化评测打破 AI 产品的质量瓶颈。

**Hamel Husain — Using LLM-as-a-Judge: A Complete Guide**

- 链接：[hamel.dev/blog/posts/llm-judge](https://hamel.dev/blog/posts/llm-judge/)
- 内容：专门讲解 LLM-as-a-Judge 的实操指南，来自帮助 30+ 企业搭建评测系统的实战经验。

**Pragmatic Engineer × Hamel — A Pragmatic Guide to LLM Evals for Devs**

- 链接：[newsletter.pragmaticengineer.com/p/evals](https://newsletter.pragmaticengineer.com/p/evals)
- 内容：面向开发者的 LLM 评测实用指南，涵盖 vibe-check 陷阱、错误分析核心工作流等。

#### 2.3 综合教程与方法论

**Braintrust — What Is Prompt Evaluation**

- 链接：[braintrust.dev/articles/what-is-prompt-evaluation](https://www.braintrust.dev/articles/what-is-prompt-evaluation)
- 内容：系统介绍 Prompt 评测的概念，涵盖 Golden Dataset、LLM-as-a-Judge 评分、Rubric 设计和回归测试。

**Braintrust — LLM Evaluation Metrics Guide**

- 链接：[braintrust.dev/articles/llm-evaluation-metrics-guide](https://www.braintrust.dev/articles/llm-evaluation-metrics-guide)
- 内容：全面的 LLM 评测指标指南，涵盖通用输出指标、RAG 指标和专用场景指标，含代码实现示例。

**Evidently AI — 30 LLM Evaluation Benchmarks**

- 链接：[evidentlyai.com/llm-guide/llm-benchmarks](https://www.evidentlyai.com/llm-guide/llm-benchmarks)
- 内容：详解 30 个 LLM 评测基准（从 MMLU 到 Chatbot Arena），附数据集链接和排行榜。

**Codecademy — LLM Evaluation: Metrics, Benchmarks & Best Practices**

- 链接：[codecademy.com/article/llm-evaluation-metrics-benchmarks-best-practices](https://www.codecademy.com/article/llm-evaluation-metrics-benchmarks-best-practices)
- 内容：面向初学者的 LLM 评测完整指南，介绍 BLEU、ROUGE、GLUE、SuperGLUE 等指标。

#### 2.4 学术论文

**The Prompt Report: A Systematic Survey of Prompting Techniques**

- 链接：[arxiv.org/abs/2406.06608](https://arxiv.org/abs/2406.06608)
- 内容：目前最全面的 Prompt Engineering 综述论文，定义 33 个术语、分类 58 种 LLM Prompt 技术和 40 种多模态技术。

**The LLM Evaluation Guidebook**

- 中文解读：[zhuanlan.zhihu.com/p/1982554727729362498](https://zhuanlan.zhihu.com/p/1982554727729362498)
- 内容：基于 3 年评测 15000 个模型的经验，解答如何判断一个模型是否优秀。

**Evaluation and Benchmarking of LLM Agents: A Survey**

- 链接：[dl.acm.org/doi/abs/10.1145/3711896.3736570](https://dl.acm.org/doi/abs/10.1145/3711896.3736570)
- 内容：LLM Agent 评测领域的综述论文，提出二维分类法（评测目标 × 评测方法）。

#### 2.5 中文优质资源

**AI 评测入门（二）：Prompt 迭代实战**

- 链接：[zhuanlan.zhihu.com/p/1948411153165312780](https://zhuanlan.zhihu.com/p/1948411153165312780)
- 内容：中文 Prompt 评测实战教程，以产品评价打标签为例，从零迭代出可工程化落地的 Prompt。

**一文掌握 Prompt：万能框架 + 优化技巧 + 常用指标**

- 链接：[cloud.tencent.com/developer/article/2440609](https://cloud.tencent.com/developer/article/2440609)
- 内容：腾讯云出品的体系化 Prompt 指南，包含万能模板、细化框架、CoT 技巧和评测常用指标。

**HuggingFace — 让 LLM 来评判：设计你自己的评估 Prompt**

- 链接：[cnblogs.com/huggingface/p/18741971](https://www.cnblogs.com/huggingface/p/18741971)
- 内容：讲解如何设计 LLM-as-Judge 的评估 Prompt，包括精细评分细则、推理步骤、成对比较等技巧。

**Prompt Engineering 进阶实战：从套路到方法论**

- 链接：[eastondev.com/blog/zh/posts/ai/20260417-prompt-engineering-advanced-practice](https://eastondev.com/blog/zh/posts/ai/20260417-prompt-engineering-advanced-practice/)
- 内容：深度解析 Chain-of-Thought、ReAct、DSPy 等技术，建立可评估、可迭代的 Prompt 工程体系。

---

### 三、GitHub 开源评测工具与项目

#### 3.1 综合评测框架

| 项目 | Star | 简介 |
| --- | --- | --- |
| [openai/evals](https://github.com/openai/evals) | ~17.6k | OpenAI 官方评测框架，内置大量评测模板，支持自定义 eval |
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | ~17-19k | Prompt/Agent/RAG 评测与红队测试 CLI，2026年3月被 OpenAI 收购 |
| [EleutherAI/lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) | ~7.4k | 学术标准评测框架，HF Leaderboard 后端引擎，200+ 学术基准 |
| [confident-ai/deepeval](https://github.com/confident-ai/deepeval) | ~7k+ | 类 Pytest 的 LLM 单元测试框架，50+ 内置评测指标 |
| [explodinggradients/ragas](https://github.com/explodinggradients/ragas) | ~7k+ | RAG 专项评估框架，四大核心指标 |
| [open-compass/opencompass](https://github.com/open-compass/opencompass) | ~5k+ | 上海 AI Lab 出品，100+ 数据集，中文评测出色 |

#### 3.2 专项评测工具

| 项目 | Star | 简介 |
| --- | --- | --- |
| [EvolvingLMMs-Lab/lmms-eval](https://github.com/EvolvingLMMs-Lab/lmms-eval) | ~3.4k | 多模态大模型评估框架，80+ 多模态数据集 |
| [truera/trulens](https://github.com/truera/trulens) | ~3k+ | LLM 实验评估与追踪，RAG 三元组评估 |
| [huggingface/lighteval](https://github.com/huggingface/lighteval) | ~2k+ | 轻量级 LLM 评测工具包，183 个预置任务 |
| [microsoft/promptbench](https://github.com/microsoft/promptbench) | ~2.3k | Prompt 鲁棒性评测，支持对抗性攻击评估 |
| [Eladlev/AutoPrompt](https://github.com/Eladlev/AutoPrompt) | ~2k+ | Prompt 自动优化框架 |

#### 3.3 大厂官方评测项目

| 项目 | Star | 简介 |
| --- | --- | --- |
| [anthropics/evals](https://github.com/anthropics/evals) | ~335 | Anthropic 官方评估框架，2026年1月开源 |
| [langchain-ai/openevals](https://github.com/langchain-ai/openevals) | ~280+ | LangChain 的 LLM 应用评估器集合 |
| [langchain-ai/agentevals](https://github.com/langchain-ai/agentevals) | 较新 | Agent 轨迹评估专项评估器 |

#### 3.4 安全评估与红队测试

| 项目 | Star | 简介 |
| --- | --- | --- |
| [Giskard-AI/giskard-oss](https://github.com/Giskard-AI/giskard-oss) | ~1k+ | AI 安全测试框架，内置漏洞扫描器 |
| [lakeraai/pint-benchmark](https://github.com/lakeraai/pint-benchmark) | ~200+ | Prompt Injection 测试基准 |

#### 3.5 中文评测基准

| 项目 | Star | 简介 |
| --- | --- | --- |
| [CLUEbenchmark/SuperCLUE](https://github.com/CLUEbenchmark/SuperCLUE) | ~1.5k | 中文通用大模型综合性测评基准 |
| [CLUEbenchmark/CLUE](https://github.com/CLUEbenchmark/CLUE) | ~3k+ | 中文语言理解评测基准 |

#### 3.6 Awesome 资源列表

| 项目 | 简介 |
| --- | --- |
| [onejune2018/Awesome-LLM-Eval](https://github.com/onejune2018/Awesome-LLM-Eval) | LLM 评测资源大全，按任务分类，含垂直领域基准 |
| [priyathamkat/Awesome-LLM-Evaluation](https://github.com/priyathamkat/Awesome-LLM-Evaluation) | LLM 评估资源列表 |
| [free-gpt/awesome-LLM-benchmarks](https://free-gpt.github.io/awesome-LLM-benchmarks/) | 大模型评测数据集和工具大全 |

#### 3.7 评测教程 Notebook

**NirDiamant — Evaluating Prompt Effectiveness**

- 链接：[github.com/NirDiamant/Prompt_Engineering](https://github.com/NirDiamant/Prompt_Engineering/blob/main/all_prompt_engineering_techniques/evaluating-prompt-effectiveness.ipynb)
- 内容：可运行的 Jupyter Notebook，覆盖手动和自动化两种 Prompt 评测技术的实操。

---

### 四、工具选型建议

根据不同场景，推荐如下选型路径：

**通用 LLM/Prompt 评测对比**：首选 promptfoo（声明式配置，支持多模型对比）或 lm-evaluation-harness（学术标准基准）

**RAG 系统评估**：首选 ragas（四大核心指标），配合 trulens 做可观测性追踪

**开发阶段单元测试**：首选 deepeval（类 Pytest 体验，50+ 内置指标），可集成 CI/CD

**安全红队测试**：首选 promptfoo（内置红队能力）或 giskard-oss（漏洞扫描器）

**中文场景评测**：首选 opencompass（中文评测支持出色），配合 SuperCLUE 基准

**内部业务评测**：优先使用 EvalCap（Python）或 PikaEval（Java），已深度适配内部基础设施

---

### 五、推荐学习路径

**入门阶段**

- 先学 Anthropic 的 Prompt Evaluations 9 课时课程（含实操 Notebook）
- 再读 Hamel Husain 的 LLM Evals FAQ 建立完整概念框架

**实操阶段**

- 用 promptfoo 或 deepeval 动手搭建评测流水线
- 配合 OpenAI Evals API 或 LangSmith 进行迭代

**深入阶段**

- 阅读 Hugging Face Evaluation Guidebook 系统理解评测理论
- 研读 The Prompt Report 论文了解评测技术全景

**生产阶段**

- 掌握 Hamel 的 LLM-as-Judge 指南
- 将评测嵌入 CI/CD 开发流程
- 参考内部 EvalCap/PikaEval 框架对比，选择适合团队技术栈的方案

---

*本文档整理于 2026 年 4 月 23 日，后续将持续更新。如有补充资料，欢迎编辑本文档。*