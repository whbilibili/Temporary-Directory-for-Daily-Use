# Harness Engineering 实战指南
## 如何在实际开发中应用驾驭工程

---

## 第一部分：快速开始（5分钟）

### 场景：你正在用 AI Agent 开发一个后端服务

**问题**：Agent 经常犯这些错误
- 调用已知会挂死的工具（repo cat）
- 输出推断性结论（"应该是 200 表示成功"）
- 子任务之间互相污染（并行写同一个文件）
- 知识库里存了过期信息

**解决方案**：按照六大支柱建立防护体系

---

## 第二部分：六大支柱实施清单

### 支柱 1：上下文架构 — 分层加载

**目标**：Agent 只看到它需要的信息，不是什么都塞进去

#### 实施步骤

1. **创建分层上下文结构**
```
project/
├── SOUL.md              # Agent 人格定义（必加载）
├── USER.md              # 用户画像（必加载）
├── MEMORY.md            # 长期记忆（仅主会话）
├── memory/
│   └── 2026-04-20.md    # 今日上下文（必加载）
└── AGENTS.md            # 全局规则索引
```

2. **SOUL.md 示例**（定义 Agent 的行为准则）
```markdown
# Agent 人格定义

## 核心原则
- 不确定的结论不输出
- 遇到已知问题工具立即切换替代方案
- 所有数值/字段名必须源码验证

## 工具禁令（红线）
- ❌ 禁止使用 `repo cat`（易挂死）→ 改用 mtcurl
- ❌ 禁止并行下载（& wait）→ 改用串行 + timeout=30
- ❌ 禁止 CIBA 认证 → 改用 CDP 浏览器 SSO

## 验证规则
- 结论含数值/字段名 → 必须源码验证
- 知识库相似度 < 0.60 → 触发自愈（读源码）
- 推断性结论（应该/可能/大概）→ 不输出
```

3. **USER.md 示例**（用户背景）
```markdown
# 用户画像

## 技术栈
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 消息队列：RabbitMQ

## 常见问题
- 金额字段容易浮点精度错误
- 异步流程中 Promise 容易忘记 await
- 状态机转移需要原子性保证
```

4. **memory/2026-04-20.md 示例**（今日工作上下文）
```markdown
# 2026-04-20 工作日志

## 当前任务
- 实现订单支付模块
- 需要集成第三方支付 API

## 已知问题
- 支付 API 返回 timeout 时需要重试 3 次
- 回调 webhook 可能重复，需要幂等性处理

## 已验证的知识
- withhold_status: 100=待代扣, 300=已缴（源码确认）
- recordId = mall_installment_record_id（非 id 字段）
```

#### 关键规则
- **R1.1**：Session 启动时按顺序加载 SOUL → USER → memory/today → MEMORY
- **R1.3**：Spawn 子 agent 时只注入 skill 路径 + 关键规则，不塞整个 MEMORY.md
- **R1.4**：上下文占比 > 80% 时主动分流给子 agent

---

### 支柱 2：架构约束 — 硬编码禁止

**目标**：有些错误不靠 Agent 判断力，而是硬编码禁止

#### 实施步骤

1. **在 AGENTS.md 中定义工具禁令**
```markdown
# 全局安全规则

## 工具禁令表（不可协商）

| 禁止 | 原因 | 替代方案 |
|------|------|---------|
| `repo cat` | 经常挂死 30s | mtcurl REST API |
| `& ... wait` 并行 | 整个 exec 卡死 | 串行 + timeout=30 |
| CIBA 认证 | 沙箱不可靠 | CDP 浏览器 SSO |
| `web_search` | 网络不通 | catclaw-search |

## 错误→规则固化流程

当 Agent 犯错被纠正时：
1. 识别错误模式
2. 提取为规则（If X then Y）
3. 写入对应位置：
   - 工具相关 → MEMORY.md
   - 行为相关 → SOUL.md
   - 全局禁令 → AGENTS.md
4. 下次遇到自动触发规则
```

2. **在代码中硬编码约束**
```javascript
// agent-config.js
const TOOL_BLACKLIST = {
  'repo_cat': {
    reason: '经常挂死无响应',
    alternative: 'mtcurl',
    severity: 'CRITICAL'
  },
  'parallel_download': {
    reason: 'mtcurl 挂起时整个 exec 永久卡死',
    alternative: 'serial_with_timeout_30',
    severity: 'CRITICAL'
  }
};

// 在 Agent 执行前检查
function validateToolCall(toolName) {
  if (TOOL_BLACKLIST[toolName]) {
    throw new Error(
      `❌ 禁止使用 ${toolName}（${TOOL_BLACKLIST[toolName].reason}）\n` +
      `✅ 改用：${TOOL_BLACKLIST[toolName].alternative}`
    );
  }
}
```

