# docs/caveats.md 模板 - 踩坑档案

> 记录开发过程中遇到的问题、解决方案和经验教训

```markdown
# 踩坑档案

**工程**：[frontend / backend]
**维护者**：Coding Agent
**最后更新**：2026-04-20

---

## 问题 1：CORS 错误

### 问题描述
POST /api/login 返回 CORS 错误：`Access-Control-Allow-Origin` 缺失

### 现象
```
浏览器控制台错误：
Access to XMLHttpRequest at 'http://localhost:3001/api/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 复现步骤
1. 打开前端应用（http://localhost:3000）
2. 进入登录页面
3. 输入用户名和密码
4. 点击登录按钮
5. 观察浏览器控制台

### 根本原因
后端 Express 服务器未配置 CORS 中间件，导致跨域请求被浏览器拦截

### 解决方案

**方案 1：使用 cors 中间件（推荐）**

```javascript
// backend/src/app.ts
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**方案 2：手动设置 CORS 头**

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### 实施步骤
1. 安装 cors 包：`npm install cors`
2. 在 Express 应用中引入并使用
3. 重启后端服务
4. 测试登录功能

### 验证方法
```bash
# 使用 curl 测试
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"username":"test","password":"test"}'

# 检查响应头中是否包含 Access-Control-Allow-Origin
```

### 状态
✅ **已解决**（2026-04-20）

### 相关文档
- [API-CONTRACT.md#认证](../../docs/API-CONTRACT.md#认证)
- [ARCHITECTURE.md#安全考虑](./ARCHITECTURE.md#安全考虑)

---

## 问题 2：表单验证库版本冲突

### 问题描述
安装 react-hook-form@7.x 时与 yup@0.x 产生版本冲突

### 现象
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: frontend@1.0.0
npm ERR! Found: typescript@5.0.0
npm ERR! node_modules/typescript
npm ERR!   typescript@5.0.0 from the root project
npm ERR! 
npm ERR! Could not find a version for yup that matches ^0.32.0
```

### 复现步骤
1. 运行 `npm install react-hook-form@7.x`
2. 运行 `npm install yup@0.x`
3. 观察 npm 错误

### 根本原因
yup@0.x 依赖 TypeScript < 4.5，而项目使用 TypeScript 5.x，导致版本冲突

### 解决方案

**方案 1：升级 yup（推荐）**

```bash
npm install yup@1.x
```

**方案 2：使用 --legacy-peer-deps 标志**

```bash
npm install --legacy-peer-deps
```

**方案 3：使用其他验证库**

考虑使用 zod 或 joi 替代 yup

### 实施步骤
1. 删除 node_modules 和 package-lock.json
2. 升级 yup：`npm install yup@1.x`
3. 更新代码以适配新版本 API
4. 运行测试确保功能正常

### 验证方法
```bash
npm list yup
npm list react-hook-form
npm list typescript
```

### 状态
⏳ **待解决**（预计 2026-04-21）

### 相关文档
- [package.json](../package.json)
- [ARCHITECTURE.md#技术栈](./ARCHITECTURE.md#技术栈)

---

## 问题 3：API 响应超时

### 问题描述
某些 API 请求在网络不稳定时超时

### 现象
```
请求超时：GET /api/users 在 30 秒后返回 504 Gateway Timeout
```

### 复现步骤
1. 在网络不稳定的环境中测试
2. 发起 GET /api/users 请求
3. 等待 30 秒

### 根本原因
后端数据库查询性能不佳，导致响应时间过长

### 解决方案

**短期方案**：增加客户端超时时间

```javascript
// frontend/src/api/client.ts
const client = axios.create({
  timeout: 60000, // 60 秒
  baseURL: 'http://localhost:3001'
});
```

**长期方案**：优化数据库查询

```sql
-- 添加索引
CREATE INDEX idx_users_status ON users(status);

-- 优化查询
SELECT id, name, email FROM users WHERE status = 'active' LIMIT 100;
```

### 实施步骤
1. 短期：更新 axios 配置
2. 长期：分析慢查询日志，添加索引
3. 测试确保性能改善

### 验证方法
```bash
# 使用 curl 测试
time curl http://localhost:3001/api/users

# 检查响应时间是否 < 200ms
```

### 状态
🔄 **进行中**（预计 2026-04-22）

### 相关文档
- [ARCHITECTURE.md#性能考虑](./ARCHITECTURE.md#性能考虑)
- [docs/tech-debt.md#数据库查询优化](./tech-debt.md#数据库查询优化)

---

## 问题 4：[问题标题]

### 问题描述
[简要描述问题]

### 现象
[具体现象和错误信息]

### 复现步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

### 根本原因
[分析根本原因]

### 解决方案
[提供解决方案]

### 实施步骤
1. [步骤 1]
2. [步骤 2]

### 验证方法
[如何验证问题已解决]

### 状态
✅ 已解决 / ⏳ 待解决 / 🔄 进行中

### 相关文档
- [链接 1]
- [链接 2]

---

## 📊 问题统计

| 状态 | 数量 |
|------|------|
| ✅ 已解决 | 1 |
| ⏳ 待解决 | 1 |
| 🔄 进行中 | 1 |
| **总计** | **3** |

---

## 📝 更新规则

**何时更新**：
- 遇到新问题时
- 问题解决时
- 问题状态变更时

**更新内容**：
- 问题描述
- 复现步骤
- 根本原因
- 解决方案
- 验证方法
- 状态

**维护者**：Coding Agent
```
