# Spec: 家用物品管理应用（HomeStock）

**版本**：v1.0  
**日期**：2026-04-20  
**关联 PRD**：家用物品管理应用-PRD.md  

---

## Objective

构建一个家庭共享的物品库存管理 Web 应用，帮助家庭成员随时掌握家中物品存量，在库存不足时收到提醒，并通过购物清单完成补购闭环。

**P1 验收标准（具体可测）：**

- 用户可注册/登录，创建或加入一个家庭空间
- 用户可添加物品（名称、分类、单位），设置初始库存数量
- 用户可在列表页通过 +/- 快速调整库存数量，操作响应 ≤ 500ms
- 库存数量 ≤ 警告线时，通知中心出现未读提醒
- 用户可从通知中心一键将物品加入购物清单
- 用户可手动向购物清单添加物品
- 用户可勾选已购物品并执行入库，库存数量自动更新
- 同一家庭的多个成员登录后看到相同的库存数据
- 首屏加载时间 ≤ 2 秒（正常网络）
- 在 375px 宽度的手机浏览器上，核心操作可单手完成

**P1 不包含（明确排除）：**

- 保质期/批次管理（P2）
- 位置追踪（P2）
- 预算统计（P2）
- 定期重复购买（P3）
- PWA / 离线支持（P3）
- 条码扫描、图片识别

---

## Tech Stack

| 层次 | 选型 | 版本 |
|------|------|------|
| 前端框架 | React | ^19 |
| 语言 | TypeScript | ^5 |
| 构建工具 | Vite | ^6 |
| UI 组件库 | shadcn/ui + Tailwind CSS v4 | latest |
| 路由 | React Router | ^7 |
| 服务端状态 | TanStack Query | ^5 |
| 数据库 | 美团 AI Base（PostgreSQL + PostgREST） | — |
| 数据库 SDK | @supabase/supabase-js | ^2 |
| 认证 | AI Base 内置认证（邮箱+密码） | — |
| 表单 | React Hook Form + Zod | latest |
| 单元测试 | Vitest + Testing Library | latest |
| E2E 测试 | Playwright | latest |
| 部署 | Vercel | — |

> AI Base 100% 兼容 Supabase 客户端 SDK，直接替换 endpoint/key 即可。

---

## Commands

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 单元测试
pnpm test

# 单元测试（带覆盖率）
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 类型检查
pnpm typecheck

# Lint
pnpm lint

