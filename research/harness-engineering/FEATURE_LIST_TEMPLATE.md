# feature-list.json 模板 - 任务清单

> 结构化管理所有任务，支持 Agent 自动化处理

```json
{
  "version": "1.0",
  "project": "frontend",
  "project_type": "frontend",
  "created_at": "2026-04-20T10:00:00Z",
  "updated_at": "2026-04-20T14:30:00Z",
  "metadata": {
    "total_tasks": 10,
    "completed_tasks": 3,
    "in_progress_tasks": 2,
    "pending_tasks": 5,
    "completion_rate": 0.30
  },
  "tasks": [
    {
      "id": "TASK-001",
      "title": "实现用户登录页面",
      "description": "创建登录表单，集成认证 API，实现表单验证和错误处理",
      "status": "completed",
      "priority": "P0",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z",
      "started_at": "2026-04-20T10:30:00Z",
      "completed_at": "2026-04-20T14:30:00Z",
      "estimated_hours": 4,
      "actual_hours": 4.5,
      "acceptance_criteria": [
        "表单验证正确（邮箱格式、密码强度）",
        "API 集成成功（调用 POST /api/login）",
        "错误提示清晰（显示具体错误信息）",
        "单元测试覆盖率 > 80%"
      ],
      "branch": "feature/login-page",
      "related_docs": [
        "ARCHITECTURE.md#认证模块",
        "API-CONTRACT.md#POST /api/login",
        "docs/caveats.md#CORS错误"
      ],
      "dependencies": [],
      "blockers": [],
      "notes": "已完成，等待代码审查"
    },
    {
      "id": "TASK-002",
      "title": "实现用户注册页面",
      "description": "创建注册表单，实现邮箱验证，集成注册 API",
      "status": "in_progress",
      "priority": "P0",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z",
      "started_at": "2026-04-20T14:30:00Z",
      "completed_at": null,
      "estimated_hours": 5,
      "actual_hours": 2,
      "acceptance_criteria": [
        "表单验证正确",
        "邮箱验证流程完整",
        "API 集成成功",
        "单元测试覆盖率 > 80%"
      ],
      "branch": "feature/register-page",
      "related_docs": [
        "ARCHITECTURE.md#认证模块",
        "API-CONTRACT.md#POST /api/register"
      ],
      "dependencies": ["TASK-001"],
      "blockers": [],
      "notes": "进行中，预计明天完成"
    },
    {
      "id": "TASK-003",
      "title": "实现用户个人资料页面",
      "description": "创建个人资料页面，支持编辑用户信息",
      "status": "in_progress",
      "priority": "P1",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T14:30:00Z",
      "started_at": "2026-04-20T14:30:00Z",
      "completed_at": null,
      "estimated_hours": 3,
      "actual_hours": 1,
      "acceptance_criteria": [
        "显示用户信息",
        "支持编辑用户信息",
        "API 集成成功",
        "单元测试覆盖率 > 80%"
      ],
      "branch": "feature/profile-page",
      "related_docs": [
        "ARCHITECTURE.md#用户模块",
        "API-CONTRACT.md#GET /api/user, PUT /api/user"
      ],
      "dependencies": ["TASK-001"],
      "blockers": [],
      "notes": "进行中"
    },
    {
      "id": "TASK-004",
      "title": "实现首页仪表板",
      "description": "创建首页仪表板，显示用户统计信息",
      "status": "pending",
      "priority": "P1",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 4,
      "actual_hours": 0,
      "acceptance_criteria": [
        "显示用户统计信息",
        "支持数据刷新",
        "API 集成成功",
        "单元测试覆盖率 > 80%"
      ],
      "branch": "feature/dashboard",
      "related_docs": [
        "ARCHITECTURE.md#仪表板模块",
        "API-CONTRACT.md#GET /api/dashboard"
      ],
      "dependencies": ["TASK-001"],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-005",
      "title": "实现单元测试",
      "description": "为所有组件编写单元测试，确保覆盖率 > 80%",
      "status": "pending",
      "priority": "P1",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 8,
      "actual_hours": 0,
      "acceptance_criteria": [
        "所有组件都有单元测试",
        "测试覆盖率 > 80%",
        "所有测试通过"
      ],
      "branch": "feature/unit-tests",
      "related_docs": [
        "ARCHITECTURE.md#测试策略"
      ],
      "dependencies": ["TASK-001", "TASK-002", "TASK-003"],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-006",
      "title": "实现 E2E 测试",
      "description": "编写 E2E 测试，测试用户流程",
      "status": "pending",
      "priority": "P2",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 6,
      "actual_hours": 0,
      "acceptance_criteria": [
        "编写登录流程 E2E 测试",
        "编写注册流程 E2E 测试",
        "所有 E2E 测试通过"
      ],
      "branch": "feature/e2e-tests",
      "related_docs": [
        "ARCHITECTURE.md#测试策略"
      ],
      "dependencies": ["TASK-001", "TASK-002"],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-007",
      "title": "代码审查和优化",
      "description": "进行代码审查，优化代码质量",
      "status": "pending",
      "priority": "P1",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 4,
      "actual_hours": 0,
      "acceptance_criteria": [
        "所有代码都通过 ESLint 检查",
        "所有代码都通过 TypeScript 类型检查",
        "代码风格一致"
      ],
      "branch": "feature/code-review",
      "related_docs": [
        "ARCHITECTURE.md#架构约束"
      ],
      "dependencies": ["TASK-001", "TASK-002", "TASK-003"],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-008",
      "title": "性能优化",
      "description": "优化应用性能，减少加载时间",
      "status": "pending",
      "priority": "P2",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 5,
      "actual_hours": 0,
      "acceptance_criteria": [
        "首屏加载时间 < 2 秒",
        "API 响应时间 < 200ms",
        "Lighthouse 评分 > 90"
      ],
      "branch": "feature/performance",
      "related_docs": [
        "ARCHITECTURE.md#性能考虑",
        "docs/tech-debt.md#性能优化"
      ],
      "dependencies": [],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-009",
      "title": "文档编写",
      "description": "编写项目文档和 API 文档",
      "status": "pending",
      "priority": "P2",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 3,
      "actual_hours": 0,
      "acceptance_criteria": [
        "编写 README.md",
        "编写 API 文档",
        "编写开发指南"
      ],
      "branch": "feature/documentation",
      "related_docs": [],
      "dependencies": [],
      "blockers": [],
      "notes": "待开始"
    },
    {
      "id": "TASK-010",
      "title": "发布 v1.0.0",
      "description": "准备发布第一个版本",
      "status": "pending",
      "priority": "P0",
      "assignee": "frontend-agent",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z",
      "started_at": null,
      "completed_at": null,
      "estimated_hours": 2,
      "actual_hours": 0,
      "acceptance_criteria": [
        "所有任务完成",
        "所有测试通过",
        "版本号更新为 1.0.0",
        "生成 CHANGELOG"
      ],
      "branch": "release/v1.0.0",
      "related_docs": [
        "docs/CHANGELOG.md"
      ],
      "dependencies": ["TASK-001", "TASK-002", "TASK-003", "TASK-004", "TASK-005", "TASK-006", "TASK-007"],
      "blockers": [],
      "notes": "待开始"
    }
  ]
}
```

## 📝 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务唯一标识（TASK-001） |
| `title` | string | 任务标题 |
| `description` | string | 任务详细描述 |
| `status` | enum | pending / in_progress / completed / blocked |
| `priority` | enum | P0 / P1 / P2 / P3 |
| `assignee` | string | 任务分配人 |
| `created_at` | ISO8601 | 创建时间 |
| `updated_at` | ISO8601 | 最后更新时间 |
| `started_at` | ISO8601 | 开始时间 |
| `completed_at` | ISO8601 | 完成时间 |
| `estimated_hours` | number | 预计工作时间 |
| `actual_hours` | number | 实际工作时间 |
| `acceptance_criteria` | array | 验收标准 |
| `branch` | string | 对应的 Git 分支 |
| `related_docs` | array | 相关文档链接 |
| `dependencies` | array | 依赖的其他任务 |
| `blockers` | array | 阻塞因素 |
| `notes` | string | 备注 |

## 📝 更新规则

**何时更新**：
- 新增任务时
- 任务状态变更时
- 任务信息变更时

**维护者**：Coding Agent（通过 feature-list.json 管理）
```
