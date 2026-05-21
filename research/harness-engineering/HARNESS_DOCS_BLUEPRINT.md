# Harness 文档体系完整规划

> 基于 Harness Engineering 六大支柱，为前后端分离项目设计的文档体系

## 📋 文档清单

### 第一层：全局文档（A/.agents/）

这一层由**项目架构师**维护，定义全局规则和协作契约。

| 文档 | 用途 | 更新频率 | 维护者 | 触发条件 |
|------|------|---------|--------|---------|
| **AGENTS.md** | 全局路由索引，指向前后端工程 | 初始化 + 新增工程 | 架构师 | 新增工程、工程目录变更 |
| **PLANS.md** | 全局计划和里程碑 | 每周/每迭代 | 产品/架构师 | 迭代开始、计划调整 |
| **API-CONTRACT.md** | 前后端接口契约 | 接口变更时 | 后端架构师 | 新增/修改 API、版本升级 |
| **DEPLOYMENT.md** | 部署流程和环境配置 | 环境变更时 | 运维/架构师 | 环境变更、部署流程优化 |
| **SECURITY.md** | 安全规则和禁令 | 发现安全问题时 | 架构师 | 安全漏洞、新的安全规范 |

### 第二层：工程文档（B/harness/ 和 C/harness/）

这一层由**工程 Agent**维护，记录该工程的任务和进度。

| 文档 | 用途 | 更新频率 | 维护者 | 触发条件 |
|------|------|---------|--------|---------|
| **feature-list.json** | 任务清单（待做/进行中/完成） | 每次任务变更 | Coding Agent | 新增任务、任务状态变更 |
| **progress.txt** | 进度记录（简洁版） | 每个会话结束 | Coding Agent | 会话结束、重要里程碑 |
| **ARCHITECTURE.md** | 架构约束和设计决策 | 架构变更时 | 架构师/Coding Agent | 新增模块、架构重构 |
| **docs/caveats.md** | 踩坑档案（已知问题和解决方案） | 发现问题时 | Coding Agent | 踩坑、bug 修复 |
| **docs/tech-debt.md** | 技术债清单 | 每周/每迭代 | Coding Agent | 新增技术债、债务清偿 |
| **docs/CHANGELOG.md** | 变更日志 | 每个版本发布 | Coding Agent | 版本发布、重要功能上线 |
| **.sync-state.json** | 同步检查点（harness 文档 vs 代码仓库） | 每个会话结束 | Coding Agent | 会话结束 |

### 第三层：会话文档（B/harness/memory/ 和 C/harness/memory/）

这一层由**Coding Agent**维护，记录每日工作上下文。

| 文档 | 用途 | 更新频率 | 维护者 | 触发条件 |
|------|------|---------|--------|---------|
| **memory/YYYY-MM-DD.md** | 每日工作日志 | 每个会话结束 | Coding Agent | 会话结束 |
| **memory/MEMORY.md** | 长期记忆（蒸馏精华） | 每周/每月 | Coding Agent | 定期蒸馏、知识沉淀 |

---

## 🔄 更新流程

### 场景 1：Coding Agent 开始新任务

```
触发条件：feature-list.json 中有新的 in_progress 任务

执行步骤：
1. 读取 feature-list.json 中的任务描述
2. 读取 ARCHITECTURE.md 了解架构约束
3. 读取 docs/caveats.md 了解已知问题
4. 读取 memory/YYYY-MM-DD.md 了解今日上下文
5. 开始编码

更新文档：无（只读）
```

### 场景 2：Coding Agent 完成一个任务

```
触发条件：任务代码完成、测试通过

执行步骤：
1. 更新 feature-list.json：status = completed
2. 更新 progress.txt：添加完成记录
3. 如果有新的架构决策 → 更新 ARCHITECTURE.md
4. 如果踩坑了 → 更新 docs/caveats.md
5. 如果有技术债 → 更新 docs/tech-debt.md
6. 提交代码到本地分支（不入公共仓库）

更新文档：feature-list.json, progress.txt, ARCHITECTURE.md, docs/caveats.md, docs/tech-debt.md
维护者：Coding Agent
```

