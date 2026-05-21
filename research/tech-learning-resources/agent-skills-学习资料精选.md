# Agent Skills 学习资料精选

> Agent Skills 是 Anthropic 于 2025 年 10 月推出、12 月正式发布为开放标准的 AI 能力扩展机制。它让开发者只需编写一个 SKILL.md 文件，就能给 AI Agent 装上可复用的专业技能。目前已被 Cursor、VS Code（GitHub Copilot）、Gemini CLI、OpenAI Codex、OpenHands 等 30+ 工具采用。本文整理了从概念理解到动手实践的优质学习资源。

---

### 一、什么是 Agent Skills？

**一句话定义**：Skill 是一组打包好的指令、脚本和资源，教给 AI 一次，永久受用。

你有没有这种感受：每次让 AI 做同一类事情，都要重新把流程、偏好、规范解释一遍？Skill 就是来解决这个问题的——把重复性的专业知识和工作流程封装成一个文件夹，AI 在需要时自动按需加载，不需要时不占用上下文窗口。

**与其他概念的关系：**

| 概念 | 定位 | 类比 |
| --- | --- | --- |
| Prompt | 单次对话的输入指令 | 临时口头吩咐 |
| Rules / CLAUDE.md | 全局行为准则，始终生效 | 公司规章制度 |
| **Skill** | 特定任务的专业知识包，按需加载 | 员工的专业技能手册 |
| MCP | 连接外部工具和数据源的协议 | 公司的对外合作权限 |

**核心优势：**

- **渐进式加载**：平时只记忆一个简短 description（约 100 词），触发时才加载完整指令（约 5000 词），节省 60-80% Token
- **可复用**：写一次，在 Cursor、Claude Code、VS Code、Gemini CLI 等所有支持 Skills 标准的工具中通用
- **可组合**：多个 Skill 可以协同工作，复杂任务拆分为多个专业 Skill 分工完成
- **可执行**：不只是文字说明，还可以包含脚本、模板、参考资料

---

### 二、官方资源

#### 1. Agent Skills 官方规范

- **链接**：https://openagentskills.dev
- **中文版**：https://openagentskills.dev/zh
- **简介**：Agent Skills 开放标准的官方规范站点，定义了 SKILL.md 文件格式、目录结构、元数据字段等完整技术规范。是编写 Skill 的权威参考，包含 SKILL.md 编写指南、最佳实践和示例。

#### 2. Anthropic 官方 Skills 仓库

- **链接**：https://github.com/anthropics/skills
- **简介**：Anthropic 官方开源的 Skills 示例仓库，包含 50+ 高质量 Skill，覆盖创意设计、文档处理、开发工具、企业协作等多个领域。每个 Skill 都是标准实现的最佳示范，可直接安装使用，也可作为自定义 Skill 的参考模板。采用 Apache 2.0 开源协议。

#### 3. CatPaw Skill 用户手册

- **链接**：https://catpaw.meituan.com/guides/settings/skill
- **简介**：美团 CatPaw（猫爪 IDE）的官方 Skill 使用文档，介绍了在 CatPaw 中如何安装、管理和使用 Skill，以及 CatDesk 环境下的 Skill 特性说明。

#### 4. VS Code Agent Skills 文档

- **链接**：https://vscode.js.cn/docs/copilot/customization/agent-skills
- **简介**：微软官方的 VS Code Agent Skills 使用文档，介绍如何在 VS Code + GitHub Copilot 环境中使用 Skills，包括安装方式和与自定义指令的区别。

---

### 三、核心概念：SKILL.md 文件结构

一个 Skill 就是一个文件夹，最小结构只需一个 `SKILL.md` 文件：

```
my-skill/
├── SKILL.md          # 必须，核心指令文件
├── scripts/          # 可选，可执行脚本
├── references/       # 可选，参考文档（按需加载）
└── assets/           # 可选，模板和静态资源
```

`SKILL.md` 文件由两部分组成：

