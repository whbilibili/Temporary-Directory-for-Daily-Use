# Task Queue Service

基于 Redis Sorted Set 的轻量级分布式任务队列服务，支持优先级调度、自动重试和并发控制。

## 1. 北极星

- 任务不丢失：入队后必达 completed 或 failed（重试耗尽）
- 优先级保证：高优先级任务永远先于低优先级出队
- 水平扩展：调度器无状态，多实例可共享同一 Redis 队列

## 2. 架构概览

Express HTTP 接口接收任务 → Redis Sorted Set 存储待执行队列 → Scheduler 轮询出队并执行。
任务状态通过 Redis Hash 持久化，失败后自动重试直到 maxRetries 耗尽。

详细设计文档: [`docs/DESIGN.md`](docs/DESIGN.md)

## 3. 模块边界

| 模块 | 职责 | 允许依赖 |
|------|------|---------|
| `src/api/` | HTTP 接口，请求校验，响应格式化 | queue, shared |
| `src/queue/` | 任务入队/出队/重试，Redis 交互 | shared |
| `src/scheduler/` | 轮询调度，并发控制，任务执行 | queue, shared |
| `src/shared/` | 类型定义，配置，日志 | 无（零外部依赖） |

## 4. 关键约束

- shared/ 不得依赖任何其他模块（纯工具层）
- 所有 Redis 操作集中在 queue/ 模块，其他模块不直接操作 Redis
- API 层仅做校验和转发，不含业务逻辑
- 任务 payload 为 `Record<string, unknown>`，队列层不解析具体内容

## 5. 命令

| 动作 | 命令 | 说明 |
|------|------|------|
| 构建 | `tsc` | TypeScript 编译到 dist/ |
| 测试 | `vitest run` | 运行全量单元测试 |
| 检查 | `eslint src/ --ext .ts` | 静态代码检查 |
| 开发 | `ts-node src/index.ts` | 热启动开发服务 |

## 6. 代码规范

- TypeScript strict mode，不使用 any
- 公共函数必须有 JSDoc（参数、返回值、描述）
- 错误处理：不吞异常，所有 catch 必须有结构化日志
- 异步操作统一使用 async/await，不混用 callback
- 配置通过环境变量注入，代码中不硬编码

## 7. 决策优先级

当目标冲突时，按以下优先级决策：

1. 数据正确性（任务不丢、状态一致）
2. 可观测性（出问题能快速定位）
3. 性能（吞吐量和延迟）
4. 代码简洁性

## 8. 变更检查清单

每次提交前至少满足：

- [ ] 编译通过: `tsc`
- [ ] 测试通过: `vitest run`
- [ ] 变更一致性: 接口改动需同步检查 routes.ts 和 types.ts
- [ ] 回归重点: 任务入队→出队→重试链路不中断

## 9. 知识库

| 主题 | 路径 | 说明 |
|------|------|------|
| 系统设计 | [`docs/DESIGN.md`](docs/DESIGN.md) | 架构、模块、数据流 |
| 质量标准 | [`docs/QUALITY_SCORE.md`](docs/QUALITY_SCORE.md) | 代码质量指标和检查清单 |
| 可靠性 | [`docs/RELIABILITY.md`](docs/RELIABILITY.md) | SLO、错误处理、可观测性 |
| 设计文档 | [`docs/design-docs/`](docs/design-docs/) | 详细设计和架构决策 |
| 执行计划 | [`docs/exec-plans/active/`](docs/exec-plans/active/) | 当前工作计划 |
| 产品规格 | [`docs/product-specs/`](docs/product-specs/) | 产品需求和用户故事 |
| 参考资料 | [`docs/references/`](docs/references/) | 外部参考、API 文档 |
