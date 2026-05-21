# Harness Engineering 产物总结

## 📋 概述

已完成 Harness Engineering（驾驭工程）的完整产物整理，包括深度研究文档、可运行的示例项目、以及详细的实施指南。

---

## 📍 产物位置

### 1. 研究文档

**位置**：`research/2026-04-20-harness-engineering-实战指南.md`

**内容**：
- 驾驭工程六大支柱的详细实施指南
- 每个支柱的原则、规则、实施步骤、代码示例
- 完整的项目模板和快速启动脚本
- 常见问题解答和实施建议

**特点**：
- 有深度的技术调研产出
- 有结论和参考价值
- 可作为团队培训材料
- 大小：16KB

---

### 2. 示例项目

**位置**：`projects/harness-engineering-example/`

**项目结构**：
```
harness-engineering-example/
├── README.md                    # 项目说明
├── SOUL.md                      # Agent 人格定义
├── USER.md                      # 用户画像
├── AGENTS.md                    # 全局规则索引
├── MEMORY.md                    # 长期记忆
├── memory/
│   └── 2026-04-20.md           # 工作日志
└── src/
    └── agent-config.js         # Agent 配置
```

**各文件说明**：

| 文件 | 支柱 | 说明 |
|------|------|------|
| **README.md** | 全部 | 项目说明、六大支柱实施情况、快速开始 |
| **SOUL.md** | 1,2,3 | Agent 人格定义、工具禁令、验证规则 |
| **USER.md** | 1 | 用户画像、技术栈、常见问题、编码规范 |
| **AGENTS.md** | 2,5 | 全局规则索引、工具禁令表、知识库规则、规则演化 |
| **MEMORY.md** | 5 | 长期记忆、工具踩坑、业务规则、验证来源 |
| **memory/2026-04-20.md** | 5 | 日常工作日志、错误→规则固化案例 |
| **src/agent-config.js** | 2,3,4,5 | 工具禁令、验证引擎、上下文隔离、知识门控 |

**特点**：
- 有一定规模的小项目
- 包含代码、配置、说明文档
- 可直接参考或复用
- 大小：50KB

---

### 3. 产物清单

**位置**：`inbox/2026-04-20-harness-engineering-产物清单.md`

**内容**：
- 所有产物的位置和用途
- 六大支柱实施情况
- 使用指南和学习路径
- 下一步行动建议

**特点**：
- 新内容的第一落点
- 便于整理和分类
- 大小：8KB

---

## 🎯 六大支柱实施情况

### ✅ 已完成

| 支柱 | 文件位置 | 实施内容 | 代码示例 |
|------|---------|---------|---------|
| **1️⃣ 上下文架构** | SOUL.md, USER.md, memory/ | 分层加载、按需注入 | - |
| **2️⃣ 架构约束** | SOUL.md, AGENTS.md, src/agent-config.js | 工具禁令、约束分级 | TOOL_BLACKLIST |
| **3️⃣ 自验证循环** | SOUL.md, src/agent-config.js | 验证触发、证伪优先、低分拒答 | VerificationEngine |
| **4️⃣ 上下文隔离** | src/agent-config.js | 子 agent 分流、并发安全 | ContextIsolation |
| **5️⃣ 熵治理** | AGENTS.md, MEMORY.md, src/agent-config.js | 写入门控、自愈 SOP、知识蒸馏 | KnowledgeGate |
| **6️⃣ 可拆卸性** | README.md | 规划中（待创建 SKILL.md） | - |

### ⏳ 待完成

- [ ] `src/verification.js` - 完整的验证引擎实现
- [ ] `tests/harness.test.js` - 规则回测用例
- [ ] `docs/implementation-guide.md` - 详细实施指南
- [ ] `SKILL.md` - 可拆卸性示例

---

## 💻 代码实现亮点

### 1. 工具禁令（支柱 2）

```javascript
const TOOL_BLACKLIST = {
  'repo_cat': {
    reason: '经常挂死无响应',
    alternative: 'mtcurl REST API',
    severity: 'CRITICAL'
  },
  'parallel_download': {
    reason: 'mtcurl 挂起时整个 exec 永久卡死',
    alternative: 'serial_with_timeout_30',
    severity: 'CRITICAL'
  }
};
```

### 2. 验证引擎（支柱 3）

```javascript
class VerificationEngine {
  shouldVerify(conclusion) {
    // 检查是否需要验证
  }
  
  async verifyByFalsification(conclusion, context) {
    // 证伪优先 - 先尝试推翻结论
  }
  
  decideBySimilarity(similarity) {
    // 低分拒答 - 根据相似度判断
  }
}
```

### 3. 上下文隔离（支柱 4）

```javascript
class ContextIsolation {
  shouldSpawnSubAgent(task) {
    // 判断是否需要 spawn 子 agent
    return (
      task.estimatedToolCalls > 5 ||
      task.estimatedDuration > 30000 ||
      task.isBatchOperation
    );
  }
}
```

### 4. 知识门控（支柱 5）

```javascript
class KnowledgeGate {
  shouldWriteToKnowledge(knowledge) {
    // 只有 importance >= 0.88 的知识才写入
    if (knowledge.importance < 0.88) {
      return { allowed: false };
    }
  }
}
```

---

## 📚 使用指南

### 快速开始（5 分钟）

1. **阅读项目 README**
   ```
   projects/harness-engineering-example/README.md
   ```

2. **查看工具禁令**
   ```
   projects/harness-engineering-example/src/agent-config.js
   ```

3. **浏览核心原则**
   ```
   projects/harness-engineering-example/SOUL.md
   ```

### 深度学习（1-2 小时）

1. 阅读实战指南（research/）
2. 学习六大支柱的详细实施方式
3. 理解错误→规则固化流程
4. 查看具体代码实现