**YAML Frontmatter（元数据）**：

```yaml
---
name: skill-name
description: >
  从 PDF 文件中提取文本和表格，填写 PDF 表单，合并多个 PDF。
  在处理 PDF 文档时使用。
---
```

- `name`：Skill 的唯一标识符
- `description`：**最关键的字段**，决定 AI 何时触发这个 Skill。要写清楚"做什么"和"什么时候用"，建议 50-150 词，包含具体触发词

**Markdown 正文（指令内容）**：

正文是 AI 执行任务时的操作手册，没有严格格式要求，写任何有助于 AI 成功完成任务的内容即可，通常包括：触发场景说明、分步操作流程、输出格式规范、注意事项和常见错误。

---

### 四、入门教程

#### 5. 万字详解 Agent Skills（JavaGuide）

- **链接**：https://javaguide.cn/ai/agent/skills.html
- **简介**：深入解析 Agent Skills 概念的中文长文，探讨 Skills 与 Prompt、MCP、Function Calling 的本质区别，以及如何在实战中设计优秀的 Skill 固化代码规范。内容全面，适合系统了解 Skills 的定位和使用场景。

#### 6. 构建 Skills 的完整指南（知乎）

- **链接**：https://zhuanlan.zhihu.com/p/2015213930868397522
- **简介**：Anthropic 官方完整指南的中文精华整理，重点解析了 5 种 Skill 设计模式，以及"渐进式展示"三层架构（100 词元数据 -> 5000 词主体 -> 资源按需加载）的设计原理。

#### 7. 为 AI Agent 编写高质量 Skill（掘金）

- **链接**：https://juejin.cn/post/7612486041334136842
- **简介**：Claude 官方 30+ 页《The Complete Guide to Building Skills》的中文精华版，提炼了编写高质量 Skill 的核心原则，包括 description 编写技巧、指令结构设计和常见陷阱。

#### 8. 火爆全网的 Skill 自己怎么做？（阿里云开发者）

- **链接**：https://developer.aliyun.com/article/1708134
- **简介**：实战向的 Skill 开发教程，作者亲测踩坑后提炼的 6 步实操流程与避坑公式，适合零基础开发者快速上手，包含具体的 description 编写公式和常见错误示例。

#### 9. 动手写 Agent Skill 前，这些规范你一定要知道（知乎）

- **链接**：https://zhuanlan.zhihu.com/p/2001774360579564956
- **简介**：详细介绍 SKILL.md 文件规范和目录结构设计，包含 scripts/、references/、assets/ 各目录的作用说明，以及完整的格式示例，适合在动手写 Skill 前阅读。

#### 10. skill-creator 使用教程（菜鸟教程）

- **链接**：https://www.runoob.com/claude-code/skill-creator-usage.html
- **简介**：介绍 skill-creator 这个"元 Skill"的使用方法——它能引导你一步步描述要创建的技能，自动输出正确格式的 SKILL.md。对于不熟悉 Skill 格式的初学者，用 skill-creator 来生成第一个 Skill 是最快的入门方式。

---

### 五、进阶学习

#### 11. Agent Skills 开放标准深度解析（Tony Bai）

- **链接**：https://tonybai.com/2025/12/19/anthropic-agent-skills-open-standard-launch/
- **简介**：2025 年 12 月 18 日 Anthropic 正式发布 Agent Skills 开放标准当天的深度解读文章，分析了 Skills 在 AI 开放生态中的战略定位，以及与 MCP 的互补关系。

#### 12. 从 Prompt 工程到 Skill 工程（阿里云开发者）

- **链接**：https://developer.aliyun.com/article/1710634
- **简介**：从工程视角对比 Prompt 工程和 Skill 工程的差异，介绍 Agent Skills 开放标准如何改变 AI 编程范式，适合有 Prompt Engineering 基础的开发者进阶阅读。

#### 13. Agent Skills、Rules、Prompt、MCP 一文理清（腾讯云）

