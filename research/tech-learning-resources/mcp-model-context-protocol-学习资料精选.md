# MCP（Model Context Protocol）学习资料精选

> MCP（模型上下文协议）是 Anthropic 于 2024 年 11 月发布的开放标准，旨在统一 AI 模型与外部数据源、工具之间的交互方式。本文整理了从入门到进阶的优质学习资源，帮助开发者系统掌握 MCP 开发。

---

### 一、什么是 MCP？

MCP（Model Context Protocol，模型上下文协议）是一种开放标准，定义了 AI 应用程序与外部系统之间交换上下文信息的方式。你可以把它理解为 **AI 领域的"USB-C 接口"**：

- USB-C 出现之前，每个外设都需要自己的驱动和接口，非常混乱；USB-C 出现后，所有设备遵循同一标准，即插即用。
- MCP 出现之前，每个 AI 助手要连接一个新工具（如数据库、API），都需要专门开发适配器；MCP 出现后，开发者通过统一协议即可连接任意外部能力。

**MCP 能做什么？**

- 让 AI 助手访问本地文件系统、数据库、云服务
- 让 Claude、ChatGPT 等模型调用搜索引擎、计算器、日历等工具
- 构建可复用的 MCP Server，供多个 AI 应用共享
- 实现 AI Agent 与真实世界的高效交互

**核心架构：**

- **Host**：运行 AI 模型的宿主应用（如 Claude Desktop、Cursor）
- **Client**：在 Host 内部，负责与 MCP Server 通信的客户端
- **Server**：提供具体能力（工具、资源、提示词）的服务端
- **Tools**：可被 AI 调用的具体操作（如读文件、查数据库）
- **Resources**：AI 可访问的数据内容（如文件内容、数据库记录）
- **Prompts**：预定义的提示词模板

---

### 二、官方资源

#### 1. MCP 官方文档