3. **约束分级**
```markdown
## 约束分级

🔴 **红线**（绝对禁止，无例外）
- 禁止使用 repo cat
- 禁止并行写同一个文件
- 禁止输出推断性结论

🟡 **护栏**（默认禁止，用户明确要求可放行）
- 默认禁止删除操作，用户确认后执行
- 默认禁止修改生产配置

🟢 **建议**（推荐做法，可根据场景变通）
- 建议使用 async/await 而非 callback
- 建议先验证再输出
```

#### 关键规则
- **R2.1**：工具禁令硬编码，不可协商
- **R2.2**：错误→规则固化流程，下次自动避免
- **R2.3**：约束分级，区分红线/护栏/建议

---

### 支柱 3：自验证循环 — 输出前先证伪

**目标**：Agent 的每个技术结论在输出前必须经过验证

#### 实施步骤

1. **定义验证触发器**（满足任一条件必须验证）
```markdown
## 自验证触发条件

□ 结论含具体数值/金额/比例/状态码
□ 结论含字段名/表名/方法名
□ 结论含"应该"/"推断"/"大概"/"可能"
□ 知识库相似度 < 0.60
□ 结论涉及写操作（trigger/delete/update）
□ 用户问题含明确时间节点（今天/本周）
```

2. **实施证伪优先**（先找反证，再找支持证据）
```javascript
// 验证流程
async function verifyConclusion(conclusion) {
  // Step 1: 先尝试推翻结论
  const counterEvidence = await searchCounterEvidence(conclusion);
  if (counterEvidence) {
    console.log('❌ 发现反证，结论推翻');
    return false;
  }
  
  // Step 2: 找调用方代码确认实际行为
  const sourceCode = await readSourceCode(conclusion.relatedFile);
  const actualBehavior = extractBehavior(sourceCode);
  
  // Step 3: 反例不存在 → 结论成立
  if (actualBehavior === conclusion.expected) {
    console.log('✅ 结论成立，可以输出');
    return true;
  }
  
  return false;
}
```

3. **低分拒答机制**
```markdown
## 知识库相似度判断

相似度 < 0.45  → ⛔ 拒答
  "知识库无覆盖，无法给出可靠结论"

相似度 0.45-0.60 → ⚠️ 触发自愈
  1. 承认盲区
  2. 读源码补充
  3. 提取结论
  4. 写入知识库

相似度 > 0.60  → ✅ 正常回答
```

4. **推断结论禁止输出**
```markdown
## 禁止输出的模式

❌ "withhold_status=200 表示成功 ⚠️（推断）"
   → 把验证责任转嫁给用户

✅ 不确定 → 查源码确认 → 确认后才输出
   → 自己承担验证责任
```

#### 关键规则
- **R3.1**：证伪优先（对抗 LLM 的确认偏误）
- **R3.2**：低分拒答（不输出幻觉）
- **R3.3**：推断结论禁止输出

---

### 支柱 4：上下文隔离 — 子任务不互相污染

**目标**：子任务之间独立，主会话保持轻量

#### 实施步骤

1. **子 Agent 分流阈值**
```markdown
## 何时 Spawn 子 Agent

| 条件 | 处理方式 |
|------|---------|
| 预估 ≤5 次 tool call | 主会话直接处理 |
| 预估 >5 次 tool call | spawn 子 agent |
| 预估 >30s 耗时 | spawn 子 agent |
| 批量文件操作 | spawn 子 agent，按需并行 |
```

2. **并发安全**
```javascript
// 多子 agent 写同一个 DB
const db = new Database('data.db');
db.pragma('journal_mode = WAL');  // 启用 WAL 模式

// 文件锁
const fs = require('fs');
const fcntl = require('fcntl');

async function writeWithLock(filePath, data) {
  const fd = fs.openSync(filePath, 'a');
  fcntl.flock(fd, 'ex');  // 排他锁
  try {
    fs.writeFileSync(fd, data);
  } finally {
    fcntl.flock(fd, 'un');
    fs.closeSync(fd);
  }
}
```

3. **子 Agent 故障恢复**
```javascript
// 进度文件持久化
const progressFile = '/tmp/batch_progress.json';

async function spawnSubAgent(task) {
  const batchId = generateBatchId();  // 新 batch ID，避免冲突
  
  const result = await task.spawn({
    description: task.description,
    progressFile: `${progressFile}.${batchId}`,
    checkpoint: true  // 启用断点续传
  });
  
  if (result.status !== 'accepted') {
    // 重试
    return spawnSubAgent(task);
  }
  
  return result;
}
```

