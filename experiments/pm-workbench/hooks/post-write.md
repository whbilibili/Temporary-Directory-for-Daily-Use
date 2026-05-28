# Hook: 写作后处理 (post-write)

> 每次产出文档完成后，**必须**执行以下操作。确保工作台状态始终最新。

---

## 触发时机

- PRD 撰写完成并通过审查后
- 用户故事完成后
- 竞品分析完成后
- 任何已有文档的重大更新后

---

## 自动执行的操作

### 1. 触发 PRD 审查

**操作**: 调用 `skills/prd-reviewer` 对产出文档进行审查

**流程**:
- 如果审查通过 → 继续后续步骤
- 如果审查不通过 → 根据审查建议修改，修改后重新审查
- 最多循环 2 次，如果仍不通过则标注问题点交人工判断

### 2. 更新功能注册表

**操作**: 更新 `context/feature-registry.json`

**规则**:
- 新功能 PRD → 在 features 数组中添加新条目，状态设为 `in-design`
- 功能更新 → 更新对应条目的 description、priority 等字段
- 更新 `_meta.last_updated` 和 `_meta.total_features`

### 3. 记录决策

**操作**: 更新 `context/decisions-log.md`

**规则**:
- 检查文档中是否包含重要决策（功能取舍、优先级判断、方案选择）
- 如果有，按格式追加到 decisions-log
- 如果没有明显决策，跳过此步骤

### 4. 归档产出物

**操作**: 将文档存放到正确的 outputs/ 子目录

**命名规则**:
- PRD: `outputs/prds/YYYY-MM-DD-{功能名}.md`
- 用户故事: `outputs/specs/YYYY-MM-DD-{故事名}.md`
- 竞品分析: `outputs/competitive-analyses/YYYY-MM-DD-{主题}.md`

### 5. 输出摘要

完成以上操作后，输出一个简短的状态摘要：

```markdown
---
📋 Post-write 完成
- 审查结果: ✅ 通过 / ⚠️ 有修改建议
- 注册表更新: feat-{id} 已添加/已更新
- 决策记录: DEC-{id} 已记录 / 无新决策
- 归档位置: outputs/prds/YYYY-MM-DD-xxx.md
---
```

---

## 异常处理

| 异常情况 | 处理方式 |
|----------|----------|
| 审查多次不通过 | 标注问题，建议人工介入 |
| feature-registry 已满（>50条） | 提示需要归档和清理 deprecated 功能 |
| 决策与已有决策冲突 | 明确标注冲突，不自动覆盖，请求确认 |