### 场景 3：会话结束（session-handoff）

```
触发条件：用户说"结束会话"、"保存进度"、"交接棒"

执行步骤：
1. 更新 progress.txt：记录本次会话的成果
2. 更新 feature-list.json：同步任务状态
3. 生成 memory/YYYY-MM-DD.md：记录今日工作日志
4. 生成 .sync-state.json：记录同步检查点
5. 检查代码是否已提交到本地分支
6. 生成交接报告

更新文档：progress.txt, feature-list.json, memory/YYYY-MM-DD.md, .sync-state.json
维护者：Coding Agent（通过 session-handoff skill）
```

### 场景 4：发现 Bug 或技术问题

```
触发条件：Coding Agent 发现 bug、接口异常、性能问题

执行步骤：
1. 写入 docs/caveats.md：问题描述 + 复现步骤 + 临时解决方案
2. 如果是技术债 → 写入 docs/tech-debt.md
3. 如果需要排期修复 → 写入 issues.json（通过 issue-triage skill）

更新文档：docs/caveats.md, docs/tech-debt.md, issues.json
维护者：Coding Agent
```

### 场景 5：架构变更或新增模块

```
触发条件：新增模块、重构架构、引入新技术栈

执行步骤：
1. 更新 ARCHITECTURE.md：新增模块描述、设计决策、约束条件
2. 更新全局 API-CONTRACT.md（如果涉及接口变更）
3. 更新 progress.txt：记录架构变更

更新文档：ARCHITECTURE.md, API-CONTRACT.md, progress.txt
维护者：架构师 / Coding Agent
```

### 场景 6：版本发布

```
触发条件：功能完成、准备发布

执行步骤：
1. 生成 docs/CHANGELOG.md：记录本版本的功能、bug 修复、已知问题
2. 更新 progress.txt：标记版本号
3. 更新 feature-list.json：标记相关任务为 released

更新文档：docs/CHANGELOG.md, progress.txt, feature-list.json
维护者：Coding Agent / 发布管理员
```

### 场景 7：定期知识蒸馏（每周/每月）

```
触发条件：每周五 / 每月月末

执行步骤：
1. 读取 memory/YYYY-MM-DD.md（过去 7 天的日志）
2. 提取高价值条目（架构决策、踩坑经验、最佳实践）
3. 写入 memory/MEMORY.md（长期记忆）
4. 清理过期的日志条目

更新文档：memory/MEMORY.md
维护者：Coding Agent（通过定时任务或手动触发）
```

### 场景 8：定期健康巡检（每周）

```
触发条件：每周一 / 或用户主动运行 harness-watchdog

执行步骤：
1. 检查 feature-list.json：是否有僵尸任务（in_progress 超期）
2. 检查 progress.txt：是否过长需要裁剪
3. 检查 ARCHITECTURE.md：是否与代码实现一致
4. 检查 .sync-state.json：是否过期（>7 天未更新）
5. 检查 docs/caveats.md：是否有已解决的问题需要清理
6. 生成健康报告

更新文档：无（只读 + 生成报告）
维护者：harness-watchdog（自动化工具）
```

---

## 📊 文档优先级和内容规范

### 优先级 P0（必须有）

| 文档 | 最小内容 | 示例 |
|------|---------|------|
| **feature-list.json** | 任务 ID、标题、状态、优先级 | `{"id": "TASK-001", "title": "实现用户登录", "status": "in_progress", "priority": "P0"}` |
| **progress.txt** | 日期、完成的任务、遇到的问题 | `[2026-04-20] 完成登录页面 UI，遇到 CORS 问题` |
| **ARCHITECTURE.md** | 模块划分、关键设计决策 | `## 模块划分\n- auth: 认证模块\n- api: API 层` |

### 优先级 P1（强烈推荐）