### 实施应用（1-2 周）

**第一阶段**（1-2 周）：建立基础
- 定义 SOUL.md（Agent 人格）
- 定义 USER.md（用户画像）
- 硬编码工具禁令
- 实施验证引擎

**第二阶段**（2-4 周）：完善体系
- 建立知识库管理
- 实施上下文隔离
- 建立错误→规则固化流程
- 编写规则回测用例

**第三阶段**（持续）：持续改进
- 收集 Agent 犯错案例
- 识别错误模式
- 提取为规则
- 回测验证

---

## 🔑 核心概念

### 错误→规则固化流程

```
犯错 → 识别模式 → 固化规则 → 回测验证 → 规则生效
                                  ↑                |
                                  └────── 反馈 ←───┘
```

这是驾驭工程最核心的价值：**把每一次错误变成系统的免疫力**。

### 验证触发条件

满足**任一**条件，必须先验证再回答：

- [ ] 结论含具体数值/金额/比例/状态码
- [ ] 结论含字段名/表名/方法名
- [ ] 结论含"应该"/"推断"/"大概"/"可能"
- [ ] 知识库相似度 < 0.60
- [ ] 结论涉及写操作（trigger/delete/update）
- [ ] 用户问题含明确时间节点（今天/本周）

### 知识写入门控

| 知识类型 | importance | 是否写入 |
|---------|-----------|---------|
| 源码验证的业务公式 | 0.98 | ✅ |
| 状态机/调用链 | 0.92 | ✅ |
| RDS 表结构 | 0.90 | ✅ |
| 工具踩坑经验 | 0.88 | ✅ |
| 推断/猜测 | — | ❌ |

---

## 📊 产物统计

| 类型 | 数量 | 大小 | 位置 |
|------|------|------|------|
| 研究文档 | 1 | 16KB | research/ |
| 项目文件 | 7 | 50KB | projects/ |
| 代码文件 | 1 | 8KB | projects/src/ |
| 产物清单 | 1 | 8KB | inbox/ |
| **总计** | **10** | **82KB** | - |

---

## 🎓 学习路径建议

### 初学者（第一天）
- [ ] 阅读本总结（10 分钟）
- [ ] 阅读 README.md（10 分钟）
- [ ] 阅读 SOUL.md（15 分钟）
- [ ] 浏览 agent-config.js（10 分钟）

### 进阶者（第二天）
- [ ] 阅读实战指南（1 小时）
- [ ] 阅读 AGENTS.md（30 分钟）
- [ ] 阅读 MEMORY.md（30 分钟）
- [ ] 阅读工作日志（20 分钟）

### 实施者（第三周）
- [ ] 按照实战指南第一阶段实施
- [ ] 定义自己的 SOUL.md 和 USER.md
- [ ] 硬编码工具禁令
- [ ] 实施验证引擎

---

## ✨ 核心价值

### 三个层次

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

### 驾驭工程 vs 传统方法

| 方面 | 传统方法 | 驾驭工程 |
|------|---------|---------|
| 错误处理 | 靠 Agent 判断力 | 硬编码禁止 + 规则固化 |
| 知识管理 | 什么都写入 | 写入门控（importance >= 0.88） |
| 验证方式 | 输出后加标注 | 输出前先证伪 |
| 改进方式 | 被动修复 | 主动学习 + 规则演化 |
| 系统可靠性 | 依赖模型能力 | 依赖工程体系 |

---

## 🚀 下一步行动

### 立即可做（今天）
- [ ] 阅读本总结
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

## 📖 参考资源

### 原始技能
- 路径：`/Users/wanghong/.catpaw/skills/skills-market/harness-engineering-guide/SKILL.md`
- 作者：pengwenrui
- 理论基础：Mitchell Hashimoto 的 Harness Engineering（2026.2.5）

### 项目文档
- 实战指南：`research/2026-04-20-harness-engineering-实战指南.md`
- 示例项目：`projects/harness-engineering-example/`
- 产物清单：`inbox/2026-04-20-harness-engineering-产物清单.md`
- 本总结：`research/2026-04-20-harness-engineering-产物总结.md`

---

## 💬 常见问题

### Q1：如何快速上手？
**A**：先读 README.md（10 分钟），再看 SOUL.md（15 分钟），最后浏览 agent-config.js（10 分钟）。

### Q2：如何应用到现有项目？
**A**：按照实战指南的三个阶段实施，第一阶段 1-2 周建立基础。

### Q3：如何处理规则冲突？
**A**：新规则与旧规则矛盾时，以更近期、更具体的为准。

### Q4：如何避免知识库腐烂？
**A**：定期从 daily log 中蒸馏精华到 MEMORY.md，清理过期信息。

### Q5：如何验证规则是否有效？
**A**：用历史 case 回测，确保规则仍然适用。

---

## 📝 更新记录

| 日期 | 内容 | 状态 |
|------|------|------|
| 2026-04-20 | 创建产物总结 | ✅ 完成 |
| 2026-04-20 | 创建示例项目 | ✅ 完成 |
| 2026-04-20 | 创建实战指南 | ✅ 完成 |
| 待定 | 实现 verification.js | ⏳ 待做 |
| 待定 | 编写规则回测用例 | ⏳ 待做 |
| 待定 | 创建 SKILL.md | ⏳ 待做 |

---

**创建时间**：2026-04-20
**作者**：Agent Engineering Team
**版本**：1.0.0

---

## 🎯 最后的话

驾驭工程的核心是**系统化地把每一次错误变成系统的免疫力**。

不是让 AI 更聪明，而是让 AI **不犯已知的错**。

通过六大支柱的系统化实施，我们可以构建一个高可靠、低幻觉、可持续改进的 Agent 系统。

**开始行动吧！** 🚀
