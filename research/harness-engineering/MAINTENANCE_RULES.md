# Harness 文档维护规则

> 定义每个文档的维护职责、更新频率和检查清单

---

## 📋 维护职责矩阵

| 文档 | 维护者 | 更新频率 | 触发条件 | 优先级 |
|------|--------|---------|---------|--------|
| **AGENTS.md** | 架构师 | 初始化 + 变更时 | 新增工程、目录变更 | P0 |
| **PLANS.md** | 产品/架构师 | 每周/每迭代 | 迭代开始、计划调整 | P1 |
| **API-CONTRACT.md** | 后端架构师 | 接口变更时 | 新增/修改 API | P0 |
| **DEPLOYMENT.md** | 运维/架构师 | 环境变更时 | 环境变更、流程优化 | P1 |
| **SECURITY.md** | 架构师 | 发现问题时 | 安全漏洞、新规范 | P0 |
| **feature-list.json** | Coding Agent | 每次任务变更 | 新增/修改/完成任务 | P0 |
| **progress.txt** | Coding Agent | 每个会话结束 | 会话结束、里程碑 | P0 |
| **ARCHITECTURE.md** | 架构师/Coding Agent | 架构变更时 | 新增模块、重构 | P0 |
| **docs/caveats.md** | Coding Agent | 发现问题时 | 踩坑、bug 修复 | P1 |
| **docs/tech-debt.md** | Coding Agent | 每周/每迭代 | 新增债务、债务清偿 | P1 |
| **docs/CHANGELOG.md** | Coding Agent | 版本发布时 | 版本发布、功能上线 | P1 |
| **memory/YYYY-MM-DD.md** | Coding Agent | 每个会话结束 | 会话结束 | P1 |
| **memory/MEMORY.md** | Coding Agent | 每周/每月 | 定期蒸馏、知识沉淀 | P2 |
| **.sync-state.json** | Coding Agent | 每个会话结束 | 会话结束 | P0 |

---

## 🔄 更新流程详解

### 场景 1：Coding Agent 完成一个任务

**触发条件**：任务代码完成、测试通过

**更新步骤**：
```
1. 更新 feature-list.json
   - 找到对应的任务
   - 更新 status: "in_progress" → "completed"
   - 更新 completed_at: ISO8601 时间戳
   - 更新 actual_hours: 实际工作时间

2. 更新 progress.txt
   - 在当日记录中添加完成的任务
   - 更新统计数据（代码行数、提交次数、测试覆盖率）

3. 如有新的架构决策
   - 更新 ARCHITECTURE.md
   - 添加新的设计决策或约束

4. 如踩坑了
   - 更新 docs/caveats.md
   - 记录问题、复现步骤、解决方案

5. 如有新的技术债
   - 更新 docs/tech-debt.md
   - 记录技术债描述、优先级、预计工作量

6. 提交代码到本地分支
   - git add .
   - git commit -m "feat: 完成 TASK-001"
```

**验证**：
- [ ] feature-list.json 已更新
- [ ] progress.txt 已更新
- [ ] 代码已提交到本地分支
- [ ] 测试通过

---

### 场景 2：会话结束（session-handoff）

**触发条件**：用户说"结束会话"、"保存进度"、"交接棒"

**更新步骤**：
```
1. 运行 session-handoff skill
   session-handoff --harness B/harness/

2. 自动执行以下操作：
   a. 更新 progress.txt
      - 记录本次会话的成果
      - 更新统计数据
   
   b. 更新 feature-list.json
      - 同步任务状态
      - 更新 updated_at 时间戳
   
   c. 生成 memory/YYYY-MM-DD.md
      - 记录今日工作日志
      - 记录遇到的问题
      - 记录下一步计划
   
   d. 生成 .sync-state.json
      - 记录同步检查点
      - 执行同步检查
      - 输出警告信息

3. 生成交接报告
   - 总结本次会话的成果
   - 列出待处理的问题
   - 建议下一步行动
```

**验证**：
- [ ] progress.txt 已更新
- [ ] feature-list.json 已更新
- [ ] memory/YYYY-MM-DD.md 已生成
- [ ] .sync-state.json 已生成
- [ ] 交接报告已生成

---

### 场景 3：定期知识蒸馏（每周/每月）

**触发条件**：每周五 / 每月月末

**更新步骤**：
```
1. 读取 memory/YYYY-MM-DD.md（过去 7 天的日志）

2. 提取高价值条目：
   - 架构决策
   - 踩坑经验
   - 最佳实践
   - 常见问题

3. 写入 memory/MEMORY.md
   - 按类别组织
   - 添加时间戳
   - 添加相关链接

4. 清理过期的日志条目
   - 删除超过 1 个月的日志
   - 保留重要的日志备份
```

**验证**：
- [ ] memory/MEMORY.md 已更新
- [ ] 高价值条目已提取
- [ ] 过期日志已清理

---

### 场景 4：定期健康巡检（每周）

**触发条件**：每周一 / 或用户主动运行 harness-watchdog

