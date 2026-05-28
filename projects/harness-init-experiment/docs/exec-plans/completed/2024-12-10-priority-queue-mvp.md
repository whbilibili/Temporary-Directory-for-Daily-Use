# 执行计划：优先级队列 MVP

## 元信息

| 字段 | 值 |
|------|------|
| 创建日期 | 2024-12-10 |
| 完成日期 | 2024-12-18 |
| 负责人 | @wanghong |
| 优先级 | P0 |

## 背景

项目启动，需要实现最基础的优先级任务队列能力，验证 Redis Sorted Set 方案可行性。

## 目标

- 基于 Redis Sorted Set 实现优先级入队/出队
- score 编码方案：priority * 1e12 + timestamp（同优先级内 FIFO）
- 提供 enqueue / dequeue / getStatus 三个核心方法
- Express API 封装（POST /tasks, GET /tasks/:id/status）

## 任务分解

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | 定义 Task 类型和 Zod schema | ✅ done | — |
| 2 | 实现 TaskQueue 类 | ✅ done | enqueue/dequeue/getStatus |
| 3 | 实现 Express routes | ✅ done | POST + GET |
| 4 | 配置模块（环境变量） | ✅ done | config.ts |
| 5 | Pino 结构化日志 | ✅ done | logger.ts |
| 6 | 基础单元测试 | ✅ done | task-queue.test.ts |

## 完成总结

全部 6 个任务按期完成。验证了 Redis Sorted Set 方案在 10 万级任务量下性能满足需求
（入队 <1ms，出队 <1ms）。score 编码方案经过讨论最终选择 priority*1e12+timestamp，
在 JavaScript 安全整数范围内可支持到 2033 年的时间戳。

## 经验教训

- ZPOPMIN 是 Redis 5.0+ 特性，需要确认生产环境版本
- Zod schema 的 `.default()` 在 safeParse 时会自动填充默认值，很方便
- Express 的 async handler 需要手动 catch，否则 unhandledRejection 会导致进程退出
