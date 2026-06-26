---
name: self-improving-agent
description: "自我改进 Agent：从用户纠正、错误发现、复杂任务后 Auto-Extraction 中提取行为模式，写入持久文件。质量门控：Reusable/Verified/Specific/Non-duplicate 四原则。触发词：self improve、行为模式、提取教训、Auto-Extraction、记住这个模式、经验提取。NOT: 记录情绪/心理偏好、记录仅出现一次的偶发解法。"

allowed-tools: [read, write, exec]

metadata:
  skillhub.creator: "guohanru"
  skillhub.updater: "yeshaozhi"
  skillhub.version: "V7"
  skillhub.source: "FRIDAY Skillhub"
  skillhub.skill_id: "1802"
  workspace-adapter: "pm-workbench"
---
# Self-Improving Agent（产品经理工作台适配版）

**IRON LAW: 未经质量门控四原则(Reusable/Verified/Specific/Non-duplicate)全部通过，不得写入持久文件。**

## 与产品经理工作台的联动

本技能在工作台中有两个额外的写入目标：

| 改进类型 | 写入位置 | 示例 |
|---------|---------|------|
| 产品决策模式 | `context/decisions-log.md` | "需求冲突时优先级由数据决定而非声量" |
| 工作流改进 | `hooks/` 或 `AGENTS.md` | "PRD 中必须包含反指标" |
| 模板改进 | `templates/` 对应模板 | "验收标准增加性能基线要求" |
| 技能改进 | 对应 `skills/` 下的 SKILL.md | "竞品分析增加'不做什么'维度" |

### 工作台进化路径

```
用户反馈/纠正
    ↓
[质量门控] 四原则检查
    ↓
[分类] 判断属于哪类改进
    ↓
[置信度评估] 0.3 → 0.6 → 0.9
    ↓
[写入] 更新对应的持久文件
    ↓
[记录] 在 context/evolution-log.md 中追加条目
```

---

# When to Use

- 用户纠正 agent（"你做错了"、"应该是……"、"PRD 不应该这样写"）
- Agent 自行发现错误（如 prd-reviewer 反复指出同类问题）
- 用户说"记住这个"、"/learn"、"以后都这样做"
- 复杂任务后 Auto-Extraction 三问全 YES（见§5）
- 同类 PRD 审查问题反复出现（模式化错误）

# When NOT to Use

- 常规 CRUD / 已记录过 / 用户说"不用记" / 单次偶发指令 / 情绪偏好
- 特定项目的一次性决策（这些只进 decisions-log，不进通用模式）

# Instructions

## §1 分类

| 类型 | 示例 | 写入 |
|------|------|------|
| Operational | "用 `--browser` 不用 `--app-auth`" | TOOLS.md |
| Behavioral | "回复更简洁" | MEMORY.md |
| Domain-specific | "KM API 需要 unset proxy" | TOOLS.md |
| Preference | "技术话题总用中文回复" | MEMORY.md |
| **PM-workflow** | "PRD 必须有反指标" | `hooks/` 或 `templates/` |
| **PM-decision** | "优先级排序必须有数据支撑" | `context/decisions-log.md` |
| **Skill-improve** | "竞品分析应该关注'不做什么'" | 对应 `skills/*/SKILL.md` |

## §2 质量门控

全部满足才继续：

- **Reusable** — 未来会反复遇到，不是一次性场景
- **Verified** — 经过验证有效，不是未经检验的假设
- **Specific** — 足够具体可执行，不是模糊的方向
- **Non-duplicate** — 尚未记录在工作台的任何文件中

任一 NO → 当日 memory `CORRECTION:` 条目后结束。

## §3 置信度评估

| 级别 | 条件 | 操作 |
|------|------|------|
| 0.3 Tentative | 首次观察 | 当日 memory `PATTERN:` |
| 0.6 Emerging | 2-3 次跨 session 复现 | 候选写入，先征用户确认 |
| 0.9 Established | 用户确认 或 ≥3 次复现 | 直接写入目标文件 |

晋升：0.3→0.6 不同上下文复现≥2 / 0.6→0.9 用户确认或≥3次
衰减：30天未引用降回 0.3

## §4 写入

格式：
```
PATTERN: [名称]
TRIGGER: [何时适用]
ACTION: [做什么]
CONFIDENCE: [0.3|0.6|0.9]
TARGET: [目标文件路径]
SOURCE: [从哪次交互中提取]
```

完成门控：目标文件已写入 / 0.6时用户已确认 / 当日memory有条目

### 工作台专属写入规则

- 写入 `templates/` 时：只追加新字段或注释，不删除已有结构
- 写入 `hooks/` 时：只追加新检查项，不修改已有逻辑
- 写入 `skills/*/SKILL.md` 时：在"分析原则"或"质量标准"末尾追加
- 写入 `AGENTS.md` 时：需要用户明确确认后才执行

## §5 Auto-Extraction

复杂任务后自问：
1. 非显而易见？（不是任何产品经理都知道的常识）
2. 会再遇到？（不是特定产品的一次性问题）
3. 足够具体可行动？（能写成一条可执行的检查项）

三问全YES → 问用户一次。同一任务只问一次。

## §6 进化日志

所有确认写入的改进记录在 `context/evolution-log.md`，格式：

```markdown
## YYYY-MM-DD

### PATTERN: {名称}
- **触发**: {什么事件导致了这次改进}
- **改进**: {具体做了什么修改}
- **目标文件**: {修改了哪个文件}
- **置信度**: 0.9
```

# Conflict Resolution

1. 最新明确指令优先
2. 用户直接陈述 > 推断模式
3. 工作台已有规则 > 新提取的模式（除非用户明确要覆盖）
4. 仍有歧义 → 询问

## Anti-Patterns

- 从沉默推断偏好 → 必须有明确的用户反馈
- 情绪/心理/第三方偏好 → 只记录行为模式
- 只出现一次的偶发解法 → 需要 ≥2 次跨场景复现才记录
- 过于宽泛的泛化 → 必须有具体的触发条件
- 上下文依赖内容 → 去掉上下文依赖，只保留通用规则
- **过度改进** → 不要为了"完善"而频繁修改模板/hooks，稳定性也是价值

# 参考

- [`learning.md`](learning.md) — pattern 提取流程
- [`boundaries.md`](boundaries.md) — 边界案例
