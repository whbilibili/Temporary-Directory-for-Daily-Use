# 执行计划：调度器并发控制

## 元信息

| 字段 | 值 |
|------|------|
| 创建日期 | 2024-12-20 |
| 完成日期 | 2024-12-27 |
| 负责人 | @wanghong |
| 优先级 | P0 |

## 背景

MVP 阶段的调度器是单线程串行执行任务，吞吐量极低。
需要支持可配置的并发度，同时避免过载导致 Redis 连接池耗尽。

## 目标

- Scheduler 支持 concurrency 参数控制并行 worker 数
- 活跃 worker 达到上限时暂停出队（背压）
- 并发数通过环境变量配置（SCHEDULER_CONCURRENCY）
- 任务执行互不干扰，单个任务失败不影响其他 worker

## 任务分解

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | Scheduler 重构为 poll 循环 + worker 池模式 | ✅ done | — |
| 2 | activeWorkers 计数器 + 并发门控 | ✅ done | — |
| 3 | 环境变量注入 concurrency | ✅ done | config.ts |
| 4 | 任务执行隔离（try-catch-finally） | ✅ done | finally 中递减 activeWorkers |
| 5 | 负载测试验证 | ✅ done | 5 并发下吞吐量提升 4.2x |

## 完成总结

通过 activeWorkers 计数器实现了简洁的并发控制。核心逻辑：poll 循环中检查
activeWorkers < concurrency 才出队，否则 sleep(100ms) 等待。

负载测试结果：
- 串行（concurrency=1）：~1 task/s
- 并发（concurrency=5）：~4.2 tasks/s
- 并发（concurrency=10）：~7.8 tasks/s（受限于 Redis 连接）

## 经验教训

- 不要用 Promise.all 固定大小的池，poll 循环 + 计数器更灵活
- sleep 间隔影响延迟：100ms 时空转≈可接受，1ms 时 CPU 占用飙升
- finally 块保证 activeWorkers 递减至关重要，否则 worker "泄漏"导致调度器僵死