| 文档 | 最小内容 | 示例 |
|------|---------|------|
| **docs/caveats.md** | 问题描述、复现步骤、解决方案 | `## CORS 问题\n复现：POST /api/login 返回 CORS 错误\n解决：配置 CORS 中间件` |
| **API-CONTRACT.md** | 接口路径、请求/响应格式、错误码 | `POST /api/login\nRequest: {username, password}\nResponse: {token, user}` |
| **.sync-state.json** | 最后同步时间、harness 版本、代码 commit | `{"last_sync": "2026-04-20T10:30:00Z", "code_commit": "abc123"}` |

### 优先级 P2（可选但有益）

| 文档 | 最小内容 | 示例 |
|------|---------|------|
| **docs/tech-debt.md** | 债务描述、优先级、预计工作量 | `## 重构登录逻辑\n优先级：P2\n工作量：2 天` |
| **docs/CHANGELOG.md** | 版本号、功能列表、bug 修复 | `## v1.0.0\n- 实现用户登录\n- 修复 CORS 问题` |
| **memory/MEMORY.md** | 架构决策、最佳实践、常见问题 | `## 认证流程\n使用 JWT token，有效期 24 小时` |

---

## 🛡️ 防污染和隔离机制

### 1. .gitignore 配置（防止 harness 文档进入公共仓库）

**B/code-repo/.gitignore**
```gitignore
# 防止 harness 文档污染公共仓库
../harness/
../.sync-state.json
```

### 2. 文档版本控制（可选）

如果需要追踪 harness 文档的变更历史，可以在 `A/` 目录下初始化一个独立的 Git 仓库：

```bash
cd A/
git init harness-docs
git config user.name "Harness Agent"
git config user.email "agent@example.com"

# 每次会话结束时提交
git add -A
git commit -m "Session: $(date +%Y-%m-%d) - Task: TASK-001"
```

### 3. 权限隔离（可选）

```bash
# 只有 Coding Agent 可以修改 harness 文档
chmod 755 B/harness/
chmod 644 B/harness/*.json
chmod 644 B/harness/*.txt
chmod 644 B/harness/*.md

# 代码仓库由 Git 管理
chmod 755 B/code-repo/
```

---

## 📈 文档生命周期

```
创建 → 活跃 → 蒸馏 → 归档 → 删除
```

### 创建阶段
- 新任务 → 写入 feature-list.json
- 新问题 → 写入 docs/caveats.md
- 新决策 → 写入 ARCHITECTURE.md

### 活跃阶段
- 定期更新（每个会话结束）
- 频繁读取（Coding Agent 参考）

### 蒸馏阶段（每周/每月）
- 从 memory/YYYY-MM-DD.md 提取高价值条目
- 写入 memory/MEMORY.md
- 清理过期日志

### 归档阶段
- 已完成的任务 → 移到 CHANGELOG.md
- 已解决的问题 → 从 caveats.md 移到 CHANGELOG.md
- 已清偿的技术债 → 从 tech-debt.md 移到 CHANGELOG.md

### 删除阶段
- 超过 1 年的日志 → 删除
- 已归档的条目 → 删除

---

## 🔍 文档一致性检查清单

### 每个会话结束时检查

- [ ] feature-list.json 中的任务状态是否与代码分支一致？
- [ ] progress.txt 中的记录是否准确？
- [ ] ARCHITECTURE.md 中的约束是否被代码遵守？
- [ ] docs/caveats.md 中的问题是否有解决方案？
- [ ] .sync-state.json 是否已更新？

### 每周检查

- [ ] 是否有僵尸任务（in_progress 超期）？
- [ ] progress.txt 是否过长需要裁剪？
- [ ] ARCHITECTURE.md 是否与代码实现一致？
- [ ] docs/tech-debt.md 中的债务是否需要排期？
- [ ] memory/YYYY-MM-DD.md 是否需要蒸馏到 MEMORY.md？

### 每月检查

- [ ] API-CONTRACT.md 是否与实现一致？
- [ ] DEPLOYMENT.md 是否需要更新？
- [ ] SECURITY.md 中的规则是否被遵守？
- [ ] 是否有过期的日志需要删除？

---

## 📝 文档模板

