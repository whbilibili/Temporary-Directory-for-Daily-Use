# 执行计划：优雅关闭（Graceful Shutdown）

## 元信息

| 字段 | 值 |
|------|------|
| 创建日期 | 2025-01-20 |
| 负责人 | @wanghong |
| 优先级 | P1 |
| 预计完成 | 2025-01-24 |
| 关联设计 | — |

## 背景

当前服务收到 SIGTERM 时直接退出，活跃中的任务会被中断，导致任务状态不一致：
Redis 中已 ZPOPMIN 出队但未执行完，既不在 pending 队列也未到 completed/failed。
这些"幽灵任务"在生产环境每次发版时都会出现。

## 目标

- 收到 SIGTERM/SIGINT 后停止接收新任务
- 等待所有活跃 worker 完成当前任务（超时 30s 强制退出）
- HTTP 服务先返回 503（readiness probe 摘流）再关闭
- 关闭 Redis 连接释放资源

## 任务分解

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | Scheduler 新增 `gracefulStop()` 方法 | 🔵 in_progress | 设 running=false + 等待 activeWorkers=0 |
| 2 | 注册 SIGTERM/SIGINT handler | ⬜ pending | 调用 gracefulStop + server.close |
| 3 | HTTP 服务关闭序列 | ⬜ pending | health 返回 503 → 等待 drain → close |
| 4 | 超时强制退出机制 | ⬜ pending | setTimeout 30s 后 process.exit(1) |
| 5 | 集成测试 | ⬜ pending | 模拟 SIGTERM 验证无任务丢失 |

## 当前进度

正在设计 `gracefulStop()` 的等待机制。核心问题是如何让 poll 循环感知到 running=false
后优雅退出，而不是粗暴 break。考虑用 Promise + setInterval 轮询 activeWorkers。

## 风险与阻塞

- 如果某个任务 handler 永远不返回（死循环/死锁），30s 超时后只能强制退出
- 需要和 K8s terminationGracePeriodSeconds 对齐，建议设为 45s（给 30s shutdown + 15s buffer）
