# .sync-state.json 模板 - 同步检查点

> 记录 harness 文档与代码仓库的同步状态，防止脱节

```json
{
  "version": "1.0",
  "project": "frontend",
  "last_sync": "2026-04-20T18:00:00Z",
  "sync_duration_seconds": 45,
  "harness_version": "abc123def456",
  "code_commit": "xyz789uvw012",
  "code_branch": "feature/login-page",
  "status": "in_sync",
  "sync_checks": {
    "feature_list_vs_code": {
      "status": "✅ pass",
      "details": "feature-list.json 中的任务与代码分支一致",
      "checked_at": "2026-04-20T18:00:00Z"
    },
    "progress_vs_code": {
      "status": "✅ pass",
      "details": "progress.txt 中的记录与代码提交一致",
      "checked_at": "2026-04-20T18:00:00Z"
    },
    "architecture_vs_code": {
      "status": "✅ pass",
      "details": "ARCHITECTURE.md 中的约束被代码遵守",
      "checked_at": "2026-04-20T18:00:00Z"
    },
    "caveats_vs_code": {
      "status": "✅ pass",
      "details": "docs/caveats.md 中的问题都有解决方案",
      "checked_at": "2026-04-20T18:00:00Z"
    },
    "tech_debt_vs_code": {
      "status": "⚠️ warning",
      "details": "docs/tech-debt.md 中有 2 个技术债未处理",
      "checked_at": "2026-04-20T18:00:00Z"
    }
  },
  "statistics": {
    "total_tasks": 10,
    "completed_tasks": 1,
    "in_progress_tasks": 2,
    "pending_tasks": 7,
    "completion_rate": 0.10,
    "total_code_lines": 850,
    "total_commits": 5,
    "test_coverage": 0.90
  },
  "warnings": [
    {
      "type": "tech_debt",
      "severity": "medium",
      "message": "表单验证库版本冲突未解决",
      "related_doc": "docs/caveats.md#表单验证库版本冲突"
    }
  ],
  "next_sync_recommended": "2026-04-21T18:00:00Z",
  "notes": "会话结束时自动生成，记录 harness 文档与代码仓库的同步状态"
}
```

## 📝 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 同步检查点版本 |
| `project` | string | 项目名称 |
| `last_sync` | ISO8601 | 最后同步时间 |
| `sync_duration_seconds` | number | 同步耗时（秒） |
| `harness_version` | string | harness 文档版本（MD5 哈希） |
| `code_commit` | string | 代码最新提交 hash |
| `code_branch` | string | 当前代码分支 |
| `status` | enum | in_sync / out_of_sync / warning |
| `sync_checks` | object | 各项同步检查结果 |
| `statistics` | object | 工程统计数据 |
| `warnings` | array | 警告信息 |
| `next_sync_recommended` | ISO8601 | 建议下次同步时间 |
| `notes` | string | 备注 |

## 🔍 同步检查项说明

### 1. feature_list_vs_code
检查 `feature-list.json` 中的任务是否与代码分支一致

**检查内容**：
- 任务状态是否与代码提交一致
- 任务分支是否存在
- 任务依赖是否满足

**失败原因**：
- 任务标记为 completed，但代码未提交
- 任务分支不存在
- 任务依赖未完成

---

### 2. progress_vs_code
检查 `progress.txt` 中的记录是否与代码提交一致

**检查内容**：
- 完成的任务是否有对应的代码提交
- 进行中的任务是否有代码变更
- 统计数据是否准确

**失败原因**：
- progress.txt 中记录的完成任务，代码未提交
- 代码有新提交，但 progress.txt 未更新

---

### 3. architecture_vs_code
检查 `ARCHITECTURE.md` 中的约束是否被代码遵守

**检查内容**：
- 禁止项是否被违反
- 推荐项是否被遵守
- 架构决策是否被实施

**失败原因**：
- 代码违反了架构约束
- 新增模块未在 ARCHITECTURE.md 中记录

---

### 4. caveats_vs_code
检查 `docs/caveats.md` 中的问题是否都有解决方案

**检查内容**：
- 已解决的问题是否真的已解决
- 待解决的问题是否有进展
- 问题状态是否准确

**失败原因**：
- 问题标记为已解决，但代码中仍存在
- 问题标记为待解决，但已有解决方案

---

### 5. tech_debt_vs_code
检查 `docs/tech-debt.md` 中的技术债是否有进展

**检查内容**：
- 技术债状态是否准确
- 优先级是否合理
- 是否有新增的技术债

**失败原因**：
- 技术债标记为 pending，但已有代码实施
- 技术债优先级过低，应该提升

---

## 📊 统计数据说明

| 字段 | 说明 |
|------|------|
| `total_tasks` | 总任务数 |
| `completed_tasks` | 已完成任务数 |
| `in_progress_tasks` | 进行中任务数 |
| `pending_tasks` | 待做任务数 |
| `completion_rate` | 完成率（0-1） |
| `total_code_lines` | 代码行数变更 |
| `total_commits` | 提交次数 |
| `test_coverage` | 测试覆盖率（0-1） |

---

## 🚨 警告类型

| 类型 | 严重程度 | 说明 |
|------|---------|------|
| `tech_debt` | low/medium/high | 技术债未处理 |
| `test_coverage` | low/medium/high | 测试覆盖率过低 |
| `code_quality` | low/medium/high | 代码质量问题 |
| `documentation` | low/medium/high | 文档不完整 |
| `performance` | low/medium/high | 性能问题 |
| `security` | low/medium/high | 安全问题 |

---

## 📝 更新规则

**何时更新**：
- 每个会话结束时（通过 session-handoff 自动生成）
- 定期巡检时（通过 harness-watchdog 自动更新）

**维护者**：Coding Agent（自动化工具）

**检查频率**：
- 每个会话结束时：完整检查
- 每周一次：定期巡检
- 发现问题时：即时检查

---

## 🔄 同步流程

```
会话结束
  ↓
运行 session-handoff
  ↓
更新 feature-list.json 和 progress.txt
  ↓
生成 memory/YYYY-MM-DD.md
  ↓
执行同步检查
  ↓
生成 .sync-state.json
  ↓
如有警告 → 输出警告信息
  ↓
同步完成
```

---

## 💡 最佳实践

1. **定期检查**：每周运行一次 harness-watchdog，检查同步状态
2. **及时更新**：每个会话结束时运行 session-handoff，更新同步检查点
3. **处理警告**：及时处理 .sync-state.json 中的警告信息
4. **保持一致**：确保 harness 文档与代码仓库保持同步
```
