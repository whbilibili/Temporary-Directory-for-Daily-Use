# 用户画像

## 技术栈

### 后端
- 框架：Node.js + Express
- 数据库：PostgreSQL
- 消息队列：RabbitMQ
- 缓存：Redis

### 前端
- 框架：React 18
- 状态管理：Redux
- 构建工具：Webpack 5

### 基础设施
- 容器化：Docker
- 编排：Kubernetes
- CI/CD：GitHub Actions

## 常见问题

### 金额字段
- 容易浮点精度错误
- 必须使用 Decimal 或 BigInt
- 数据库中存储为 NUMERIC(18,2)

### 异步流程
- Promise 容易忘记 await
- 回调地狱问题
- 需要统一的错误处理

### 状态机
- 状态转移需要原子性保证
- 并发修改容易导致状态不一致
- 需要使用数据库事务

## 已知的坑

### 支付相关
- 支付 API 返回 timeout 时需要重试 3 次
- 回调 webhook 可能重复，需要幂等性处理
- 金额精度必须保证到分

### 数据库
- 大表查询需要加索引
- 长事务容易导致锁等待
- 需要定期清理过期数据

### 消息队列
- 消息可能重复投递
- 需要实现消费端幂等性
- 死信队列需要监控

## 编码规范

### JavaScript/TypeScript
- 使用 const/let，禁止 var
- 使用 async/await，禁止 callback
- 使用 TypeScript 进行类型检查
- 单测覆盖率 > 80%

### 数据库
- 所有表必须有 created_at 和 updated_at
- 使用 UUID 作为主键
- 外键必须有索引

### API 设计
- RESTful 风格
- 统一的错误响应格式
- 版本控制（v1, v2）

## 项目背景

### 业务
- 在线支付平台
- 支持多种支付方式
- 需要高可用和高并发

### 团队
- 后端 5 人
- 前端 3 人
- 运维 2 人

### 目标
- 日均交易量 100 万+
- 系统可用性 99.9%
- 支付成功率 99.5%+
