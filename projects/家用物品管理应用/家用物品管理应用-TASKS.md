# Tasks: 家用物品管理应用 P1 任务清单

**版本**：v1.0  
**日期**：2026-04-20  
**关联 Plan**：家用物品管理应用-PLAN.md  

> 每个任务完成后在 `[ ]` 中打 `x`。  
> 每个任务有明确的验收标准（Acceptance）和验证方式（Verify）。

---

## M0：基础设施

- [ ] **T01**：初始化 Vite + React + TypeScript 项目
  - Acceptance：`pnpm dev` 启动成功，浏览器显示默认页面，无 TS 报错
  - Verify：`pnpm dev` + `pnpm typecheck`
  - Files：`package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`

- [ ] **T02**：配置 Tailwind CSS v4 + shadcn/ui
  - Acceptance：shadcn Button 组件可正常渲染，样式生效
  - Verify：在 App.tsx 中渲染一个 `<Button>` 并目视确认
  - Files：`tailwind.config.ts`, `src/index.css`, `components.json`

- [ ] **T03**：配置 AI Base 客户端
  - Acceptance：`supabase.from('profiles').select()` 不报网络错误（可能返回空数组）
  - Verify：在浏览器控制台手动调用，确认连通
  - Files：`src/lib/supabase.ts`, `.env.local`, `.env.example`

- [ ] **T04**：配置 React Router 路由骨架
  - Acceptance：访问 `/login`、`/register`、`/`、`/shopping` 各自渲染对应的空页面占位组件，无 404
  - Verify：手动访问各路由
  - Files：`src/App.tsx`, `src/pages/` 下各空页面文件

- [ ] **T05**：配置 TanStack Query + 测试环境
  - Acceptance：`pnpm test` 运行成功（0 个测试）；`pnpm test:e2e` 运行成功（0 个测试）
  - Verify：`pnpm test && pnpm test:e2e`
  - Files：`src/main.tsx`（QueryClientProvider）, `vitest.config.ts`, `playwright.config.ts`

- [ ] **T06**：配置 Vercel 部署
  - Acceptance：推送到 main 分支后，Vercel 自动构建成功，预览链接可访问
  - Verify：访问 Vercel 预览 URL
  - Files：`vercel.json`（如需）

---

## M1：认证 & 家庭空间

- [ ] **T07**：执行数据库迁移 001 — 创建 families & profiles 表
  - Acceptance：`list-tables` 返回 `families` 和 `profiles` 两张表
  - Verify：`uv run ./scripts/call_meituan_aibase.py list-tables`
  - Files：`supabase/migrations/001_init_schema.sql`

- [ ] **T08**：执行数据库迁移 002 — 添加 RLS 策略
  - Acceptance：用 anon key 查询 families 表返回空数组（非报错），说明 RLS 生效
  - Verify：用 supabase-js anon client 执行 `select()`，确认返回 `[]` 而非报错
  - Files：`supabase/migrations/002_rls_policies.sql`

- [ ] **T09**：实现 useAuth hook
  - Acceptance：`signUp`、`signIn`、`signOut` 方法可用；`session` 状态在刷新后恢复
  - Verify：`pnpm test` — `tests/unit/hooks/useAuth.test.ts` 通过
  - Files：`src/hooks/useAuth.ts`, `tests/unit/hooks/useAuth.test.ts`

- [ ] **T10**：实现登录页 & 注册页
  - Acceptance：表单有 Zod 验证（邮箱格式、密码最少 8 位）；提交后跳转到 `/setup` 或 `/`
  - Verify：手动测试表单验证和提交流程
  - Files：`src/pages/auth/LoginPage.tsx`, `src/pages/auth/RegisterPage.tsx`

- [ ] **T11**：实现路由守卫
  - Acceptance：未登录访问 `/` 自动跳转 `/login`；已登录但无家庭访问 `/` 自动跳转 `/setup`
  - Verify：手动测试三种状态下的跳转行为
  - Files：`src/App.tsx`（或独立的 `ProtectedRoute` 组件）