# Lint 自动修复
pnpm lint:fix
```

---

## Project Structure

```
homestock/
├── public/                  # 静态资源
├── src/
│   ├── main.tsx             # 应用入口
│   ├── App.tsx              # 根组件 + 路由配置
│   ├── lib/
│   │   ├── supabase.ts      # AI Base 客户端初始化（单例）
│   │   ├── utils.ts         # 通用工具函数
│   │   └── constants.ts     # 常量（分类枚举、默认值等）
│   ├── types/
│   │   ├── database.ts      # AI Base 生成的 TS 类型（自动生成，勿手改）
│   │   └── index.ts         # 业务类型定义
│   ├── hooks/
│   │   ├── useAuth.ts       # 认证状态 hook
│   │   ├── useFamily.ts     # 家庭空间 hook
│   │   ├── useItems.ts      # 物品列表 hook
│   │   ├── useInventory.ts  # 库存操作 hook
│   │   ├── useAlerts.ts     # 通知/警告 hook
│   │   └── useShoppingList.ts # 购物清单 hook
│   ├── components/
│   │   ├── ui/              # shadcn/ui 基础组件（自动生成，勿手改）
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx    # 主布局（导航栏 + 内容区）
│   │   │   └── AuthLayout.tsx   # 认证页布局
│   │   ├── items/
│   │   │   ├── ItemCard.tsx     # 物品卡片（含 +/- 按钮）
│   │   │   ├── ItemList.tsx     # 物品列表
│   │   │   ├── ItemForm.tsx     # 添加/编辑物品表单
│   │   │   └── ItemFilter.tsx   # 筛选栏
│   │   ├── alerts/
│   │   │   ├── AlertBadge.tsx   # 导航栏未读角标
│   │   │   └── AlertCenter.tsx  # 通知中心面板
│   │   └── shopping/
│   │       ├── ShoppingList.tsx     # 购物清单主视图
│   │       ├── ShoppingItem.tsx     # 清单项（含勾选）
│   │       └── CheckoutDialog.tsx   # 入库确认弹窗
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── onboarding/
│   │   │   └── FamilySetupPage.tsx  # 创建/加入家庭
│   │   ├── inventory/
│   │   │   └── InventoryPage.tsx    # 库存主页
│   │   ├── shopping/
│   │   │   └── ShoppingPage.tsx     # 购物清单页
│   │   └── settings/
│   │       └── SettingsPage.tsx     # 设置页（警告线、成员管理）
│   └── stores/
│       └── uiStore.ts       # 轻量 UI 状态（Zustand，仅用于弹窗/面板开关）
├── supabase/
│   └── migrations/          # 数据库迁移文件（版本化 SQL）
│       ├── 001_init_schema.sql
│       ├── 002_rls_policies.sql
│       └── ...
├── tests/
│   ├── unit/                # 单元测试（与 src 结构对应）
│   └── e2e/                 # E2E 测试
│       ├── auth.spec.ts
│       ├── inventory.spec.ts
│       └── shopping.spec.ts
├── .env.local               # 本地环境变量（不提交）
├── .env.example             # 环境变量模板（提交）
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

### 核心表设计

```sql
-- 家庭空间
CREATE TABLE families (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  invite_code             text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  invite_code_expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- 用户档案（关联 auth.users）
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id  uuid REFERENCES families(id),
  nickname   text NOT NULL,
  role       text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 物品库
CREATE TABLE items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name        text NOT NULL,
  category    text NOT NULL CHECK (category IN ('food','daily','medicine','appliance','other')),
  group_name  text,
  tags        text[] DEFAULT '{}',
  unit        text NOT NULL,
  note        text,
  is_archived boolean NOT NULL DEFAULT false,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 库存记录
CREATE TABLE inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  family_id     uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  quantity      numeric NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  alert_threshold numeric NOT NULL DEFAULT 1 CHECK (alert_threshold >= 0),
  updated_by    uuid REFERENCES profiles(id),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 库存变更历史
CREATE TABLE inventory_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  family_id    uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  quantity_before numeric NOT NULL,
  quantity_after  numeric NOT NULL,
  changed_by   uuid REFERENCES profiles(id),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 通知记录
CREATE TABLE alerts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  item_id    uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('low_stock', 'out_of_stock')),
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 购物清单
CREATE TABLE shopping_list (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id        uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  item_id          uuid REFERENCES items(id) ON DELETE SET NULL,
  item_name        text NOT NULL,  -- 冗余字段，支持临时物品
  planned_quantity numeric NOT NULL DEFAULT 1,
  actual_quantity  numeric,
  price            numeric,
  source           text NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('manual', 'alert', 'recurring')),
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'purchased', 'done')),
  added_by         uuid REFERENCES profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
```

### RLS 策略原则

所有表均启用 RLS，核心规则：**用户只能读写自己 family_id 对应的数据**。

```sql
-- 示例：items 表的 RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family members can view items"
  ON items FOR SELECT
  USING (family_id = (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "family members can insert items"
  ON items FOR INSERT
  WITH CHECK (family_id = (SELECT family_id FROM profiles WHERE id = auth.uid()));
```

---

## Code Style

### 命名约定

