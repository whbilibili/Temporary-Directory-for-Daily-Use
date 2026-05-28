# 执行计划：自动重试机制

## 元信息

| 字段 | 值 |
|------|------|
| 创建日期 | 2025-01-05 |
| 完成日期 | 2025-01-12 |
| 负责人 | @wanghong |
| 优先级 | P1 |

## 背景

任务执行失败后直接标记 failed，没有重试能力。对于瞬时网络抖动、下游服务短暂不可用
等场景，自动重试可以大幅降低人工干预频率。

## 目标

- 任务失败后自动重新入队，retryCount++
- 达到 maxRetries 后终止重试，标记 failed
- 重试任务保持原有优先级（不降级）
- 重试信息可通过 status API 查询

## 任务分解

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | Task 类型新增 retryCount / maxRetries 字段 | ✅ done | Zod schema 同步更新 |
| 2 | TaskQueue.retry() 方法实现 | ✅ done | retryCount++ → enqueue |
| 3 | Scheduler.executeTask catch 中调用 retry | ✅ done | — |
| 4 | maxRetries 耗尽后 markFailed | ✅ done | 写入 task:status hash |
| 5 | 单元测试：正常重试 + 超限终止 | ✅ done | — |
| 6 | 更新 RELIABILITY.md 错误处理段落 | ✅ done | — |

## 完成总结

实现简洁：retry() 只需判断 retryCount < maxRetries，满足则 count++ 并重新 enqueue，
否则 markFailed。重试任务重新入队后 score 会更新（因为 createdAt 不变但重新计算），
实际效果是同优先级内排到队尾——这是期望行为，避免一个持续失败的任务饿死其他任务。

生产观察（上线一周）：
- 日均重试次数：~120 次
- 重试后成功率：87%（大部分是网络抖动）
- maxRetries 耗尽率：~2%（真正的逻辑错误）

## 经验教训

- 重试不应改变 createdAt，否则 score 变化导致优先级实质降级
- 需要考虑重试间隔（当前是立即重试），后续可加指数退避
- markFailed 应该同时记录最后一次失败原因（当前只存状态，缺失 context）——已登记为后续优化
