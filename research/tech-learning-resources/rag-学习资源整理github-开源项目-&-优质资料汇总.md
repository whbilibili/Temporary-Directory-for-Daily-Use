# RAG 学习资源整理：GitHub 开源项目 & 优质资料汇总

> 本文由 CatPaw 整理生成，收录时间：2026-04-09。
> 内容来源于 GitHub 开源项目及公开网络资料，信息时效性请以原始链接为准。

---

RAG（Retrieval-Augmented Generation，检索增强生成）是当前大模型落地的核心技术路径之一。本文整理了市面上主流的 RAG 学习开源项目与资料，涵盖系统教程、实战课程、论文资源合集等多个维度，适合不同阶段的学习者参考。

### 一、系统教程类

#### 1. All-in-RAG（DataWhale 出品）

**链接**：[https://github.com/datawhalechina/all-in-rag](https://github.com/datawhalechina/all-in-rag)
**在线阅读**：[https://datawhalechina.github.io/all-in-rag/](https://datawhalechina.github.io/all-in-rag/)

DataWhale 社区出品的 RAG 技术全栈教程，面向大模型应用开发者，通过体系化学习路径和动手实践项目，帮助开发者掌握基于大语言模型的 RAG 应用开发技能，目标是构建生产级的智能问答和知识检索系统。

主要内容涵盖：RAG 基础概念与环境配置、文档加载与文本分块、向量嵌入与向量数据库（含 Milvus 实践）、索引优化、检索策略、响应生成、RAG 评估，以及 Agentic RAG 进阶专题。项目采用 CC BY-NC-SA 4.0 协议，欢迎社区投稿 Extra Chapter。

**适合人群**：有 Python 基础、希望系统学习 RAG 全栈技术的开发者。

---

#### 2. LLM-RAG（面向零基础小白）

**链接**：[https://github.com/hitimnewhere/LLM-RAG](https://github.com/hitimnewhere/LLM-RAG)

从实践出发，结合最常见的个人知识库助手项目，深入浅出地拆解 LLM 开发的一般流程与步骤。旨在帮助没有算法基础的小白通过一个课程完成大模型开发的基础入门，同时涵盖 RAG 开发进阶技巧和成功 LLM 应用案例解读。

主要内容：大型语言模型 LLM 介绍、RAG 基础流程、个人知识库助手项目实战、进阶 RAG 开发技巧。

**适合人群**：仅需掌握基本 Python 语法，无算法基础要求，适合完全零基础入门者。

---

#### 3. RAG-LEARN（踩坑实录）

**链接**：[https://github.com/GalaxyXieyu/RAG-LEARN](https://github.com/GalaxyXieyu/RAG-LEARN)

专注于介绍 RAG 实际落地中的"坑"和解决方法，并附有各种解决方案的代码。内容包括数据处理、模型选择、构建流程以及优化方法等，是一份来自实战经验的避坑指南。

**适合人群**：正在学习 RAG 或进行 RAG 项目搭建、希望少走弯路的开发者。

---

### 二、实战课程类

#### 4. rag-in-action（极客时间 RAG 训练营配套）

**链接**：[https://github.com/huangjia2019/rag-in-action](https://github.com/huangjia2019/rag-in-action)

极客时间大模型 RAG 进阶实战营的配套开源代码仓库，由黄佳老师主导。系统拆解 RAG 10 大组件，配套 4 个实操项目，覆盖 RAG 全流程端到端设计、评估与优化。

10 大组件包括：数据导入、文本分块、向量嵌入、向量数据库、检索前处理、索引优化、检索后处理、响应生成、评估，以及 Agentic RAG。课程结合 Cursor、DeepSeek 等工具进行实战演练。

**适合人群**：有一定 Python 基础，希望系统掌握企业级 RAG 项目从 0 到 1 完整开发流程的开发者。

---

#### 5. RAG-Book（《大模型 RAG 实战》配套代码）

**链接**：[https://github.com/Nipi64310/RAG-Book](https://github.com/Nipi64310/RAG-Book)

书籍《大模型 RAG 实战：RAG 原理、应用与系统构建》（2024 年 9 月出版）的配套代码与资料汇总。全书共 8 章，系统讲解 RAG 技术原理、实战应用与系统构建。

章节概览：第 1 章 RAG 发展与 LLM 微调对比；第 2 章 Transformer 基本原理；第 3 章 文本向量化模型（稠密/稀疏向量检索、重排序）；第 4-8 章 RAG 系统构建、高级 RAG、超级 RAG 及评估优化。

**适合人群**：希望结合书籍系统学习 RAG 理论与实践的开发者，适合深度学习初学者到进阶开发者。

---

### 三、资源合集类

#### 6. Awesome-RAG（Danielskry，英文）

**链接**：[https://github.com/Danielskry/Awesome-RAG](https://github.com/Danielskry/Awesome-RAG)
**在线浏览**：[https://noworneverev.github.io/Awesome-RAG/](https://noworneverev.github.io/Awesome-RAG/)

一份精心整理的 RAG 技术资源 Awesome List，系统收录了 RAG 相关的理论知识、实现方法、开发框架、关键技术及评估指标。内容涵盖 RAG Tools/Libraries/Frameworks、RAG Techniques、RAG Papers 等分类，适合英文阅读能力较强、希望追踪前沿技术的研究者和开发者。

**适合人群**：希望全面了解 RAG 生态工具链和前沿论文的研究者/工程师。

---

#### 7. awesome-rag（论文与系统合集）

**链接**：[https://github.com/awesome-rag/awesome-rag](https://github.com/awesome-rag/awesome-rag)

专注于收集整理典型 RAG 论文和系统，涵盖 2022-2024 年的最新进展。内容分为三部分：Survey（调查报告）、Papers（创新性论文）、Benchmark（权威评测基准）。博主 Florian 在此基础上整理了"RAG 七十二式"年度清单，共 72 篇典型论文，逐月为纲，附 AI 注解与摘要。

**适合人群**：希望深入了解 RAG 学术进展、追踪前沿论文的研究者。

---

### 四、飞书文档资料

#### 8. RAG 综合学习资料（飞书 Wiki）

**链接**：[https://dqej47nflyz.feishu.cn/wiki/Xum4w0ksBiwgRTkFKeec2MYwnOp](https://dqej47nflyz.feishu.cn/wiki/Xum4w0ksBiwgRTkFKeec2MYwnOp)

一份飞书 Wiki 上整理的 RAG 综合学习资料，内容涵盖 RAG 全流程的系统性介绍，包括数据加载、文本分块、向量嵌入、多模态嵌入、向量数据库（Milvus）、索引优化等核心模块，配有 PDF 讲义，适合系统学习参考。

**适合人群**：希望获取结构化 RAG 学习材料、配合 PDF 讲义学习的开发者。

---

### 五、延伸阅读

以下是一些值得关注的相关资源：

- **RAGFlow**（infiniflow）：[https://github.com/infiniflow/ragflow](https://github.com/infiniflow/ragflow) — 领先的开源 RAG 引擎，融合前沿 RAG 技术与 Agent 能力，提供端到端 RAG 工作流，适合企业级生产部署。
- **LightRAG**（HKUDS）：[https://github.com/HKUDS/LightRAG](https://github.com/HKUDS/LightRAG) — 支持图结构知识检索的轻量级 RAG 框架，已与 RAG-Anything 多模态系统集成。
- **RAG-Anything**（HKUDS）：[https://github.com/HKUDS/RAG-Anything](https://github.com/HKUDS/RAG-Anything) — 综合性多模态文档处理 RAG 系统，支持文本、图像、表格、公式等多模态内容的处理与检索。
- **胎教级 RAG 全流程教程**（飞书）：[https://waytoagi.feishu.cn/wiki/QBssw7z4oiGS40kDlltcjozBnxc](https://waytoagi.feishu.cn/wiki/QBssw7z4oiGS40kDlltcjozBnxc) — 面向普通人的 RAG 科普，1.6 万字，覆盖 RAG 全流程。
- **最全 RAG 技术概览**（飞书）：[https://docs.feishu.cn/article/wiki/UNRCw5gL0iCwTukfNtacvXChnnd](https://docs.feishu.cn/article/wiki/UNRCw5gL0iCwTukfNtacvXChnnd) — [iki.ai](http://iki.ai) 联合创始人撰写，涵盖数据拆分、向量化、查询重写、查询路由等核心技巧。