### feature-list.json 模板

```json
{
  "version": "1.0",
  "project": "frontend",
  "tasks": [
    {
      "id": "TASK-001",
      "title": "实现用户登录页面",
      "description": "创建登录表单，集成认证 API",
      "status": "in_progress",
      "priority": "P0",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z",
      "acceptance_criteria": [
        "表单验证正确",
        "API 集成成功",
        "错误提示清晰"
      ],
      "branch": "feature/login-page",
      "related_docs": [
        "ARCHITECTURE.md#认证模块",
        "API-CONTRACT.md#POST /api/login"
      ]
    }
  ]
}
```

### progress.txt 模板

```
# 前端工程进度记录

## 2026-04-20

### 完成
- [x] 登录页面 UI 设计
- [x] 表单验证逻辑
- [x] API 集成

### 进行中
- [ ] 错误处理
- [ ] 单元测试

### 遇到的问题
- CORS 错误：已解决（见 docs/caveats.md）
- 表单验证库版本冲突：待解决

### 下一步
- 完成单元测试
- 代码审查
- 合并到 develop 分支

---

## 2026-04-19

### 完成
- [x] 项目初始化
- [x] 依赖安装

### 进行中
- [ ] 登录页面 UI 设计

---
```

### ARCHITECTURE.md 模板

```markdown
# 前端架构文档

## 模块划分

### auth 模块
- 职责：用户认证和授权
- 关键文件：src/modules/auth/
- 依赖：API 层、状态管理

### api 模块
- 职责：API 请求和响应处理
- 关键文件：src/modules/api/
- 依赖：HTTP 客户端

## 关键设计决策

### 1. 使用 JWT Token 进行认证
- 决策时间：2026-04-20
- 原因：无状态、易于扩展
- 权衡：需要处理 token 刷新

### 2. 使用 Redux 进行状态管理
- 决策时间：2026-04-20
- 原因：集中管理、易于调试
- 权衡：样板代码较多

## 架构约束

### 禁止
- ❌ 直接修改全局状态（必须通过 action）
- ❌ 在组件中进行 API 调用（必须通过 middleware）
- ❌ 跨模块直接依赖（必须通过接口）

### 推荐
- ✅ 使用 TypeScript 进行类型检查
- ✅ 编写单元测试（覆盖率 > 80%）
- ✅ 使用 ESLint 进行代码检查

## 技术栈

- React 18.x
- Redux Toolkit
- TypeScript 5.x
- Jest + React Testing Library
```

### docs/caveats.md 模板

```markdown
# 踩坑档案

## CORS 错误

### 问题描述
POST /api/login 返回 CORS 错误：`Access-Control-Allow-Origin` 缺失

### 复现步骤
1. 打开登录页面
2. 输入用户名和密码
3. 点击登录按钮
4. 观察浏览器控制台

### 根本原因
后端 CORS 中间件未正确配置

### 解决方案
在后端 Express 中间件中添加：
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 状态
✅ 已解决（2026-04-20）

---

## 表单验证库版本冲突

### 问题描述
安装 react-hook-form@7.x 时与 yup@0.x 冲突

### 复现步骤
1. npm install react-hook-form@7.x
2. npm install yup@0.x
3. 运行 npm start

### 根本原因
yup@0.x 依赖 TypeScript < 4.5，而项目使用 TypeScript 5.x

### 解决方案
升级 yup 到 1.x：
```bash
npm install yup@1.x
```

### 状态
⏳ 待解决（预计 2026-04-21）
```

---

## 🎯 总结

| 维度 | 说明 |
|------|------|
| **文档数量** | 全局 5 个 + 工程 7 个 + 会话 2 个 = 14 个 |
| **更新频率** | 高频（每个会话）、中频（每周）、低频（每月） |
| **维护者** | Coding Agent（80%）+ 架构师（20%） |
| **隔离机制** | .gitignore + 独立目录 + 权限控制 |
| **防污染** | harness 文档不入公共仓库 |
| **可追溯性** | 每个文档都有时间戳和维护者信息 |

