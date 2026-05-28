# 执行计划：死信队列（Dead Letter Queue）

## 元信息

| 字段 | 值 |
|------|------|
| 创建日期 | 2025-01-15 |
| 负责人 | @wanghong |
| 优先级 | P1 |
| 预计完成 | 2025-01-22 |
| 关联设计 | `docs/design-docs/2025-01-14-dead-letter-queue.md` |

## 背景

当前任务超过 maxRetries 后仅标记为 failed 并记录日志，没有集中归档和后续处理机制。
运维无法批量重放失败任务，排查问题时需要从日志中逐条捞取。

## 目标

- 超过 maxRetries 的任务自动转入死信队列（Redis List）
- 提供 API 查询死信队列内容（分页）
- 提供 API 批量重放死信任务（回到 pending 队列）
- 死信任务保留原始 payload + 失败原因 + 失败时间

## 任务分解

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | TaskQueue 新增 `moveToDead(task, reason)` 方法 | ✅ done | 替代原 markFailed |
| 2 | 定义 DeadLetterEntry 类型 | ✅ done | 包含 task + failReason + failedAt |
| 3 | 新增 `GET /api/dead-letter` 接口（分页） | 🔵 in_progress | LRANGE 实现 |
| 4 | 新增 `POST /api/dead-letter/replay` 接口 | ⬜ pending | 批量取出重新入队 |
| 5 | 单元测试覆盖 | ⬜ pending | 覆盖正常/边界场景 |
| 6 | 更新 CLAUDE.md 模块边界表 | ⬜ pending | — |

## 当前进度

任务 1-2 已完成，正在实现查询接口。核心逻辑已验证可行，使用 Redis List（RPUSH + LRANGE）
存储死信条目，每条序列化为 JSON 包含完整上下文。

## 风险与阻塞

- 死信队列无限增长问题：需要设置 TTL 或最大长度（LTRIM），暂定保留最近 10000 条
- replay 接口需要考虑并发安全：多人同时点"重放"可能导致重复入队
