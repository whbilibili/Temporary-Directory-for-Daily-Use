# Agent 工程实践学习记录

---

## [LRN-20260326-001] best_practice

**Logged**: 2026-03-26T20:40:00+08:00
**Priority**: high
**Status**: resolved
**Area**: tooling

### Summary
Skill 描述符必须包含反例（When NOT to use），否则路由准确率从 73% 跌至 53%

### Details
文章数据：没有反例时准确率 53%，加上反例后升到 85%，响应时间还降了 18.1%。
当前问题：现有 Skills（如 drink-water-reminder）的描述符缺少明确的"不触发"边界，导致偶发路由失准。
正确做法：每个 Skill 描述符同时写"Use when"和"Don't use when"，用路由条件语气，而不是功能介绍语气。

### Suggested Action
逐一检查 ~/.catpaw/skills/ 下所有 Skill 的描述符，补充 "Don't use when" 边界条件。
优先处理：drink-water-reminder、catdesk-office、catdesk-browser。

### Resolution
- **Resolved**: 2026-03-27T20:40:00+08:00
- **Notes**: 已完成 4 个高频 Skill 的描述符优化，全部改为三段式路由条件格式（Use when / Output / Don't use when）：
  - `~/.catpaw/skills/drink-water-reminder/SKILL.md` ✅
  - `~/.catpaw/skills/catdesk-office/SKILL.md` ✅
  - `~/.catpaw/skills/catdesk-browser/SKILL.md` ✅
  - `~/.catpaw/skills/catdesk-settings/SKILL.md` ✅

### Metadata
- Source: self_reflection
- Related Files: ~/.catpaw/skills/drink-water-reminder/SKILL.md
- Tags: skill-routing, skill-descriptor, counter-example
- Pattern-Key: skill.descriptor.needs_counter_examples
- Recurrence-Count: 1

---

## [LRN-20260326-002] best_practice

**Logged**: 2026-03-26T20:40:00+08:00
**Priority**: high
**Status**: pending
**Area**: tooling

### Summary
调试 Agent 行为时，优先检查工具定义，而不是先怀疑模型能力

### Details
文章原文："调试 Agent 时应先检查工具定义，大多数工具选择错误的原因出在描述不准确，不在模型能力"。
当前问题：遇到任务失败时，我的第一反应往往是调整推理策略，而不是检查工具描述是否清晰。
正确做法：失败 -> 先看工具描述 -> 再看参数边界 -> 最后才考虑推理策略调整。

### Suggested Action
建立调试 checklist：
1. 工具描述是否准确表达了"何时用/何时不用"？
2. 参数描述是否包含格式约束和示例？
3. 错误返回是否结构化并给出修正建议？
4. 工具数量是否过多导致注意力稀释？

### Metadata
- Source: self_reflection
- Tags: tool-design, debugging, ACI
- Pattern-Key: debug.check_tool_definition_first
- Recurrence-Count: 1

---

## [LRN-20260326-003] best_practice

**Logged**: 2026-03-26T20:40:00+08:00
**Priority**: high
**Status**: pending
**Area**: infra

### Summary
记忆整合流程必须可回退：只移动指针，不删除原始消息

### Details
文章原文："最关键的不是摘要写得多漂亮，而是流程本身必须可回退，系统只移动指针，不删除原始消息，即使整合失败，也还能回到原始存档继续工作。"
当前问题：MEMORY.md 写入机制缺少安全网，整合出错时历史上下文可能丢失。
正确做法：整合触发时，先把待整合消息写入 archive/YYYY-MM-DD.md，再做摘要，最后只更新 lastConsolidatedIndex。

### Suggested Action
在 memory_write 操作前，先确认是否有 archive 备份机制。
对于重要的长期记忆更新，使用 mode="append" 而非 mode="replace"，保留历史版本。

### Metadata
- Source: self_reflection
- Tags: memory, consolidation, rollback
- Pattern-Key: memory.consolidation.must_be_reversible
- Recurrence-Count: 1

---

## [LRN-20260326-004] best_practice

**Logged**: 2026-03-26T20:40:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
先修评测，再改 Agent：看到表现下降先确认信号是否失真

### Details
文章原文："看到评测分数下降，先查环境，再动 Agent。"
当前问题：当某类任务表现下降时，容易立刻调整行为，而忽略了反馈信号本身可能出了问题。
正确做法：表现下降 -> 先检查反馈信号是否可靠 -> 再检查工具定义 -> 最后才调整 Agent 行为。

### Suggested Action
建立自我评估 checklist：
1. 这次失败是偶发还是系统性的？
2. 反馈信号（用户纠正/工具报错）本身是否准确？
3. 是否是环境问题（网络、权限、工具版本）？
4. 确认信号可靠后，再定位是工具描述问题还是推理问题。

### Metadata
- Source: self_reflection
- Tags: evaluation, debugging, signal-quality
- Pattern-Key: eval.fix_eval_before_fixing_agent
- Recurrence-Count: 1

---

## [LRN-20260326-005] best_practice

**Logged**: 2026-03-26T20:40:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
长任务状态必须外化到文件，不能依赖上下文窗口

### Details
文章原文："进度要放在文件里，不要放在上下文里，功能清单用 JSON，不用 Markdown，结构化格式更适合模型稳定修改。"
当前问题：多步骤任务（如复杂文档生成、多轮数据处理）的进度状态依赖上下文，session 结束后无法恢复。
正确做法：任务开始时创建 task-state.json，每步完成后立即更新 status 字段，session 重启后从文件恢复。

### Suggested Action
对于超过 5 步的复杂任务，主动创建进度文件：
```json
{
  "tasks": [
    {"id": "1", "desc": "步骤描述", "status": "completed"},
    {"id": "2", "desc": "步骤描述", "status": "in_progress"},
    {"id": "3", "desc": "步骤描述", "status": "pending"}
  ]
}
```

### Metadata
- Source: self_reflection
- Tags: long-task, state-externalization, resilience
- Pattern-Key: long_task.state_must_be_externalized
- Recurrence-Count: 1

---
