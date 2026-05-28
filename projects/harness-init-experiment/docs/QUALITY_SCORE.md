# Task Queue Service — 质量标准

## 代码质量目标

| 指标 | 目标 | 当前 | 说明 |
|------|------|------|------|
| 编译通过率 | 100% | — | `tsc` 零错误 |
| 测试覆盖率 | ≥80% | — | 核心队列/调度逻辑全覆盖 |
| 静态检查 | 0 blocker/critical | — | ESLint |

## 代码审查检查清单

### 通用

- [ ] 单一职责：每个类/函数只做一件事
- [ ] 命名清晰：变量名、方法名自解释
- [ ] 无硬编码：配置走环境变量（src/shared/config.ts）
- [ ] 无密钥泄露：Redis 连接信息不入仓库
- [ ] 错误处理：异常不吞掉，有结构化日志（Pino）
- [ ] 边界检查：空值、越界、并发安全

### Node.js/TypeScript 专用

- [ ] TypeScript strict mode 开启
- [ ] async/await 错误有 try-catch
- [ ] 依赖版本锁定（package-lock.json）
- [ ] 无 any 类型逃逸到生产代码
- [ ] Redis 连接异常有重连策略
- [ ] Zod schema 覆盖所有外部输入

## 反模式清单

| 反模式 | 说明 | 修复方式 |
|--------|------|---------|
| 上帝类 | 单个类超过 300 行 | 按职责拆分 |
| 深嵌套 | if/for 嵌套 >3 层 | 提取方法 / 早返回 |
| 魔法数字 | 未命名常量（如 1000000000000） | 提取为命名常量 |
| 忽略错误 | catch 空块或只 console.log | 结构化日志 + 重试/上报 |
| 直接操作 Redis | 在 queue/ 以外的模块直接调用 Redis | 通过 TaskQueue 封装 |

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `TaskQueue`, `Scheduler` |
| 方法名 | camelCase | `enqueue()`, `getStatus()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件名 | kebab-case | `task-queue.ts` |
| 目录名 | kebab-case | `exec-plans/` |
| 类型别名 | PascalCase | `TaskPriority`, `TaskStatus` |
| REST 路径 | kebab-case | `/api/tasks/:id/status` |
