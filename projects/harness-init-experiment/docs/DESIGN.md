# Task Queue Service — 系统设计

## 目的

提供一个轻量级、可靠的分布式任务队列，让业务方通过 HTTP API 提交异步任务，
系统保证任务按优先级有序执行，失败自动重试，状态可查询。

## 架构图

```
┌─────────────┐     HTTP      ┌──────────────┐     Redis      ┌─────────────┐
│   Client    │ ──────────── │   API Layer  │ ────────────── │  TaskQueue  │
│ (Producer)  │  POST /tasks  │  (Express)   │   ZADD/ZPOP   │ (Sorted Set)│
└─────────────┘               └──────────────┘               └──────┬──────┘
                                                                     │
                                                              poll   │
                                                                     ▼
                                                              ┌─────────────┐
                                                              │  Scheduler  │
                                                              │  (Consumer) │
                                                              └─────────────┘
```

> 图例说明：Client 通过 REST API 提交任务到 Redis 队列，Scheduler 轮询消费

## 模块详述

### api

- **职责**: HTTP 请求接收、参数校验（Zod）、响应格式化
- **包路径**: `src/api/`
- **入口点**: `src/api/routes.ts`
- **关键类**:
  - `createRoutes()` — 路由工厂函数，注入 queue 和 scheduler 依赖
- **依赖**: queue, shared

### queue

- **职责**: 任务生命周期管理（入队、出队、重试、标记失败）
- **包路径**: `src/queue/`
- **入口点**: `src/queue/task-queue.ts`
- **关键类**:
  - `TaskQueue` — 核心队列类，封装 Redis Sorted Set 操作
- **依赖**: shared (types), ioredis

### scheduler

- **职责**: 任务调度执行、并发控制、失败处理
- **包路径**: `src/scheduler/`
- **入口点**: `src/scheduler/scheduler.ts`
- **关键类**:
  - `Scheduler` — 调度器，轮询出队并在并发限制内执行任务
- **依赖**: queue, shared

### shared

- **职责**: 公共类型定义、配置加载、日志实例
- **包路径**: `src/shared/`
- **入口点**: 各文件独立导出
- **关键类**:
  - `Task` / `TaskStatus` / `TaskPriority` — 核心类型
  - `taskSchema` — Zod 校验 schema
  - `config` — 环境变量配置对象
  - `logger` — Pino 日志实例
- **依赖**: 无（纯工具层）

## 数据流

### 主链路

```
Client POST /api/tasks
  → routes.ts: Zod 校验 body
  → TaskQueue.enqueue(): ZADD score=priority*1e12+timestamp
  → 返回 201 { taskId }

Scheduler.poll()
  → TaskQueue.dequeue(): ZPOPMIN (取最高优先级)
  → executeTask(): 执行业务逻辑
  → 成功: 标记 completed
  → 失败: TaskQueue.retry() → retryCount++ → 重新入队
  → 超过 maxRetries: markFailed()
```

任务通过 Redis Sorted Set 的 score 排序实现优先级：score = priority * 1000000000000 + createdAt。
priority 越小（1=高）score 越小，ZPOPMIN 取出时优先级最高的任务排在最前。

### 辅助链路

状态查询链路：Client GET /api/tasks/:id/status → Redis HGET task:status → 返回当前状态

## 技术选型

| 关注点 | 选择 | 理由 |
|--------|------|------|
| 队列存储 | Redis Sorted Set | 原子操作、天然排序、高性能 |
| HTTP 框架 | Express | 生态成熟、中间件丰富 |
| 参数校验 | Zod | 类型安全、运行时校验一体 |
| 日志 | Pino | 结构化 JSON、高性能 |
| 语言 | TypeScript strict | 类型安全、减少运行时错误 |

## 关注点映射（Where to Look）

| 我想了解... | 去看... |
|------------|--------|
| 请求入口 | `src/api/routes.ts` |
| 业务逻辑 | `src/scheduler/scheduler.ts` |
| 数据访问 | `src/queue/task-queue.ts` |
| 外部依赖 | `package.json` dependencies |
| 配置 | `src/shared/config.ts` |
| 测试 | `tests/` |

## 决策日志

| 日期 | 决策 | 背景 | 替代方案 |
|------|------|------|---------|
| 初始化 | 使用 Redis Sorted Set 而非 List | 需要优先级排序，List 只支持 FIFO | BullMQ（太重）、RabbitMQ（引入新中间件） |
| 初始化 | Scheduler 内置而非独立进程 | MVP 阶段简化部署，单进程即可 | 独立 worker 进程（后续可拆） |
| 初始化 | score = priority*1e12+timestamp | 同优先级内按时间 FIFO | 仅用 priority 作为 score（丢失时间序） |