- **链接**：[https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **中文站**：[https://modelcontextprotocol.net.cn](https://modelcontextprotocol.net.cn)
- **简介**：MCP 协议的权威文档，涵盖协议规范、核心概念、快速入门、SDK 使用指南等。官方中文站提供完整的中文翻译，适合中文开发者直接阅读。

#### 2. MCP 官方 GitHub 组织

- **链接**：[https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
- **简介**：包含协议规范、官方 SDK（Python、TypeScript、Java、C#、Kotlin）、参考实现服务器等所有官方仓库。

#### 3. MCP 官方 SDK

- **Python SDK**：[https://github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)
- **TypeScript SDK**：[https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **Java SDK**：[https://github.com/modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk)
- **C# SDK**：[https://github.com/modelcontextprotocol/csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk)
- **简介**：官方多语言 SDK，支持同步/异步 API、多种传输方式（STDIO、HTTP SSE）、完整的工具和资源管理能力。

#### 4. MCP 官方参考服务器

- **链接**：[https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **简介**：官方参考实现集合，包含文件系统、数据库、浏览器控制、代码执行等多种 MCP Server 示例，是学习如何实现 MCP Server 的最佳参考。

#### 5. MCP 学习路径（中文站）

- **链接**：[https://mcpcn.com/docs/learning-path/](https://mcpcn.com/docs/learning-path/)
- **简介**：面向零基础读者的系统学习路径，从"什么是 MCP"到"构建自己的 MCP Server"，每个步骤都有明确的学习目标和检验标准，预计 2 小时可完成入门。

---

### 三、入门教程

#### 6. Microsoft MCP for Beginners（微软官方入门课程）

- **链接**：[https://github.com/microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners)
- **简介**：微软开源的 MCP 系统性入门课程，包含 10 个模块化章节，从核心概念到实战部署全覆盖。支持 C#、Java、JavaScript、TypeScript、Python 五种编程语言的实践示例，并提供 40 多种语言的本地化版本（含中文）。配套 MCP 计算器演示项目，整合 Azure 云服务和 Discord 社区支持，适合 AI 开发者、系统架构师及软件工程师系统学习。

#### 7. Hugging Face MCP Course

- **链接**：[https://github.com/huggingface/mcp-course](https://github.com/huggingface/mcp-course)
- **中文站**：[https://www.mcpcourse.org/zh/](https://www.mcpcourse.org/zh/)
- **简介**：Hugging Face 出品的 MCP 完整课程，提供中英文双语支持，从入门到实战的 MCP 开发指南。基于 Hugging Face 开源项目，结合实际案例讲解 MCP 的核心概念和开发实践。

#### 8. MCP 学习指南（中文）

- **链接**：[https://github.com/XiaomingHuang/mcp-learning-guide](https://github.com/XiaomingHuang/mcp-learning-guide)
- **简介**：中文 MCP 学习指南，帮助开发者系统地从基础概念到高级应用学习 MCP，内容涵盖协议原理、开发实践和应用场景。

#### 9. MCP 一篇就够了（知乎）

- **链接**：[https://zhuanlan.zhihu.com/p/29001189476](https://zhuanlan.zhihu.com/p/29001189476)
- **简介**：高质量的中文 MCP 入门文章，用通俗语言解释 MCP 的核心概念，配有精良的图解，帮助快速建立对 MCP 的整体认知。

---

### 四、开发框架

#### 10. FastMCP 2.0（Python 最佳实践框架）

- **链接**：[https://github.com/jlowin/fastmcp](https://github.com/jlowin/fastmcp)
- **中文文档**：[https://fastmcp.wiki/zh/](https://fastmcp.wiki/zh/)
- **简介**：构建 MCP 服务器和客户端的标准 Python 框架，比官方 SDK 更简洁易用。FastMCP 1.0 已被纳入官方 MCP Python SDK，当前 2.0 版本新增完整客户端支持、服务器组合、OpenAPI/FastAPI 集成、远程服务器代理、内置测试工具等功能。API 设计简洁，支持多种传输模式（Stdio、SSE、内存），极大降低 MCP 开发门槛。

#### 11. Spring AI MCP 支持

- **链接**：[https://docs.springframework.org.cn/spring-ai/reference/guides/getting-started-mcp.html](https://docs.springframework.org.cn/spring-ai/reference/guides/getting-started-mcp.html)
- **简介**：Spring AI 通过 Boot Starter 和注解提供 MCP 支持，使 Java 开发者能够轻松构建 MCP Server 和 Client。Spring 是官方 MCP Java SDK 的关键贡献者，文档提供完整的 Spring 生态集成指南。

---

### 五、MCP Server 资源合集

#### 12. Awesome MCP Servers

- **链接**：[https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- **简介**：GitHub 上最受欢迎的 MCP Server 精选合集，已收录 9000+ 实用 MCP Server，覆盖代码开发、数据分析、内容创作、游戏娱乐等数十个类别，获得 70k+ Star。提供可视化界面和深度搜索功能，帮助开发者快速找到适合自己需求的 MCP Server，避免重复造轮子。

#### 13. MCP Registry（官方注册中心）

- **链接**：[https://registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)
- **简介**：MCP 官方 Server 注册中心，收录经过审核的生产级 MCP Server，可按类别浏览和搜索。

#### 14. MCP Servers 导航站

- **链接**：[https://mcpservers.org](https://mcpservers.org)
- **简介**：第三方 MCP Server 导航站，提供分类浏览、搜索和详情介绍，方便快速发现和集成各类 MCP 能力。

---

### 六、进阶学习

#### 15. MCP 协议规范（官方）

- **链接**：[https://spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)
- **简介**：MCP 协议的完整技术规范，包含消息结构、生命周期、能力协商流程、传输层规范等底层细节，适合需要深入理解协议原理的开发者。

#### 16. MCP TypeScript SDK 核心概念（知乎）

- **链接**：[https://zhuanlan.zhihu.com/p/1919337071274860704](https://zhuanlan.zhihu.com/p/1919337071274860704)
- **简介**：基于官方 TypeScript SDK 的中文详解，涵盖 MCP 核心概念、服务端与客户端交互实现，以及完整的计算器示例代码，适合 TypeScript/JavaScript 开发者快速上手。

#### 17. 2025 最完整 MCP 协议学习路线（CSDN）

- **链接**：[https://blog.csdn.net/gitblog_00183/article/details/152063607](https://blog.csdn.net/gitblog_00183/article/details/152063607)
- **简介**：系统的 MCP 学习路线文章，通过 mcp-for-beginners 开源项目，带领开发者从基础概念到实战部署，包含核心概念图解、多语言实现示例、安全最佳实践和企业级部署方案。

#### 18. 手把手写一个 MCP（掘金）

- **链接**：[https://juejin.cn/post/7530634870236184603](https://juejin.cn/post/7530634870236184603)
- **简介**：详细的 MCP 实战教程，涵盖 MCP 定义、用途、使用方法、底层原理及完整操作流程，通过客户端-服务器架构示例，帮助开发者理解 MCP 的安全隔离和即插即用特性。

---

### 七、学习建议

**入门阶段（1-2 天）：**
先阅读官方中文站的核心概念介绍，再看"MCP 一篇就够了"建立整体认知，然后跟着 MCP 学习路径完成第一个 Hello World。

**实践阶段（1 周）：**
选择自己熟悉的语言（Python 推荐 FastMCP，Java 推荐 Spring AI MCP，TypeScript 推荐官方 SDK），跟着微软 mcp-for-beginners 或 Hugging Face MCP Course 完成实战练习。

**进阶阶段（持续）：**
浏览 awesome-mcp-servers 了解生态，阅读协议规范深入理解底层，尝试开发自己的 MCP Server 并发布到社区。

---

*整理时间：2025 年*
*资料来源：官方文档、GitHub、知乎、掘金、CSDN 等*