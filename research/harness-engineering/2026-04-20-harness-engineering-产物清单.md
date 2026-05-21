# Harness Engineering 产物清单

## 📋 概述

根据 README.md 的目录结构规范，已将 Harness Engineering 相关产物整理到合适的位置。

---

## 📍 产物位置

### 1️⃣ 研究文档 → `research/`

**文件**：`research/2026-04-20-harness-engineering-实战指南.md`

**内容**：
- 驾驭工程六大支柱的详细实施指南
- 每个支柱的原则、规则、实施步骤
- 完整的项目模板和快速启动脚本
- 常见问题解答

**用途**：
- 深度技术调研产出
- 有结论和参考价值
- 可作为团队培训材料

**大小**：~16KB

---

### 2️⃣ 示例项目 → `projects/harness-engineering-example/`

**项目结构**：
```
projects/harness-engineering-example/
├── README.md                    # 项目说明
├── SOUL.md                      # Agent 人格定义
├── USER.md                      # 用户画像
├── AGENTS.md                    # 全局规则索引
├── MEMORY.md                    # 长期记忆
├── memory/
│   └── 2026-04-20.md           # 今日工作日志
└── src/
    └── agent-config.js         # Agent 配置（工具禁令、验证规则）
```

**各文件说明**：

| 文件 | 支柱 | 说明 |
|------|------|------|
| SOUL.md | 1,2,3 | Agent 人格定义、工具禁令、验证规则 |
| USER.md | 1 | 用户画像、技术栈、常见问题 |
| AGENTS.md | 2,5 | 全局规则索引、工具禁令表、知识库规则 |
| MEMORY.md | 5 | 长期记忆、工具踩坑、业务规则、验证来源 |
| memory/2026-04-20.md | 5 | 日常工作日志、错误→规则固化案例 |
| src/agent-config.js | 2,3,4,5 | 工具禁令、验证引擎、上下文隔离、知识门控 |

**用途**：
- 有一定规模的小项目
- 包含代码、配置、说明文档
- 可直接参考或复用

**大小**：~50KB

---

## 🎯 六大支柱实施情况

### ✅ 已完成

| 支柱 | 文件位置 | 实施内容 |
|------|---------|---------|
| 1️⃣ 上下文架构 | SOUL.md, USER.md, memory/ | 分层加载、按需注入 |
| 2️⃣ 架构约束 | SOUL.md, AGENTS.md, src/agent-config.js | 工具禁令、约束分级 |
| 3️⃣ 自验证循环 | SOUL.md, src/agent-config.js | 验证触发、证伪优先、低分拒答 |
| 4️⃣ 上下文隔离 | src/agent-config.js | 子 agent 分流、并发安全 |
| 5️⃣ 熵治理 | AGENTS.md, MEMORY.md, src/agent-config.js | 写入门控、自愈 SOP、知识蒸馏 |
| 6️⃣ 可拆卸性 | README.md | 规划中（待创建 SKILL.md） |

### ⏳ 待完成

- [ ] `src/verification.js` - 完整的验证引擎实现
- [ ] `tests/harness.test.js` - 规则回测用例
- [ ] `docs/implementation-guide.md` - 详细实施指南
- [ ] `SKILL.md` - 可拆卸性示例

---

## 📚 使用指南

### 快速开始（5 分钟）

1. **阅读实战指南**
   ```
   research/2026-04-20-harness-engineering-实战指南.md
   ```
   了解六大支柱的核心概念

2. **查看示例项目**
   ```
   projects/harness-engineering-example/README.md
   ```
   了解项目结构和实施方式

3. **学习配置文件**
   ```
   projects/harness-engineering-example/src/agent-config.js
   ```
   查看如何硬编码约束

### 深度学习（1-2 小时）

1. **理解 Agent 人格**
   - 阅读 `SOUL.md`
   - 理解工具禁令和验证规则

2. **理解用户画像**
   - 阅读 `USER.md`
   - 了解技术栈和常见问题

