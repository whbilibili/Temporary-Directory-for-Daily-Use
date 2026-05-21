# 产研流程技能组合包实验

探索将多个 AI Agent 技能（Skill）组合串联，覆盖产品研发全流程的可行性与最佳实践。

## 1. 北极星

- 验证技能组合包能否无缝覆盖「需求 → 设计 → 开发 → 测试 → 上线」全链路
- 找出技能间的上下文传递断点，提出修复方案
- 产出可复用的技能编排模板，供后续项目直接使用

## 2. 架构概览

本实验采用「技能编排层 + 执行层」两层结构。编排层负责识别当前阶段并路由到对应技能；执行层由各专项技能（frontend-architect、issue-triage、session-handoff 等）完成具体任务。各技能通过共享的 harness 文件（feature-list.json、progress.txt）传递状态。

详细设计文档: [`docs/DESIGN.md`](docs/DESIGN.md)

## 3. 模块边界

| 模块 | 职责 | 允许依赖 |
|------|------|---------|
| 需求阶段 | PRD 拆解、边界契约生成 | fullstack-boundary-contract, spec-driven-development |
| 设计阶段 | 架构蓝图、前后端设计 | frontend-architect, backend-architect |
| 开发阶段 | 编码、代码审查 | code-reviewer, harness-creator |
| 测试阶段 | 缺陷分诊、自动化测试 | issue-triage, webapp-testing |
| 交付阶段 | 会话交接、上线准备 | session-handoff, fsd |

## 4. 关键约束

- 每个技能只负责自己阶段的输出，不越界修改其他阶段的产物
- 技能间状态传递必须通过文件（feature-list.json / issues.json），不依赖上下文记忆
- 实验结论必须有可重现的步骤，不接受"感觉上可以"的结论

## 5. 命令

| 动作 | 命令 | 说明 |
|------|------|------|
| 构建 | `echo "no build step"` | 纯实验项目，无编译产物 |
| 测试 | `cat docs/exec-plans/active/*.md` | 查看当前执行计划 |
| 检查 | `ls -la docs/` | 验证知识库结构完整 |

## 6. 代码规范

- 实验记录用 Markdown，文件名带日期前缀（`YYYY-MM-DD-主题.md`）
- 技能调用链路用 Mermaid 流程图记录在 `docs/design-docs/`
- 结论性文档放 `docs/product-specs/`，过程记录放 `docs/design-docs/`
- 每次实验结束必须运行 session-handoff 技能归档状态

## 7. 决策优先级

当目标冲突时，按以下优先级决策：

1. 实验可重现性 > 实验速度
2. 技能原生能力 > 自定义扩展
3. 文件状态持久化 > 上下文依赖
4. 最小可验证实验 > 大而全的方案

## 8. 变更检查清单

每次提交前至少满足：

- [ ] 编译通过: `echo "no build step"`
- [ ] 实验记录已更新: `docs/design-docs/` 有对应日志
- [ ] 回归重点: 技能调用链路图与实际执行一致

## 9. 知识库

| 主题 | 路径 | 说明 |
|------|------|------|
| 系统设计 | [`docs/DESIGN.md`](docs/DESIGN.md) | 架构、技能编排、数据流 |
| 质量标准 | [`docs/QUALITY_SCORE.md`](docs/QUALITY_SCORE.md) | 实验质量指标和检查清单 |
| 可靠性 | [`docs/RELIABILITY.md`](docs/RELIABILITY.md) | 技能失败处理、降级策略 |
| 设计文档 | [`docs/design-docs/`](docs/design-docs/) | 技能调用链路图、实验日志 |
| 执行计划 | [`docs/exec-plans/active/`](docs/exec-plans/active/) | 当前实验计划 |
| 产品规格 | [`docs/product-specs/`](docs/product-specs/) | 实验目标和验收标准 |
| 参考资料 | [`docs/references/`](docs/references/) | 技能文档、外部参考 |
