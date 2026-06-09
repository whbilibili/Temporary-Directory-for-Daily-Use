# Architecture — Plant Care Reminder

> 本文件是架构约束的权威来源。Coding Worker 每次新增约束时只追加，不推翻已有红线。

## Step 0 规模评估

- 业务域数量：6（家庭、认证、植物、任务、通知、PWA 引导）= 3 分
- 预估 Task 数：17-22 = 2 分
- 页面/路由数 + API/函数数：21+ = 3 分
- 数据表/集合数：7 = 1 分
- 会话并行需求：AI Coding Harness，多模块推进收益明确 = 2 分
- 总分：11 分

结论：采用 **模块化模式**。

## 技术栈

| 层次 | 技术选型 | 选型理由 |
|------|---------|---------|
| 框架 | React + Vite | 适合轻量 PWA，启动快，和 `app/` 目录匹配 |
| UI 样式 | Tailwind CSS v4 | 便于快速落地移动端设计系统 |
| 状态管理 | Zustand（仅 UI 状态） | 只承载轻量本地状态，避免过度全局化 |
| 服务端状态 | Convex `useQuery` / `useMutation` | 天然适配实时同步 |
| API 层 | Convex Functions | 单仓库全栈，减少额外 API 层样板 |
| 数据层 | Convex Schema + Functions | 适合共享数据、实时订阅和 cron |
| 数据库 | Convex 内置数据库 | 免运维，足够承载家庭内部应用 |
| 认证 | Convex Auth / 邮箱登录方案 | 简化家庭成员接入 |
| 部署 | Vercel + Convex Cloud | 免费层可用，发布成本低 |

## 项目目录摘要

```text
plant-care-reminder/
├── app/                  # 代码工作区（本次未动）
├── AGENTS.md
├── ARCHITECTURE.md
├── PLANS.md
└── docs/
    ├── product-specs/
    ├── design-docs/
    ├── exec-plans/
    ├── generated/
    └── ...
```

## 分层约束

```text
Page/Route -> Feature Component -> Hook -> Convex Client API -> Convex Function -> Convex Data
```

- `Page/Route`：只做路由参数解析、布局和组合
- `Feature Component`：负责界面行为，不直接做复杂数据拼装
- `Hook`：封装查询、mutation 调用和 UI 侧衍生状态
- `Convex Function`：唯一业务写入口，处理权限、计算、日志
- `Convex Data`：只保存最终状态和最小必要索引

## 数据层约束

- Schema 定义路径：`app/convex/schema.ts`
- 迁移策略：`npx convex dev --once --typecheck` + schema push
- 所有核心实体都带 `familyId`
- 时间统一以 UTC 保存，前端按本地时区展示
- 禁止在前端自行重算“真实下一次提醒时间”并覆盖后端结果

### 核心集合

- `users`
- `families`
- `familyMembers`
- `plants`
- `plantTasks`
- `taskCompletionLogs`
- `pushSubscriptions`

## 认证与授权

- Provider：Convex Auth 或兼容邮件登录方案
- Strategy：邮箱验证码 / magic link 优先
- 授权模型：同一家庭空间内默认协作，写操作必须校验当前用户属于该家庭
- 红线：任何任务完成、植物修改、推送订阅写入都必须带登录态

## 全局状态边界

- 全局 Store：仅放导航、对话框开关、一次性引导状态
- 服务端状态：植物列表、植物详情、待办列表、家庭成员、推送订阅状态
- 局部状态：表单草稿、图片上传中状态、筛选 UI 状态

## 设计系统约束

生成来源：`docs/generated/design-system/plant-care-reminder/MASTER.md`

- 风格：`Organic Biophilic`
- 字体：标题 `Lora`，正文 `Raleway`
- CSS Token：
  - `--color-primary: #2563EB`
  - `--color-secondary: #3B82F6`
  - `--color-cta: #F97316`
  - `--color-background: #F8FAFC`
  - `--color-text: #1E293B`
- 圆角：16-24px
- 响应式断点：375px / 768px / 1024px / 1440px
- 无障碍：4.5:1 对比度、可见焦点态、尊重 reduced motion、禁止 emoji 图标

## PWA 与通知约束

- Web Push 只作为增强提醒，不是唯一提醒渠道
- 主屏幕安装和通知授权必须有显式引导
- 待办页必须始终可看到到期任务
- 通知去重由服务端字段或通知日志保证，不依赖客户端记忆

## 环境变量规范

- 客户端可见：`VITE_CONVEX_URL`、公开 VAPID 公钥
- 服务端专用：私钥、认证密钥、管理密钥
- 红线：任何服务端密钥不得以 `VITE_` 前缀暴露

## 已废弃方案

| 方案 | 为什么不可行 | 被废弃时间 |
|------|------------|-----------|
| 纯本地静态网页 + 定时提醒 | iPhone 后台定时和共享同步都不可靠 | 2026-06-05 |

## 规范引用

| 任务类型 | 必读规范文件 |
|---------|-------------|
| TypeScript | `~/.catpaw/skills/skills-market/frontend-code-reviewer/references/ts.md` |
| React | `~/.catpaw/skills/skills-market/frontend-code-reviewer/references/react.md` |
| JavaScript | `~/.catpaw/skills/skills-market/frontend-code-reviewer/references/js.md` |
| Testing | `~/.catpaw/skills/skills-market/frontend-code-reviewer/references/testing.md` |