#### 关键规则
- **R4.1**：子 agent 分流阈值（>5 tool calls 或 >30s）
- **R4.2**：并发安全（WAL 模式 + 文件锁）
- **R4.3**：故障恢复（进度文件 + 新 batch ID）

---

### 支柱 5：熵治理 — 知识不腐烂

**目标**：写入有门槛，存量有清理，质量有度量

#### 实施步骤

1. **写入门控（importance 分级）**
```markdown
## 知识写入标准

| 知识类型 | importance | 是否写入 |
|---------|-----------|---------|
| 源码验证的业务公式 | 0.98 | ✅ |
| 状态机/调用链 | 0.92 | ✅ |
| RDS 表结构 | 0.90 | ✅ |
| 工具踩坑经验 | 0.88 | ✅ |
| 推断/猜测 | — | ❌ 不写入 |
```

2. **自愈 SOP**
```markdown
## 自愈流程

触发条件：
- 相似度 < 60%
- 结论含数值
- 自己用了"推断/应该"

执行步骤：
1. 承认盲区："知识库未覆盖，正在查源码确认"
2. mtcurl 读源码（分块 ≤200 行）
3. 提取结论
4. vm-remember 写入（importance ≥ 0.95）
5. 回复附 "✅ 已自动存入知识库 key=xxx"
```

3. **知识蒸馏**
```
Daily Log（memory/YYYY-MM-DD.md）
  → 原始记录，事无巨细
  
MEMORY.md
  → 蒸馏精华，定期从 daily log 中提取高价值条目
  → 过期信息及时清理
  
向量库
  → 结构化知识，门控写入
  → 实体图谱补充精确导航
```

#### 关键规则
- **R5.1**：写入门控（importance 分级）
- **R5.2**：自愈 SOP（承认盲区 → 读源码 → 写入）
- **R5.3**：知识蒸馏（daily → MEMORY → 向量库）

---

### 支柱 6：可拆卸性 — Skill 化能力

**目标**：能力以 Skill 为单位，可独立安装/卸载/替换

#### 实施步骤

1. **Skill 自包含**
```markdown
# 完整的 SKILL.md 结构

---
name: my-skill
description: "..."
version: 1.0.0
---

## 安装步骤

1. 克隆仓库
2. npm install
3. 配置环境变量
4. 运行 init.sh

## 依赖声明

- Node.js >= 16
- npm >= 8
- PostgreSQL >= 12

## 命令丢失时恢复

如果命令不可用：
1. 重新读 SKILL.md
2. 执行安装步骤
3. 重试
```

2. **Skill 冲突管理**
```javascript
// 安装前检测冲突
async function installSkill(skillName) {
  const existingSkills = await listInstalledSkills();
  
  // 检测触发词冲突
  const conflicts = existingSkills.filter(s => 
    s.triggers.some(t => skillName.triggers.includes(t))
  );
  
  if (conflicts.length > 0) {
    console.log('⚠️ 发现冲突：', conflicts);
    // 保留最精确的一个
    return selectMostPrecise([skillName, ...conflicts]);
  }
  
  return installSkill(skillName);
}
```

3. **持久化纪律**
```markdown
## 持久化规则

✅ ~/.openclaw/     — 唯一持久化目录
❌ ~/、/tmp/、/root/ — 重启即消失

具体规则：
- 所有跨会话状态 → ~/.openclaw/ 下
- /tmp/ 仅用于临时工作文件
- 脚本/配置/备份 → ~/.openclaw/workspace/ 或 ~/.openclaw/skills/
```

#### 关键规则
- **R6.1**：Skill 自包含（完整安装步骤）
- **R6.2**：冲突管理（保留最精确的）
- **R6.3**：持久化纪律（只用 ~/.openclaw/）

---

## 第三部分：持续改进闭环

### 错误→规则固化流程

```
犯错 → 识别模式 → 固化规则 → 回测验证 → 规则生效
                                  ↑                |
                                  └────── 反馈 ←───┘
```

#### 实施步骤

1. **识别错误模式**
```markdown
## 错误记录模板

日期：2026-04-20
错误：Agent 调用了 repo cat，导致挂死 30s
条件：当需要读取大文件时
模式：工具选择错误
```

2. **提取为规则**
```markdown
## 规则提取

IF 需要读取文件内容
THEN 禁止使用 repo cat
     改用 mtcurl REST API
SEVERITY: CRITICAL
```