- [ ] **T12**：实现家庭空间创建 & 加入页
  - Acceptance：可创建家庭（生成邀请码）；可输入邀请码加入已有家庭；完成后跳转 `/`
  - Verify：手动测试两条路径
  - Files：`src/pages/onboarding/FamilySetupPage.tsx`, `src/hooks/useFamily.ts`

- [ ] **T13**：E2E — 认证流程
  - Acceptance：`auth.spec.ts` 全部通过（注册 → 创建家庭 → 登出 → 登录）
  - Verify：`pnpm test:e2e -- auth.spec.ts`
  - Files：`tests/e2e/auth.spec.ts`

---

## M2：物品管理

- [ ] **T14**：执行数据库迁移 003 — 创建 items 表
  - Acceptance：`list-tables` 返回 `items` 表；用 service role 插入一条测试数据成功
  - Verify：`uv run ./scripts/call_meituan_aibase.py list-tables`
  - Files：`supabase/migrations/003_items.sql`

- [ ] **T15**：生成 TypeScript 类型
  - Acceptance：`src/types/database.ts` 包含 `items`、`families`、`profiles` 的类型定义
  - Verify：`pnpm typecheck` 无报错
  - Files：`src/types/database.ts`（自动生成）

- [ ] **T16**：实现 useItems hook
  - Acceptance：`fetchItems`（含筛选）、`addItem`、`updateItem`、`archiveItem` 可用
  - Verify：`pnpm test` — `tests/unit/hooks/useItems.test.ts` 通过
  - Files：`src/hooks/useItems.ts`, `tests/unit/hooks/useItems.test.ts`

- [ ] **T17**：实现物品列表页骨架 + ItemCard 组件
  - Acceptance：登录后 `/` 页面展示物品列表（含分类标签、单位）；列表为空时显示引导提示
  - Verify：手动添加 2～3 个物品后目视确认
  - Files：`src/pages/inventory/InventoryPage.tsx`, `src/components/items/ItemCard.tsx`, `src/components/items/ItemList.tsx`

- [ ] **T18**：实现 ItemForm 弹窗（添加/编辑）
  - Acceptance：表单含名称（必填）、分类（必填）、单位（必填）、分组、标签、备注字段；Zod 验证生效；提交后列表刷新
  - Verify：手动测试添加和编辑流程
  - Files：`src/components/items/ItemForm.tsx`

- [ ] **T19**：实现搜索 & 筛选
  - Acceptance：按名称搜索实时过滤；按分类筛选正确；按库存状态筛选（此阶段所有物品状态为「正常」）
  - Verify：手动测试各筛选条件
  - Files：`src/components/items/ItemFilter.tsx`

---

## M3：库存管理

- [ ] **T20**：执行数据库迁移 004 — 创建 inventory & inventory_logs 表
  - Acceptance：两张表创建成功；添加物品时自动创建对应 inventory 记录（应用层处理）
  - Verify：`list-tables` 确认；手动添加物品后查询 inventory 表
  - Files：`supabase/migrations/004_inventory.sql`

- [ ] **T21**：实现 useInventory hook
  - Acceptance：`adjustQuantity` 写入 inventory + inventory_logs；数量不能低于 0；乐观更新生效
  - Verify：`pnpm test` — `tests/unit/hooks/useInventory.test.ts` 通过
  - Files：`src/hooks/useInventory.ts`, `tests/unit/hooks/useInventory.test.ts`

- [ ] **T22**：在 ItemCard 中集成 +/- 按钮
  - Acceptance：点击 +/- 立即更新 UI（乐观更新）；刷新后数量与数据库一致；数量为 0 时 - 按钮禁用
  - Verify：手动测试；打开 Network 面板确认请求发出
  - Files：`src/components/items/ItemCard.tsx`

- [ ] **T23**：在 ItemForm 中添加警告线字段
  - Acceptance：编辑物品时可设置警告线数量（默认 1）；保存后 inventory 表 alert_threshold 更新
  - Verify：手动测试
  - Files：`src/components/items/ItemForm.tsx`, `src/hooks/useInventory.ts`