**更新步骤**：
```
1. 运行 harness-watchdog
   harness-watchdog --check-sync B/harness/ B/code-repo/

2. 执行以下检查：
   a. 检查 feature-list.json
      - 是否有僵尸任务（in_progress 超期）
      - 是否有任务依赖冲突
   
   b. 检查 progress.txt
      - 是否过长需要裁剪
      - 统计数据是否准确
   
   c. 检查 ARCHITECTURE.md
      - 是否与代码实现一致
      - 是否有新增模块未记录
   
   d. 检查 .sync-state.json
      - 是否过期（>7 天未更新）
      - 是否有未处理的警告
   
   e. 检查 docs/caveats.md
      - 是否有已解决的问题需要清理
      - 是否有新增问题
   
   f. 检查 docs/tech-debt.md
      - 是否有优先级过低的技术债
      - 是否有已清偿的技术债

3. 生成健康报告
   - 列出发现的问题
   - 给出改进建议
   - 输出警告信息
```

**验证**：
- [ ] 所有检查项已执行
- [ ] 健康报告已生成
- [ ] 问题已记录

---

## ✅ 每日检查清单

### 会话开始时

- [ ] 读取 memory/YYYY-MM-DD.md（今日日志）
- [ ] 读取 feature-list.json（任务清单）
- [ ] 读取 ARCHITECTURE.md（架构约束）
- [ ] 读取 docs/caveats.md（已知问题）
- [ ] 检查 .sync-state.json（同步状态）

### 会话进行中

- [ ] 定期更新 progress.txt（每 2 小时）
- [ ] 遇到问题时更新 docs/caveats.md
- [ ] 发现技术债时更新 docs/tech-debt.md
- [ ] 完成任务时更新 feature-list.json

### 会话结束时

- [ ] 运行 session-handoff
- [ ] 验证 progress.txt 已更新
- [ ] 验证 feature-list.json 已更新
- [ ] 验证 memory/YYYY-MM-DD.md 已生成
- [ ] 验证 .sync-state.json 已生成
- [ ] 检查是否有警告信息

---

## ✅ 每周检查清单

### 周一

- [ ] 运行 harness-watchdog
- [ ] 检查是否有僵尸任务
- [ ] 检查 progress.txt 是否过长
- [ ] 检查 .sync-state.json 是否过期

### 周五

- [ ] 执行知识蒸馏（memory/YYYY-MM-DD.md → memory/MEMORY.md）
- [ ] 更新 docs/tech-debt.md（清偿情况）
- [ ] 生成周报（完成率、工作量统计）

---

## ✅ 每月检查清单

- [ ] 检查 API-CONTRACT.md 是否与实现一致
- [ ] 检查 DEPLOYMENT.md 是否需要更新
- [ ] 检查 SECURITY.md 中的规则是否被遵守
- [ ] 清理过期的日志（超过 1 个月）
- [ ] 生成月报（完成率、技术债清偿情况）

---

## 🚨 异常处理

### 异常 1：feature-list.json 与代码不一致

**现象**：
- 任务标记为 completed，但代码未提交
- 任务标记为 pending，但代码已提交

**处理步骤**：
1. 检查 .sync-state.json 中的警告信息
2. 手动同步 feature-list.json 和代码
3. 更新 .sync-state.json 的 status 为 in_sync

---

### 异常 2：progress.txt 过长

**现象**：
- progress.txt 超过 500 行
- 难以快速查看进度

**处理步骤**：
1. 将旧的日志条目移到 memory/YYYY-MM-DD.md
2. 保留最近 2 周的日志在 progress.txt
3. 定期执行知识蒸馏

---

### 异常 3：僵尸任务

**现象**：
- 任务状态为 in_progress，但超过 7 天未更新
- 任务没有对应的代码分支

**处理步骤**：
1. 检查任务是否真的在进行中
2. 如果已完成，更新状态为 completed
3. 如果已放弃，更新状态为 cancelled
4. 如果继续进行，更新 updated_at 时间戳

---

### 异常 4：同步检查失败

**现象**：
- .sync-state.json 中的 status 为 out_of_sync
- 有多个 sync_checks 失败

**处理步骤**：
1. 查看 .sync-state.json 中的详细错误信息
2. 逐个修复失败的检查项
3. 重新运行 session-handoff
4. 验证 status 变为 in_sync

---

## 📞 联系方式

- **架构师**：[MIS ID]
- **前端负责人**：[MIS ID]
- **后端负责人**：[MIS ID]
- **运维负责人**：[MIS ID]

---

## 📚 相关文档

- [HARNESS_DOCS_BLUEPRINT.md](./HARNESS_DOCS_BLUEPRINT.md) - 完整的文档体系规划
- [AGENTS_TEMPLATE.md](./AGENTS_TEMPLATE.md) - AGENTS.md 模板
- [ARCHITECTURE_TEMPLATE.md](./ARCHITECTURE_TEMPLATE.md) - ARCHITECTURE.md 模板
- [PROGRESS_TEMPLATE.md](./PROGRESS_TEMPLATE.md) - progress.txt 模板
- [CAVEATS_TEMPLATE.md](./CAVEATS_TEMPLATE.md) - docs/caveats.md 模板
- [FEATURE_LIST_TEMPLATE.md](./FEATURE_LIST_TEMPLATE.md) - feature-list.json 模板
- [TECH_DEBT_TEMPLATE.md](./TECH_DEBT_TEMPLATE.md) - docs/tech-debt.md 模板
- [DAILY_LOG_TEMPLATE.md](./DAILY_LOG_TEMPLATE.md) - memory/YYYY-MM-DD.md 模板
- [SYNC_STATE_TEMPLATE.md](./SYNC_STATE_TEMPLATE.md) - .sync-state.json 模板