```typescript
// 组件：PascalCase
export function ItemCard({ item, onQuantityChange }: ItemCardProps) {}

// Hook：use 前缀 + camelCase
export function useInventory(familyId: string) {}

// 类型/接口：PascalCase，Props 后缀用于组件 Props
interface ItemCardProps {
  item: Item
  onQuantityChange: (itemId: string, delta: number) => void
}

// 常量：SCREAMING_SNAKE_CASE
export const ITEM_CATEGORIES = ['food', 'daily', 'medicine', 'appliance', 'other'] as const

// 数据库查询：通过 supabase client，不裸写 fetch
const { data, error } = await supabase
  .from('items')
  .select('*, inventory(*)')
  .eq('family_id', familyId)
  .eq('is_archived', false)
```

### 关键约定

- 所有异步操作必须处理 error，不允许 `data!` 非空断言忽略错误
- 组件 Props 必须有明确的 TypeScript 类型，禁止 `any`
- 数据库操作统一在 hooks 层，页面组件不直接调用 supabase
- 表单验证统一用 Zod schema，不在组件内写 if 判断
- 环境变量通过 `import.meta.env.VITE_*` 访问，敏感 key 只用 `VITE_SUPABASE_ANON_KEY`（不暴露 serviceRoleKey）

### 环境变量

```bash
# .env.example
VITE_SUPABASE_URL=https://your-branch.aibase.sankuai.com
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Testing Strategy

### 单元测试（Vitest）

- **覆盖范围**：hooks 中的业务逻辑、工具函数、Zod schema 验证
- **不测试**：纯 UI 渲染、shadcn/ui 组件内部
- **覆盖率要求**：hooks/ 和 lib/ 目录 ≥ 80%
- **Mock 策略**：supabase client 统一 mock，不发真实请求

```typescript
// tests/unit/hooks/useInventory.test.ts 示例结构
describe('useInventory', () => {
  it('should trigger alert when quantity drops below threshold', async () => {})
  it('should not trigger duplicate alert on same day', async () => {})
  it('should record inventory log on quantity change', async () => {})
})
```

### E2E 测试（Playwright）

覆盖 3 条核心用户路径：

```
e2e/auth.spec.ts        — 注册 → 创建家庭 → 登录
e2e/inventory.spec.ts   — 添加物品 → 调整库存 → 触发警告 → 加入购物清单
e2e/shopping.spec.ts    — 查看购物清单 → 勾选已购 → 入库 → 库存更新
```

---

## Boundaries

**Always（必须做）：**
- 所有数据库操作通过 hooks 封装，页面组件不直接调用 supabase
- 新建数据库表必须同时添加 RLS 策略
- 迁移文件用 `apply-migration` 执行，不用 `execute-sql` 做 DDL
- 提交前运行 `pnpm typecheck && pnpm lint`
- 环境变量变更同步更新 `.env.example`

**Ask First（先确认）：**
- 修改已有数据库表结构（加列、改类型）
- 新增第三方依赖
- 修改 RLS 策略
- 调整 P1 功能范围

**Never（绝对禁止）：**
- 在前端代码中使用或暴露 `serviceRoleKey`
- 跳过 RLS，用 serviceRoleKey 绕过权限
- 直接修改 `src/types/database.ts`（由 AI Base CLI 自动生成）
- 直接修改 `src/components/ui/` 下的 shadcn 组件
- 删除或注释掉失败的测试而不修复

---

## Decisions

以下问题已确认（2026-04-20）：

1. **AI Base workspace**：已有可用 workspace，直接接入，无需新建。
2. **邀请码有效期**：邀请码有效期为 **7 天**，过期后需重新生成。需在 `families` 表增加 `invite_code_expires_at timestamptz` 字段，并在加入逻辑中校验。
3. **数量支持小数**：库存数量支持小数（`numeric` 类型保留）。UI 上 +/- 按钮默认步长为 1，但允许用户手动输入小数值（如 0.5）。
4. **通知不自动清理**：已读通知永久保留，由用户手动删除。`alerts` 表无需 TTL 或定时清理逻辑。

---

*Spec 文档 · v1.1 · 2026-04-20（Decisions 章节替换 Open Questions）*
