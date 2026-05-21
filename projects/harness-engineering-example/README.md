# Harness Engineering 示例项目

这是一个展示如何在实际开发中应用**驾驭工程（Harness Engineering）**六大支柱的完整示例项目。

## 项目概述

本项目演示了如何通过系统化的工程实践，让 AI Agent 不犯已知的错。核心思想是：**每次犯错都工程化地修正，使错误永不再犯**。

## 六大支柱实施

### 1️⃣ 上下文架构（Context Architecture）
**文件**：`SOUL.md`、`USER.md`、`memory/`

分层加载上下文，按需注入，不是什么都塞进去。

```
Session Start →
  1. SOUL.md（人格，必加载）
  2. USER.md（用户画像，必加载）
  3. memory/today.md（近期上下文，必加载）
  4. MEMORY.md（长期记忆，仅主会话加载）
```

### 2️⃣ 架构约束（Architectural Constraints）
**文件**：`src/agent-config.js` 中的 `TOOL_BLACKLIST`

硬编码禁止，不可协商。工具禁令表定义了哪些工具禁止使用及其替代方案。

```javascript
const TOOL_BLACKLIST = {
  'repo_cat': {
    reason: '经常挂死无响应',
    alternative: 'mtcurl REST API'
  }
};
```

### 3️⃣ 自验证循环（Self-Verification Loop）
**文件**：`src/agent-config.js` 中的 `VerificationEngine`

输出前先证伪，不确定就不说。包括：
- 证伪优先（先找反证）
- 低分拒答（相似度不足拒答）
- 推断禁止（推断性结论不输出）

### 4️⃣ 上下文隔离（Context Isolation）
**文件**：`src/agent-config.js` 中的 `ContextIsolation`

子任务之间不互相污染，主会话保持轻量。

```javascript
// 判断是否需要 spawn 子 agent
shouldSpawnSubAgent(task) {
  return (
    task.estimatedToolCalls > 5 ||
    task.estimatedDuration > 30000 ||
    task.isBatchOperation
  );
}
```

### 5️⃣ 熵治理（Entropy Governance）
**文件**：`src/agent-config.js` 中的 `KnowledgeGate`

知识写入有门槛，存量有清理，质量有度量。

```javascript
// 只有 importance >= 0.88 的知识才写入
shouldWriteToKnowledge(knowledge) {
  if (knowledge.importance < 0.88) {
    return { allowed: false };
  }
}
```

### 6️⃣ 可拆卸性（Detachability）
**文件**：`SKILL.md`（待创建）

能力以 Skill 为单位，可独立安装/卸载/替换。

## 项目结构

```
harness-engineering-example/
├── README.md                    # 项目说明（本文件）
├── SOUL.md                      # Agent 人格定义
├── USER.md                      # 用户画像
├── AGENTS.md                    # 全局规则索引（待创建）
├── MEMORY.md                    # 长期记忆（待创建）
├── memory/                      # 日常日志
│   └── 2026-04-20.md           # 今日日志（待创建）
├── src/
│   ├── agent-config.js         # Agent 配置（工具禁令、验证规则）
│   ├── verification.js         # 自验证循环实现（待创建）
│   └── harness.js              # 驾驭工程框架（待创建）
├── tests/
│   └── harness.test.js         # 规则回测（待创建）
└── docs/
    └── implementation-guide.md # 实施指南（待创建）
```

## 快速开始

### 1. 理解六大支柱

阅读 `SOUL.md` 了解 Agent 的核心原则和工具禁令。

### 2. 查看配置

打开 `src/agent-config.js` 查看如何硬编码约束：

```javascript
// 工具禁令
const TOOL_BLACKLIST = { ... };

// 验证触发条件
const VERIFICATION_TRIGGERS = { ... };

// 验证引擎
class VerificationEngine { ... }
```

### 3. 运行示例

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 启动 Agent
npm start
```

## 核心概念

### 错误→规则固化流程

```
犯错 → 识别模式 → 固化规则 → 回测验证 → 规则生效
                                  ↑                |
                                  └────── 反馈 ←───┘
```

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

## 实施建议

### 第一阶段：建立基础（1-2 周）
1. 定义 SOUL.md（Agent 人格）
2. 定义 USER.md（用户画像）
3. 硬编码工具禁令（TOOL_BLACKLIST）
4. 实施验证引擎（VerificationEngine）

### 第二阶段：完善体系（2-4 周）
1. 建立知识库管理（KnowledgeGate）
2. 实施上下文隔离（ContextIsolation）
3. 建立错误→规则固化流程
4. 编写规则回测用例

### 第三阶段：持续改进（持续）
1. 收集 Agent 犯错案例
2. 识别错误模式
3. 提取为规则
4. 回测验证
5. 规则生效

## 常见问题

### Q1：如何判断什么时候需要 spawn 子 agent？
**A**：预估 >5 次 tool call 或 >30s 耗时时 spawn 子 agent。

### Q2：知识库相似度 0.60 是怎么定的？
**A**：这是经验值。< 0.45 直接拒答，0.45-0.60 触发自愈，> 0.60 正常回答。

### Q3：如何处理规则冲突？
**A**：新规则与旧规则矛盾时，以更近期、更具体的为准。

### Q4：如何避免知识库腐烂？
**A**：定期从 daily log 中蒸馏精华到 MEMORY.md，清理过期信息。

## 参考资源

- **原始技能**：`/Users/wanghong/.catpaw/skills/skills-market/harness-engineering-guide/SKILL.md`
- **实战指南**：`../research/2026-04-20-harness-engineering-实战指南.md`
- **理论基础**：Mitchell Hashimoto 的 Harness Engineering（2026.2.5）

## 下一步

1. **完成 AGENTS.md**：定义全局规则索引
2. **完成 MEMORY.md**：建立长期记忆
3. **实现 verification.js**：完整的验证引擎
4. **编写 tests/harness.test.js**：规则回测用例
5. **创建 docs/implementation-guide.md**：详细实施指南

## 许可证

MIT

---

**最后更新**：2026-04-20
