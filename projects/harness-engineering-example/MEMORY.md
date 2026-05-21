# 长期记忆

这是 Agent 的长期记忆库，存储经过验证的知识、踩坑经验、业务规则等。

## 工具踩坑经验

### repo cat 问题（importance: 0.95）

**问题描述**：调用 `repo cat` 读取文件时经常挂死，导致整个 Agent 卡死 30s+

**触发条件**：
- 需要读取文件内容
- 文件大小 > 1MB
- 网络不稳定时

**解决方案**：
- ❌ 禁止使用 repo cat
- ✅ 改用 mtcurl REST API
- 示例：`mtcurl GET /api/file?path=xxx`

**验证来源**：生产环境实际案例（2026-04-15）

---

### 并行下载问题（importance: 0.95）

**问题描述**：使用 `& ... wait` 并行下载时，如果 mtcurl 挂起，整个 exec 永久卡死

**触发条件**：
- 同时下载多个文件
- 使用 `& wait` 并行执行
- 网络波动时

**解决方案**：
- ❌ 禁止使用 `& wait` 并行
- ✅ 改用串行逐个 + timeout=30
- 示例：
  ```bash
  for file in files; do
    mtcurl --timeout 30 $file || echo "Failed: $file"
  done
  ```

**验证来源**：生产环境实际案例（2026-04-16）

---

### CIBA 认证问题（importance: 0.92）

**问题描述**：沙箱环境中 CIBA 认证经常超时或失败

**触发条件**：
- 需要用户身份认证
- 沙箱环境
- 高并发场景

**解决方案**：
- ❌ 禁止使用 CIBA 认证
- ✅ 改用 CDP 浏览器 SSO
- 文档：见 SOUL.md 中的 SSO 章节

**验证来源**：沙箱环境测试（2026-04-17）

---

## 业务规则

### 金额字段处理（importance: 0.98）

**规则**：所有金额字段必须使用 Decimal 或 BigInt，禁止使用 float/double

**原因**：浮点精度错误会导致金额计算错误

**实施方式**：
- 数据库：NUMERIC(18,2)
- 代码：使用 decimal.js 或 big.js
- 验证：所有金额计算必须经过单测

**验证来源**：源码审查 + 生产事故（2026-04-10）

---

### 异步流程规范（importance: 0.92）

**规则**：所有异步操作必须使用 async/await，禁止使用 callback

**原因**：
- 避免回调地狱
- 便于错误处理
- 代码可读性更高

**实施方式**：
```javascript
// ❌ 禁止
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// ✅ 推荐
const data = await fs.promises.readFile('file.txt');
console.log(data);
```

**验证来源**：团队编码规范（2026-04-01）

---

### 状态机转移规范（importance: 0.90）

**规则**：状态转移必须使用数据库事务，保证原子性

**原因**：并发修改容易导致状态不一致

**实施方式**：
```javascript
// 使用事务保证原子性
await db.transaction(async (trx) => {
  const order = await trx('orders').where('id', orderId).first();
  
  if (order.status !== 'pending') {
    throw new Error('Invalid state transition');
  }
  
  await trx('orders').where('id', orderId).update({
    status: 'processing',
    updated_at: new Date()
  });
});
```

**验证来源**：源码审查 + 性能测试（2026-04-12）

---

## 支付相关规则

### 支付 API 重试策略（importance: 0.92）

**规则**：支付 API 返回 timeout 时需要重试 3 次

**触发条件**：
- 支付 API 返回 timeout 错误
- 网络不稳定时

**实施方式**：
```javascript
async function callPaymentAPI(payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await paymentAPI.charge(payload);
    } catch (err) {
      if (err.code === 'TIMEOUT' && i < retries - 1) {
        await sleep(1000 * (i + 1)); // 指数退避
        continue;
      }
      throw err;
    }
  }
}
```

**验证来源**：支付 API 文档 + 生产经验（2026-04-08）

---

### Webhook 幂等性处理（importance: 0.95）

**规则**：回调 webhook 可能重复，必须实现幂等性处理

**触发条件**：
- 接收支付回调 webhook
- 网络重试导致重复投递

**实施方式**：
```javascript
// 使用 webhook_id 作为幂等性键
const webhookKey = `webhook:${webhook.id}`;
const cached = await redis.get(webhookKey);

if (cached) {
  return { status: 'already_processed' };
}

// 处理 webhook
await processPayment(webhook);

// 缓存结果 24 小时
await redis.setex(webhookKey, 86400, 'processed');
```

**验证来源**：支付 API 文档 + 生产事故（2026-04-14）

---

### 金额精度保证（importance: 0.98）

**规则**：金额精度必须保证到分（0.01 元）

**触发条件**：
- 所有金额计算
- 数据库存储
- API 返回

**实施方式**：
```javascript
// 使用 decimal.js
const Decimal = require('decimal.js');

const amount = new Decimal('99.99');
const tax = amount.times(0.13); // 精确计算
const total = amount.plus(tax);

console.log(total.toString()); // "112.9887" → 需要四舍五入
const rounded = total.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
```

**验证来源**：源码审查 + 财务审计（2026-04-09）

---

## 数据库规范

### 表结构规范（importance: 0.90）

**规则**：所有表必须有 created_at 和 updated_at 字段

**实施方式**：
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**验证来源**：团队数据库规范（2026-04-01）

---

### 索引规范（importance: 0.88）

**规则**：
- 所有外键必须有索引
- 常用查询条件必须有索引
- 大表查询必须加索引

**实施方式**：
```sql
-- 外键索引
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 查询条件索引
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- 复合索引
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
```

**验证来源**：性能测试 + 生产优化（2026-04-11）

---

## 消息队列规范

### 消息重复投递处理（importance: 0.92）

**规则**：消息可能重复投递，必须实现消费端幂等性

**实施方式**：
```javascript
// 使用消息 ID 作为幂等性键
const messageKey = `message:${message.id}`;
const processed = await redis.get(messageKey);

if (processed) {
  return { status: 'already_processed' };
}

// 处理消息
await handleMessage(message);

// 标记已处理
await redis.setex(messageKey, 86400, 'processed');
```

**验证来源**：RabbitMQ 文档 + 生产经验（2026-04-13）

---

### 死信队列监控（importance: 0.88）

**规则**：死信队列需要监控和告警

**实施方式**：
- 监控死信队列长度
- 长度 > 100 时告警
- 定期检查死信原因
- 手动重试或人工介入

**验证来源**：运维规范（2026-04-06）

---

## 知识蒸馏记录

### 来源追踪

| 知识 | 来源 | 验证时间 | importance |
|------|------|---------|-----------|
| repo cat 问题 | 生产事故 | 2026-04-15 | 0.95 |
| 并行下载问题 | 生产事故 | 2026-04-16 | 0.95 |
| 金额精度规范 | 源码审查 | 2026-04-09 | 0.98 |
| 状态机规范 | 性能测试 | 2026-04-12 | 0.90 |
| Webhook 幂等性 | 生产事故 | 2026-04-14 | 0.95 |

### 定期审查

- **每周**：从 memory/daily 中蒸馏高价值条目
- **每月**：清理过期信息，更新 importance 评分
- **每季度**：规则回测，验证仍然有效

---

**最后更新**：2026-04-20
**维护者**：Agent Engineering Team
**下一次审查**：2026-04-27