3. **写入对应位置**
```markdown
- 工具相关 → MEMORY.md 的"工具踩坑"章节
- 行为相关 → SOUL.md 的"核心原则"
- 全局禁令 → AGENTS.md 的"工具禁令表"
```

4. **回测验证**
```javascript
// 用历史 case 验证规则
async function verifyRule(rule) {
  const historicalCases = await loadHistoricalCases();
  
  for (const case of historicalCases) {
    if (rule.matches(case.condition)) {
      const result = applyRule(rule, case);
      if (!result.success) {
        console.log('❌ 规则失效，需要调整');
        return false;
      }
    }
  }
  
  console.log('✅ 规则验证通过');
  return true;
}
```

---

## 第四部分：完整项目模板

### 项目结构
```
my-agent-project/
├── SOUL.md                    # Agent 人格定义
├── USER.md                    # 用户画像
├── AGENTS.md                  # 全局规则索引
├── MEMORY.md                  # 长期记忆
├── memory/
│   ├── 2026-04-20.md         # 今日日志
│   └── 2026-04-19.md         # 昨日日志
├── .agents/
│   ├── CLAUDE.md             # 地图
│   ├── docs/                 # 知识库
│   └── rules/                # 编码规范
├── src/
│   ├── agent-config.js       # Agent 配置（工具禁令）
│   ├── verification.js       # 自验证循环
│   └── harness.js            # 驾驭工程框架
└── tests/
    └── harness.test.js       # 规则回测
```

### 快速启动脚本
```bash
#!/bin/bash

# 1. 初始化项目结构
mkdir -p my-agent-project/{memory,.agents/docs,.agents/rules,src,tests}

# 2. 创建基础文件
cat > my-agent-project/SOUL.md << 'EOF'
# Agent 人格定义

## 核心原则
- 不确定的结论不输出
- 遇到已知问题工具立即切换
- 所有数值/字段名必须源码验证

## 工具禁令
- ❌ repo cat → 改用 mtcurl
- ❌ & wait 并行 → 改用串行 + timeout
EOF

# 3. 创建配置文件
cat > my-agent-project/src/agent-config.js << 'EOF'
const TOOL_BLACKLIST = {
  'repo_cat': {
    reason: '经常挂死无响应',
    alternative: 'mtcurl',
    severity: 'CRITICAL'
  }
};

module.exports = { TOOL_BLACKLIST };
EOF

echo "✅ 项目初始化完成"
```

---

## 第五部分：常见问题

### Q1：如何判断什么时候需要 spawn 子 agent？
**A**：预估 >5 次 tool call 或 >30s 耗时时 spawn 子 agent。这样可以保持主会话轻量，避免上下文爆炸。

### Q2：知识库相似度 0.60 是怎么定的？
**A**：这是经验值。< 0.45 直接拒答，0.45-0.60 触发自愈，> 0.60 正常回答。可根据实际情况调整。

### Q3：如何处理规则冲突？
**A**：新规则与旧规则矛盾时，以更近期、更具体的为准。定期审视规则，标记 deprecated 的规则。

### Q4：如何避免知识库腐烂？
**A**：定期从 daily log 中蒸馏精华到 MEMORY.md，清理过期信息。只写入 importance ≥ 0.88 的知识。

### Q5：如何快速定位 Agent 的问题？
**A**：按优先级检查：
1. 工具定义（描述准确性、边界清晰性）
2. 上下文架构（是否按需注入）
3. 验证规则（是否触发自验证）
4. 约束规则（是否遵守禁令）

---

## 总结

驾驭工程的核心是**系统化地把每一次错误变成免疫力**。

| 支柱 | 核心问题 | 实施方式 |
|------|---------|---------|
| 上下文架构 | Agent 该看到什么？ | 分层加载 SOUL → USER → memory → MEMORY |
| 架构约束 | Agent 不能做什么？ | 硬编码工具禁令 + 错误→规则固化 |
| 自验证循环 | Agent 怎么知道自己对不对？ | 证伪优先 + 低分拒答 + 推断禁止 |
| 上下文隔离 | 子任务怎么不互相污染？ | 分流阈值 + WAL + 文件锁 |
| 熵治理 | 知识怎么不腐烂？ | 写入门控 + 自愈 SOP + 知识蒸馏 |
| 可拆卸性 | 能力怎么复用和替换？ | Skill 化 + 完整安装 + 冲突检测 |

**下一步**：选择一个支柱开始实施，逐步建立完整的驾驭工程体系。