- **链接**：https://cloud.tencent.com/developer/article/2623459
- **简介**：系统梳理 AI 开发中四个核心概念的定位和区别，帮助开发者在实际项目中做出正确的技术选型，避免混用或重复建设。

#### 14. Agent Skills 深度解析：渐进式封装与按需加载（掘金）

- **链接**：https://juejin.cn/post/7596926832912482367
- **简介**：深入分析 Agent Skills 的渐进式加载机制和按需封装原理，对比 MCP 的工具调用模式，帮助开发者理解 Skills 的底层设计哲学。

#### 15. Anthropic 官方 Skills 仓库全览（ClaudeCN）

- **链接**：https://claudecn.com/blog/claude-official-skills-walkthrough/
- **简介**：逐一拆解 Anthropic 官方 Skills 仓库中的 17 个一级 Skills 目录，按创意设计、文档处理、开发工具、企业协作、元技能五个方向分类，附安装命令和核心机制解析，是了解官方 Skill 生态的最佳导览。

#### 16. Skill 设计白皮书：Anthropic 官方推荐的构建方法（腾讯云）

- **链接**：https://cloud.tencent.com/developer/article/2637141
- **简介**：基于 Anthropic 官方指南整理的 Skill 设计白皮书，涵盖 Skill 机制原理、SKILL.md 核心文件设计、渐进式加载设计原则，以及官方推荐的构建方法和常见陷阱。

---

### 六、工具与生态

#### 17. AgentSkills 跨平台管理工具（V2EX）

- **链接**：https://www.v2ex.com/t/1201221
- **简介**：一个跨平台桌面应用（macOS/Windows/Linux），用于统一管理 Claude Code、Cursor、Gemini CLI 等不同工具中的 Skills。解决了在多个 AI 工具间手动复制、改格式的痛点，支持一键同步。

#### 18. GitHub 万星 Skills 合集盘点（博客园）

- **链接**：https://www.cnblogs.com/qiniushanghai/p/19806167
- **简介**：盘点 GitHub 上高质量的 Skills 合集仓库，介绍 Agent Skills 开放标准的生态现状，以及 Cursor、VS Code、Gemini CLI 等 30+ 工具的支持情况，适合了解 Skills 生态全貌。

---

### 七、美团内部：CatDesk Skill 广场

美团内部的 CatDesk（CatPaw Desk）平台提供了 **Friday Skill 广场**，是美团内部 Skill 的发现、分享和管理平台。

**核心功能：**

- 搜索和浏览内部已有的 Skill，避免重复开发
- 下载他人发布的 Skill 到本地使用
- 将自己开发的 Skill 发布到广场供团队共享
- 管理 Skill 的版本和更新

**使用方式**：在 CatDesk 中通过 `friday-skill-cli` Skill 或直接访问 Friday Skill 广场进行操作。

**建议**：在开发新 Skill 之前，先在广场搜索是否已有类似实现，避免重复造轮子。

---

### 八、编写 Skill 的核心原则

**description 是最重要的字段**：它决定 AI 是否能在正确的时机触发你的 Skill。好的 description 应该包含：做什么（功能描述）+ 什么时候用（触发场景）+ 关键触发词。

**渐进式披露原则**：把最重要的信息放在 SKILL.md 主体，把详细的参考资料放在 references/ 目录，让 AI 按需加载，避免一次性塞入过多内容。

**指令要具体可执行**：不要写"处理好文件"，要写"读取文件 -> 执行步骤 A -> 输出格式 B"，越具体 AI 执行越稳定。

**单一职责**：一个 Skill 只做一件事，复杂任务拆分为多个 Skill 协作，比一个大而全的 Skill 更可靠、更易维护。

**测试驱动**：写完 Skill 后，用真实场景测试触发是否准确、执行是否符合预期，根据结果迭代优化 description 和指令。

---

*整理时间：2025 年*
*资料来源：Anthropic 官方文档、GitHub、知乎、掘金、阿里云开发者、腾讯云开发者等*