3. **理解全局规则**
   - 阅读 `AGENTS.md`
   - 理解规则分级和演化流程

4. **理解长期记忆**
   - 阅读 `MEMORY.md`
   - 学习知识蒸馏和写入门控

5. **理解工作日志**
   - 阅读 `memory/2026-04-20.md`
   - 学习错误→规则固化流程

### 实施应用（1-2 周）

按照实战指南的三个阶段实施：

**第一阶段**（1-2 周）：建立基础
- 定义 SOUL.md 和 USER.md
- 硬编码工具禁令
- 实施验证引擎

**第二阶段**（2-4 周）：完善体系
- 建立知识库管理
- 实施上下文隔离
- 建立错误→规则固化流程

**第三阶段**（持续）：持续改进
- 收集 Agent 犯错案例
- 识别错误模式
- 提取为规则
- 回测验证

---

## 🔗 相关资源

### 原始技能
- 路径：`/Users/wanghong/.catpaw/skills/skills-market/harness-engineering-guide/SKILL.md`
- 作者：pengwenrui
- 理论基础：Mitchell Hashimoto 的 Harness Engineering（2026.2.5）

### 项目文档
- 实战指南：`research/2026-04-20-harness-engineering-实战指南.md`
- 示例项目：`projects/harness-engineering-example/`
- 本清单：`inbox/2026-04-20-harness-engineering-产物清单.md`

---

## 📊 产物统计

| 类型 | 数量 | 大小 |
|------|------|------|
| 研究文档 | 1 | 16KB |
| 项目文件 | 7 | 50KB |
| 代码文件 | 1 | 8KB |
| 总计 | 9 | 74KB |

---

## ✨ 核心价值

### 驾驭工程的三个层次

1. **理论层**（research/）
   - 理解六大支柱
   - 学习最佳实践
   - 掌握核心概念

2. **实施层**（projects/）
   - 看到具体实现
   - 学习如何应用
   - 参考项目模板

3. **应用层**（待完成）
   - 集成到现有系统
   - 建立反馈循环
   - 持续改进

### 错误→规则固化流程

```
犯错 → 识别模式 → 固化规则 → 回测验证 → 规则生效
                                  ↑                |
                                  └────── 反馈 ←───┘
```

这是驾驭工程最核心的价值：**把每一次错误变成系统的免疫力**。

---

## 🎓 学习路径建议

### 初学者（第一天）
1. 阅读本清单（5 分钟）
2. 阅读 README.md（10 分钟）
3. 阅读 SOUL.md（15 分钟）
4. 浏览 agent-config.js（10 分钟）

### 进阶者（第二天）
1. 阅读实战指南（1 小时）
2. 阅读 AGENTS.md（30 分钟）
3. 阅读 MEMORY.md（30 分钟）
4. 阅读工作日志（20 分钟）

### 实施者（第三周）
1. 按照实战指南第一阶段实施
2. 定义自己的 SOUL.md 和 USER.md
3. 硬编码工具禁令
4. 实施验证引擎

---

## 📝 下一步行动

### 立即可做
- [ ] 阅读实战指南
- [ ] 查看示例项目
- [ ] 理解六大支柱

### 本周可做
- [ ] 定义团队的 SOUL.md
- [ ] 定义团队的 USER.md
- [ ] 硬编码工具禁令

### 本月可做
- [ ] 实施验证引擎
- [ ] 建立知识库管理
- [ ] 建立错误→规则固化流程

### 持续改进
- [ ] 收集 Agent 犯错案例
- [ ] 识别错误模式
- [ ] 提取为规则
- [ ] 回测验证

---

**创建时间**：2026-04-20
**产物位置**：
- 研究：`research/2026-04-20-harness-engineering-实战指南.md`
- 项目：`projects/harness-engineering-example/`
- 清单：`inbox/2026-04-20-harness-engineering-产物清单.md`

**下一步**：整理 inbox，将本清单移到 research 或 projects