- [ ] **T24**：库存状态颜色指示
  - Acceptance：充足（绿）、≤ 警告线（黄）、= 0（红）三种状态颜色正确显示
  - Verify：手动调整数量到各状态，目视确认
  - Files：`src/components/items/ItemCard.tsx`

---

## M4：警告与提醒

- [ ] **T25**：执行数据库迁移 005 — 创建 alerts 表
  - Acceptance：alerts 表创建成功，RLS 策略生效
  - Verify：`list-tables` 确认
  - Files：`supabase/migrations/005_alerts.sql`

- [ ] **T26**：实现警告触发逻辑
  - Acceptance：`adjustQuantity` 后若触发条件满足，自动插入 alerts 记录；同一物品同一天不重复插入
  - Verify：`pnpm test` — `tests/unit/hooks/useInventory.test.ts`（新增警告触发用例）
  - Files：`src/hooks/useInventory.ts`（更新）

- [ ] **T27**：实现 useAlerts hook + AlertBadge 组件
  - Acceptance：未读通知数正确显示在导航栏角标；标记已读后角标数减少
  - Verify：手动触发警告后目视确认角标
  - Files：`src/hooks/useAlerts.ts`, `src/components/alerts/AlertBadge.tsx`

- [ ] **T28**：实现 AlertCenter 通知面板
  - Acceptance：点击角标展开面板；每条通知有「加入购物清单」和「忽略」按钮；操作后通知消失
  - Verify：手动测试两个按钮的行为
  - Files：`src/components/alerts/AlertCenter.tsx`

---

## M5：购物清单

- [ ] **T29**：执行数据库迁移 006 — 创建 shopping_list 表
  - Acceptance：shopping_list 表创建成功，RLS 策略生效
  - Verify：`list-tables` 确认
  - Files：`supabase/migrations/006_shopping_list.sql`

- [ ] **T30**：实现 useShoppingList hook
  - Acceptance：`addItem`、`togglePurchased`、`checkout` 方法可用；防重复添加逻辑生效
  - Verify：`pnpm test` — `tests/unit/hooks/useShoppingList.test.ts` 通过
  - Files：`src/hooks/useShoppingList.ts`, `tests/unit/hooks/useShoppingList.test.ts`

- [ ] **T31**：实现购物清单页面
  - Acceptance：清单按分类分组展示；可手动添加物品（含临时物品）；可删除清单项
  - Verify：手动测试添加和删除
  - Files：`src/pages/shopping/ShoppingPage.tsx`, `src/components/shopping/ShoppingList.tsx`, `src/components/shopping/ShoppingItem.tsx`

- [ ] **T32**：实现入库确认弹窗
  - Acceptance：勾选物品后点击「入库」弹出弹窗；可修改实际数量；确认后库存更新，清单项标记为 done
  - Verify：手动完成一次完整的购买入库流程
  - Files：`src/components/shopping/CheckoutDialog.tsx`

- [ ] **T33**：E2E — 购物清单流程
  - Acceptance：`shopping.spec.ts` 全部通过（添加物品 → 触发警告 → 加入清单 → 入库 → 库存更新）
  - Verify：`pnpm test:e2e -- shopping.spec.ts`
  - Files：`tests/e2e/shopping.spec.ts`

---

## 收尾

- [ ] **T34**：响应式布局检查
  - Acceptance：在 375px 宽度下，库存列表、+/- 按钮、购物清单均可正常使用
  - Verify：Chrome DevTools 模拟 iPhone SE，手动测试核心操作

- [ ] **T35**：性能检查
  - Acceptance：首屏加载 ≤ 2 秒（Vercel 生产环境）；+/- 操作响应 ≤ 500ms
  - Verify：Lighthouse 跑分；Network 面板计时

- [ ] **T36**：Open Questions 确认
  - Acceptance：SPEC.md 中的 4 个 Open Questions 全部有明确答案并更新到文档
  - Verify：检查 SPEC.md Open Questions 章节

---

**任务总计：36 个**  
**P1 核心路径**：T01 → T07 → T09 → T14 → T20 → T25 → T29（数据库 + 核心 hook 链路）

*Tasks 文档 · v1.0 · 2026-04-20*
