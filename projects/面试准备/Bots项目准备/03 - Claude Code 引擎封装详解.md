# **03 - Claude Code 引擎封装详解**

> **适用场景**：面试技术讲述准备

> **核心主题**：AI 智能体平台中 Claude Code 引擎的封装设计与实现

> **阅读时间**：约 25 分钟

---

## **一、Claude Code 的定位**

### **1.1 一句话定位**

Claude Code 是平台中专门用于**代码执行和开发者操作**的 AI 引擎，它在 Docker 容器中运行 Claude 的编码能力，支持 Git 仓库克隆、代码文件读写、分支管理等完整的开发者工作流。

### **1.2 与 OpenClaw 的区别**

OpenClaw 和 Claude Code 虽然都是平台上的 AI 引擎，但定位完全不同：


|     |          |             |
| --- | -------- | ----------- |
| 维度  | OpenClaw | Claude Code |


| **本质** | 对话容器 | 代码执行沙箱 |

| **核心能力** | 多轮对话、知识问答 | 代码读写、Git 操作、分支管理 |

| **运行环境** | 对话上下文管理 | Docker 容器中的完整开发环境 |

| **交互方式** | 类似聊天机器人 | 类似 AI 程序员 |

| **数据持久化** | 对话记录 | Git 仓库、工作空间文件 |

**打比方**：如果把整个 AI 智能体平台比作一家科技公司，OpenClaw 就是公司的"客服前台"——你问它问题，它回答你；而 Claude Code 则是公司的"程序员工位"——它有自己的电脑（容器）、有自己的代码仓库（Workspace）、有自己的工作分支（Project），可以真正地写代码、提交代码。

### **1.3 核心能力**

Claude Code 封装了以下开发者级能力：

- **Git 仓库管理**：支持从 GitHub、美团内部 DevTools Code 克隆仓库

- **代码文件操作**：在容器内读写代码文件、浏览文件树

- **分支管理**：创建分支、切换分支、查看分支信息

- **版本管理**：记录提交版本、查看 Git Diff

- **模型配置**：支持为不同会话配置不同的 AI 模型

- **健康检查**：容器探活、进程数监控

---

## **二、智能体类型体系**

### **2.1 统一类型管理**

平台通过 `CapacityTypeEnum` 枚举统一管理所有智能体类型。这个枚举定义在：

```Plain
agent-api/src/main/java/com/waimai/frame/agent/api/constant/enums/agent/CapacityTypeEnum.java
```

所有智能体类型分为三大类：

**类别一：Agent 类型（有状态容器）**

> 需要独占容器资源，容器内保持工作状态

**类别二：Bot 类型 - 容器型**

> 共享同一个容器镜像（`aigc-claude-code`），通过配置区分行为

**类别三：Bot 类型 - 无状态**

> 不需要独占容器，项目文件存储在数据库表中

### **2.2 七种类型一览**


|                       |                     |               |          |                     |                |
| --------------------- | ------------------- | ------------- | -------- | ------------------- | -------------- |
| 枚举值                   | Code 字符串            | 中文名称          | 类别       | 容器镜像                | 特点             |
| `CLAUDE_AGENT`        | `claudeAgent`       | Claude 智能体    | Agent 类型 | 独占容器                | 有状态，支持完整开发工作流  |
| `GEMINI_AGENT`        | `geminiAgent`       | Gemini 智能体    | Agent 类型 | 独占容器                | 有状态，Gemini 引擎  |
| `CLAUDE_BOT`          | `claudeBot`         | Claude 机器人    | Bot 容器型  | `aigc-claude-code`  | 共享镜像，有状态容器     |
| `CODE_X_BOT`          | `codexBot`          | Codex 机器人     | Bot 容器型  | `aigc-claude-code`  | 共享镜像，Codex 引擎  |
| `CURSOR_BOT`          | `cursorBot`         | Cursor 机器人    | Bot 容器型  | `aigc-claude-code`  | 共享镜像，Cursor 引擎 |
| `CLAUDE_BOT_BUSINESS` | `claudeBotBusiness` | Claude 机器人企业版 | Bot 无状态  | `aigc-cc-stateless` | 无状态，项目文件存数据库   |
| `GEMINI_BOT`          | `geminiBot`         | Gemini 机器人    | Bot 无状态  | 无状态容器池              | 无状态，Gemini 引擎  |


> **面试提示**：枚举中还定义了 `SMART_INVOCATION`（智能调用）`WORKFLOW_AGENT`（工作流智能体）`TASK_AGENT`（任务智能体）等非容器型类型，以及 `OPENCLAW_BOT`（OpenClaw 机器人）等对话型类型。面试中重点讲 7 种容器/无状态类型即可。

### **2.3 容器镜像共享**

一个关键设计：**Claude Bot、Codex Bot、Cursor Bot 三类共用同一个容器镜像** `aigc-claude-code`。

```Java

```

*// CapacityTypeEnum 中的定义*

**public** **static** **final** **List**<**String**> CLAUDE_CODE_IMAGE_BOT_CODES = Arrays.asList(

 "claudeBot", *// Claude 机器人*

 "codexBot", *// Codex 机器人*

 "cursorBot" *// Cursor 机器人*

);

```Plain

```

**打比方**：这就像三个工种不同的程序员共用同一间办公室（镜像），但每个人的工牌（配置）不同，干的活也不同。Claude Bot 用 Claude 模型写代码，Codex Bot 用 Codex 模型，Cursor Bot 用 Cursor 引擎。办公室的设施（Git 工具、文件系统、Shell 环境）是通用的，不需要为每种引擎单独维护一套。

**为什么这么设计**：

- 节省镜像维护成本——一套镜像，三份能力
- 容器基础环境一致——Git、Shell、文件系统等基础设施只维护一份
- 通过配置区分行为——模型选择、系统提示词等通过 `agent_configs` 表的配置项区分

与之对应，无状态类型 `CLAUDE_BOT_BUSINESS` 使用独立的 `aigc-cc-stateless` 镜像，`GEMINI_BOT` 使用 Gemini 无状态容器池。

---

## **三、三层资源模型（核心设计）**

### **3.1 设计思路**

围绕 Claude Code 的使用场景，平台设计了三层资源管理模型：

```Plain
┌─────────────────────────────────────────────────────────┐
│                    Workspace（工程层）                     │
│    一个 Git 仓库的克隆实例，可被多个 Project 复用            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │ Project A │  │ Project B │  │ Project C │            │
│  │  分支: dev │  │ 分支: feat│  │ 分支: main│            │
│  │  ┌─────┐  │  │  ┌─────┐  │  │  ┌─────┐  │            │
│  │  │ S-1 │  │  │  │ S-2 │  │  │  │ S-3 │  │            │
│  │  │会话  │  │  │  │会话  │  │  │  │会话  │  │            │
│  │  └─────┘  │  │  └─────┘  │  │  └─────┘  │            │
│  └───────────┘  └───────────┘  └───────────┘            │
└─────────────────────────────────────────────────────────┘
```

**打比方**：把三层模型想象成一个开发团队的工作方式：


|     |     |      |
| --- | --- | ---- |
| 层级  | 比喻  | 实际含义 |


| **Workspace（工程层）** | 团队共享的代码仓库克隆 | 一个 Git 仓库在容器中的克隆实例 |

| **Project（项目层）** | 每个开发者自己的工作分支 | 基于 Workspace 创建的工作项目，有独立分支 |

| **CodingSession（会话层）** | 一次编码会话 | 实际的 AI 交互过程，包含分支管理和模型配置 |

### **3.2 工程层（Workspace）**

#### **职责**

Workspace 对应一个 Git 仓库的克隆实例，是整个三层模型的基础。一个仓库只需要克隆一次，后续所有 Project 和 Session 都复用这个克隆。

#### **数据模型**

数据库表：`agent_claude_workspace`

核心字段：


|                             |         |                                        |
| --------------------------- | ------- | -------------------------------------- |
| 字段                          | 类型      | 说明                                     |
| `workspace_id`              | String  | 唯一标识                                   |
| `workspace_name`            | String  | 工程名称（来自 Git 仓库名）                       |
| `git_type`                  | String  | Git 平台类型（Devtools / GitHub / GitLab 等） |
| `git_url`                   | String  | Git 仓库 URL                             |
| `git_repo_group`            | String  | 仓库所属组/组织                               |
| `git_repo_name`             | String  | 仓库名称                                   |
| `default_branch`            | String  | 默认分支                                   |
| `clone_status`              | String  | 克隆状态                                   |
| `device_id` / `ip` / `port` | —       | 容器位置信息                                 |
| `project_count`             | Integer | 该 Workspace 下已创建的 Project 数量           |


#### **克隆状态管理**

```Java

```

*// WorkspaceCloneStatusEnum*

PENDING("PENDING", "待克隆") *// 创建记录后，尚未开始克隆*

CLONING("CLONING", "克隆中") *// 正在执行 git clone*

SUCCESS("SUCCESS", "克隆成功") *// 克隆完成，可以创建 Project*

FAILED("FAILED", "克隆失败") *// 克隆失败，记录错误信息*

```Plain

状态流转：
```

用户选择仓库 → PENDING → 开始克隆 → CLONING → 克隆成功 → SUCCESS

 → 克隆失败 → FAILED → (可重试) → CLONING

```Plain

```

#### **示例：用户首次关联 GitHub 仓库**

```Plain
用户操作                          系统行为
────────                          ────────
1. 点击"同步仓库"          →  调用 GitHub API 获取仓库列表（最新 30 个）
2. 选择要关联的仓库        →  创建 Workspace 记录，状态 = PENDING
3. 点击"克隆"              →  状态变为 CLONING，异步线程池执行 git clone
4. 克隆完成                →  状态变为 SUCCESS，记录容器 IP/端口
5. 创建 Project            →  复用 Workspace 的容器，创建工作分支
```

批量克隆通过线程池 `claude-workspace-executor-pool`（5-10 线程，队列容量 100）异步执行，最多支持一次克隆 20 个仓库。如果服务重启时有未完成的克隆任务，`WorkspaceCloneRecoveryRunner` 会自动恢复。

### **3.3 项目层（Project）**

#### **职责**

Project 是基于 Workspace 创建的工作项目。一个 Workspace 可以创建多个 Project，它们共享同一个容器实例，但各自有独立的工作分支。

#### **数据模型**

数据库表：`agent_claude_project`

核心字段：


|                                                |                      |                      |
| ---------------------------------------------- | -------------------- | -------------------- |
| 字段                                             | 类型                   | 说明                   |
| `project_id`                                   | String               | 唯一标识（NanoId 或沙箱格式）   |
| `biz_type`                                     | String               | 业务类型（如 `codeAgent`）  |
| `workspace_id`                                 | String               | 关联的 Workspace ID（外键） |
| `branch`                                       | String               | 当前工作分支               |
| `git_url` / `git_repo_group` / `git_repo_name` | —                    | Git 仓库信息             |
| `device_id` / `ip` / `port` / `container_id`   | —                    | 容器位置信息               |
| `status`                                       | String               | 容器状态                 |
| `file_input_info`                              | String (LONGVARCHAR) | 文件列表和元数据（JSON）       |


#### **ProjectId 格式**

ProjectId 有两种格式，取决于创建路径：

**格式一：Workspace 模式（Claude Code IDE）**

```Plain
projectId = NanoIdUtils.randomNanoId()
// 示例: "V1StGXR8_Z5jdHi6B-myT"
```

使用 NanoId 生成随机唯一 ID，用于 Claude Code IDE 中的项目。

**格式二：沙箱模式（Claude Bot Business）**

```Plain
projectId = "claude_sandbox_" + agentId + "_" + userId + "_" + sessionId
// 示例: "claude_sandbox_agent001_user123_session456"
```

用于无状态容器的沙箱场景，ProjectId 中编码了智能体、用户和会话信息，便于快速定位。

> **面试提示**：ProjectId 的两种格式是一个重要的设计细节。沙箱模式的格式编码了上下文信息，使得系统可以通过 ProjectId 直接反推出 agentId、userId、sessionId，省去一次数据库查询。

#### **创建流程**

```Plain
用户创建 Project（基于已有 Workspace）
        │
        ▼
   检查 Redis 缓存 ──── 命中 ──→ 返回已有 projectId
        │ (未命中)
        ▼
   检查数据库 ──────── 已存在 ──→ 返回已有 projectId
        │ (不存在)
        ▼
   获取分布式锁 (30s TTL)
        │
        ▼
   双重检查数据库（防止并发重复创建）
        │
        ▼
   验证 Workspace 存在且 cloneStatus = SUCCESS
        │
        ▼
   生成 projectId（NanoId）
        │
        ▼
   构建并插入 Project 记录
   （复制 Workspace 的 gitType、gitUrl、repoGroup、repoName）
        │
        ▼
   缓存 projectId（1 小时 TTL）
        │
        ▼
   异步：切换分支（如需要）+ 切换模型（如需要）
        │
        ▼
   返回 ProjectCreateResponse.success(projectId)
```

#### **容器状态枚举**

```Java

```

*// ClaudeCodeProjectContainerStatusEnum*

CREATED("Created", "已创建") *// Project 刚创建*

INITIAL_FAILURE("InitialFailure", "初始化失败") *// 容器初始化失败*

INITIAL_SUCCESS("InitialSuccess", "初始化成功") *// 容器初始化成功*

RUNNING("Running", "运行中") *// 正在交互*

DISCONNECTED("Disconnected", "失去连接") *// 容器失联*

INVALID("Invalid", "失效") *// 容器已失效*

```Plain

```

### **3.4 会话层（CodingSession）**

#### **职责**

CodingSession 是实际的编码交互会话，是最细粒度的资源单元。每个会话有独立的分支、模型配置和容器连接。会话在容器中的工作路径为 `gitRepoName/sessionId`，实现会话级隔离。

#### **数据模型**

数据库表：`agent_claude_coding_session`

核心字段：


|                             |               |                                      |
| --------------------------- | ------------- | ------------------------------------ |
| 字段                          | 类型            | 说明                                   |
| `session_id`                | String        | 唯一标识（NanoId）                         |
| `git_url` / `git_repo_name` | —             | Git 仓库信息                             |
| `branch`                    | String        | 当前分支                                 |
| `status`                    | String        | 容器状态（同 Project 状态枚举）                 |
| `clone_status`              | String        | 克隆状态（PENDING/CLONING/SUCCESS/FAILED） |
| `device_id` / `ip` / `port` | —             | 容器位置信息                               |
| `git_diff_detail`           | String (BLOB) | Git Diff 统计信息（JSON）                  |
| `base_branch_mapping`       | String (BLOB) | 分支到基础分支的映射（JSON）                     |


#### **核心能力**


|        |                             |                     |
| ------ | --------------------------- | ------------------- |
| 能力     | API 端点                      | 说明                  |
| 创建会话   | `POST /create`              | 生成 NanoId，异步连接容器并克隆 |
| 文件树浏览  | `GET /repo/tree/{repoName}` | 支持目录和递归参数           |
| 文件内容读取 | `GET /repo/file/{repoName}` | 支持路径和 Diff 参数       |
| 分支切换   | `POST /switchBranch`        | 切换当前会话的工作分支         |
| 创建分支   | `POST /createBranch`        | 基于当前分支创建新分支         |
| 模型配置   | `GET/PUT /config/model`     | 查询/修改会话的 AI 模型      |
| 版本管理   | `GET/POST /version/*`       | 查看版本列表、添加版本         |
| 健康检查   | `GET /getClaudeSession`     | 获取会话信息并检查容器健康       |


#### **示例：一次完整的编码会话流程**

```Plain
步骤 1: 用户创建会话
   → 生成 sessionId（NanoId）
   → 插入数据库，状态 = CREATED
   → 调用 HumanMachineController /newSession
   → 返回 sessionId 给前端

步骤 2: 异步初始化（线程池执行）
   → 连接设备获取容器 ip/port/deviceId/containerId
   → 探活容器（5 秒间隔，最多 30 次重试）
   → 设置 Git 全局配置（user.name, user.email）
   → 执行 git clone 到 {gitRepoName}/{sessionId} 路径
   → 切换模型（如指定）
   → 切换分支（如指定）
   → 成功：状态 = INITIAL_SUCCESS
   → 失败：状态 = INITIAL_FAILURE

步骤 3: 用户开始编码交互
   → 前端通过 WebSocket 发送编码请求
   → 后端路由到容器的 Claude Code 服务
   → Claude 在容器内读写文件、执行命令
   → 结果通过 WebSocket 流式返回

步骤 4: 会话结束
   → 用户关闭会话或超时
   → 容器保持运行（可复用）
   → 下次进入同一会话可直接继续
```

---

## **四、容器池管理**

### **4.1 共享数据模型**

Claude 和 Gemini 共用同一套容器管理数据模型，核心是 `ClaudeContainerManager` 实体类，对应数据库表 `claude_container_manager`。

```Plain
文件路径: agent-api/src/main/java/com/waimai/frame/agent/api/dao/domain/ClaudeContainerManager.java
```

核心字段：


|                        |         |               |
| ---------------------- | ------- | ------------- |
| 字段                     | 类型      | 说明            |
| `id`                   | Long    | 主键            |
| `device_id`            | String  | 设备 ID（容器标识）   |
| `ip`                   | String  | 容器 IP 地址      |
| `port`                 | Integer | 容器端口          |
| `container_id`         | String  | Docker 容器 ID  |
| `image_id`             | String  | 镜像 ID         |
| `image_version`        | String  | 镜像版本          |
| `claude_process_count` | Integer | 当前 Claude 进程数 |


| `biz_type` | String | **业务类型**（区分用途） |

| `agent_id` | String | 关联的智能体 ID |

| `status` | String | 容器状态 |

| `pool` | String | **容器池名称**（区分模式） |

| `start_time` | Timestamp | 容器启动时间 |

| `last_health_check_time` | Timestamp | 最近健康检查时间 |

| `last_health_status` | String | 最近健康状态 |

#### **bizType（业务类型）**

通过 `ClaudeContainerBizTypeEnum` 枚举定义：


|                      |                      |                         |
| -------------------- | -------------------- | ----------------------- |
| 枚举值                  | Code                 | 说明                      |
| `AI_WORKFLOW`        | `ai_workflow`        | AI 生成工作流（共享池，Claude 引擎） |
| `GEMINI_SANDBOX`     | `gemini_sandbox`     | Gemini 沙箱               |
| `GEMINI_NONE_STATUS` | `gemini_none_status` | Gemini 无状态容器            |
| `CLAUDE_SANDBOX`     | `claude_sandbox`     | Claude 沙箱               |
| `CLAUDE_NONE_STATUS` | `claude_none_status` | Claude 无状态容器            |
| `CODE_AGENT`         | `codeAgent`          | 代码智能体                   |


#### **pool（容器池模式）**

通过 `ClaudeContainerPoolTypeEnum` 枚举定义：


|             |             |                |
| ----------- | ----------- | -------------- |
| 枚举值         | Code        | 说明             |
| `DEDICATED` | `dedicated` | 独占池——每个智能体独享容器 |
| `SHARED`    | `shared`    | 共享池——多个智能体共享容器 |
| `DEBUG`     | `debug`     | 调试池——调试会话专用    |


#### **bizType 与 pool 的组合含义**


|                      |                  |               |                           |
| -------------------- | ---------------- | ------------- | ------------------------- |
| bizType              | pool             | 含义            | 典型场景                      |
| `ai_workflow`        | `dedicated`      | 独占的 AI 工作流容器  | 重要智能体，需要稳定资源保障            |
| `ai_workflow`        | `shared`         | 共享的 AI 工作流容器  | 普通智能体，资源共享降成本             |
| `ai_workflow`        | `debug`          | 调试专用容器        | 开发调试会话                    |
| `claude_sandbox`     | —                | Claude 沙箱容器   | Claude Bot Business 的代码执行 |
| `claude_none_status` | `claude_default` | Claude 无状态容器池 | 无状态 Claude 服务             |
| `gemini_sandbox`     | —                | Gemini 沙箱容器   | Gemini 的代码执行              |
| `gemini_none_status` | `gemini_default` | Gemini 无状态容器池 | 无状态 Gemini 服务             |
| `codeAgent`          | —                | 代码智能体容器       | Code Agent 直接编码           |


> **打比方**`bizType` 像是员工的"部门标签"（研发部、市场部、行政部）`pool` 像是"工位类型"（独立办公室、开放工位、临时工位）。两个维度组合，就能精确定位一个容器的用途和资源模式。

### **4.2 容器分配算法**

#### **核心算法：最少进程数 + 加权随机**

平台使用**最少进程数优先**的策略分配容器，而非简单的轮询或随机。

**算法流程**：

```Plain
                    容器分配流程
                    ────────────
                         │
                         ▼
              ┌─ 查询可用容器 ─┐
              │  (按 pool 和   │
              │   bizType 过滤) │
              └───────────────┘
                         │
                         ▼
              ┌─ 过滤超限容器 ─┐
              │ processCount   │
              │   >= 20 的排除  │
              └───────────────┘
                         │
                         ▼
              ┌─ 计算权重 ────┐
              │ weight = 21   │
              │   - processCount│
              │ (进程越少权重越高)│
              └───────────────┘
                         │
                         ▼
              ┌─ 操作日志分层 ─┐
              │                │
              │  Tier 1 (最高) │→ 已重启完成的容器
              │  Tier 2 (中等) │→ 空闲容器
              │  Tier 3 (最低) │→ 正在操作中的容器
              └───────────────┘
                         │
                         ▼
              ┌─ 加权随机选择 ─┐
              │ 在最高可用层内  │
              │ 按权重随机选取  │
              └───────────────┘
```

**权重计算公式**：

```Java

```

*// 每个容器最多 20 个进程*

**private** **static** **final** **int** MAX_CLAUDE_PROCESS_COUNT = 20;

*// 权重 = (MAX + 1) - 当前进程数*

*// 进程数 0 → 权重 21（最高）*

*// 进程数 10 → 权重 11*

*// 进程数 19 → 权重 2*

*// 进程数 20 → 被排除*

weight = (MAX_CLAUDE_PROCESS_COUNT + 1) - processCount;

```Plain

```

#### **为什么选择最少进程数算法**


|     |     |     |      |
| --- | --- | --- | ---- |
| 算法  | 优点  | 缺点  | 适用场景 |


| **轮询** | 实现简单 | 不考虑容器实际负载 | 请求量均匀的场景 |

| **随机** | 实现简单 | 可能集中到某个容器 | 容器无差异的场景 |

| **最少进程数** | 负载均衡效果好 | 需要实时获取进程数 | **容器有状态、负载不均的场景** |

**选择最少进程数的理由**：

1. 每个 Claude 进程消耗大量内存和 CPU，进程数直接反映容器负载
2. 避免某个容器因进程过多导致 OOM 或响应变慢
3. 加权随机而非严格最少，避免多个请求同时涌入同一个"最空闲"的容器
4. 操作日志分层保证重启期间不会把请求分配到正在重启的容器

### **4.3 容器生命周期**

容器从创建到销毁的完整生命周期：

```Plain
创建 ──→ 分配 ──→ 探活 ──→ 保活 ──→ 重启/扩容 ──→ 销毁
 │        │        │        │          │            │
 │        │        │        │          │            │
 ▼        ▼        ▼        ▼          ▼            ▼
调用设备  分配给   健康检查  定时续期  负载过高时   负载过低时
API 创建  智能体   更新状态  防止回收  扩容或重启   自动回收
容器              IDLE/    keepAlive              processCount
                 OCCUPIED                         == 0 时删除
```

**各阶段详细说明**：


|     |      |      |      |
| --- | ---- | ---- | ---- |
| 阶段  | 触发条件 | 核心操作 | 状态变化 |


| **创建** | 扩容流水线 / 首次分配 | 调用 `deviceAPi.connectDevice()` 创建 Docker 容器 | → `INVALID` |

| **分配** | 智能体请求容器 | 最少进程数算法选择容器 | `IDLE` → `OCCUPIED` |

| **探活** | 定时任务 / 分配前检查 | HTTP 请求 `/health/check/detail` | 更新 `lastHealthCheckTime` |

| **保活** | 定时任务 | 调用 `deviceAPi.keepAlive(deviceId)` | 保持 `IDLE` / `OCCUPIED` |

| **重启** | 镜像升级 / 手动触发 | 滚动部署流水线 | → `UPGRADING` → `IDLE` |

| **扩容** | 峰值负载 > 90% | 扩容流水线新建容器 | 新容器 → `IDLE` |

| **销毁** | 峰值负载 < 50% 持续 3 天 | 验证 `processCount == 0` 后删除 | → `STOPPED` |

#### **容器状态枚举**

```Java

```

*// ClaudeContainerManagerStatusEnums*

IDLE("Idle", "空闲") *// 容器存活，无进程运行*

OCCUPIED("Occupied", "占用") *// 容器存活，有进程运行*

INVALID("Invalid", "不可用") *// 健康检查失败*

UPGRADING("Upgrading", "升级重启中") *// 正在重启*

RUNNING("Running", "代码启动中") *// 代码启动中（遗留状态）*

STOPPED("Stopped", "已删除") *// 已销毁*

```Plain

```

#### **自动扩容与回收**

平台通过定时任务实现智能扩缩容：

```Plain
扩容触发条件:
  → 峰值负载 > 90%
  → autoScale = true
  → 当前容器数 < maxCount
  → 自动新增 1 个容器
  → 跳过周末和节假日

回收触发条件:
  → 自动扩容的容器：1 天峰值 < 50% → 回收
  → 固定配置的容器：3 天峰值均 < 50% → 回收
  → 最后 1 个容器：只告警不删除
  → 每天每个智能体最多回收 1 个
  → 回收前实时检查 processCount == 0
```

### **4.4 扩容流水线（Pipeline）**

扩容操作不是一步完成的，而是通过流水线分步骤执行，每一步都有记录和恢复机制。

#### **流水线步骤**

```Java

```

*// ClaudeContainerOpPipelineStepEnum*

CONTAINER_DELETE("ContainerDelete", "容器删除") *// Step 1: 清理旧容器*

CONTAINER_CREATE("ContainerCreate", "批量容器创建与启动") *// Step 2: 创建新容器*

HEALTH_CHECK("HealthCheck", "新容器健康检查") *// Step 3: 健康检查*

RESOURCE_POOL_SYNC("ResourcePoolSync", "资源池注册与同步") *// Step 4: 注册到资源池*

RESULT_STATISTICS("ResultStatistics", "扩容结果统计") *// Step 5: 统计结果*

```Plain

```

#### **流水线流程图**

```Plain
                    扩容流水线
                    ──────────
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 1: ContainerDelete                │
    │  • 清理同 bizType 下的无效容器            │
    │  • 断点恢复：跳过已完成的步骤             │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 2: ContainerCreate                │
    │  • 串行创建容器，每个初始状态 = INVALID   │
    │  • 断点恢复：remainingCount = 目标数     │
    │    - 已创建数                           │
    │  • 按 bizType 分发到不同的创建方法        │
    │    - CLAUDE_NONE_STATUS → 创建 Claude    │
    │      无状态容器                          │
    │    - AI_WORKFLOW → 创建 AI 工作流容器     │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 3: HealthCheck                    │
    │  • 并行健康检查（10 线程的线程池）        │
    │  • 每个容器：5 次重试，30 秒间隔          │
    │  • 成功：状态 → IDLE 或 OCCUPIED         │
    │  • 失败：状态保持 INVALID                │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 4: ResourcePoolSync               │
    │  • 记录 commitId（从首个健康容器获取）    │
    │  • 容器已在 Step 1 入库，此处标记注册     │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 5: ResultStatistics               │
    │  • 统计成功数 / 失败数                   │
    │  • 创建最终流水线记录                     │
    │  • 更新操作日志状态                      │
    └─────────────────────────────────────────┘
```

#### **断点恢复机制**

扩容过程可能因服务重启而中断。平台通过以下机制实现断点恢复：

1. **操作日志记录**：每次扩容生成唯一的 `operationId`，每个步骤的执行状态记录在 `claude_container_op_pipeline` 表中

2. **超时检测**：定时任务 `scaleOperationRecoveryHandler` 检测超过 30 分钟仍处于 `EXECUTING` 状态的操作

3. **幂等重放**：从 `ClaudeContainerOpLog` 恢复请求参数，重新执行 `executeScaleProcess()`。Step 2 会检查已创建的流水线记录，计算 `remainingCount`，只创建差额部分

**打比方**：扩容流水线就像工厂的流水线作业。如果突然停电了（服务重启），来电后不需要从头开始——看看记录本（数据库），上次做到第几步，从断点继续就行。

### **4.5 重启流水线**

#### **设计目标**

当镜像升级或代码更新时，需要批量重启容器。直接全部重启会导致服务不可用，因此采用**滚动部署**策略。

#### **流水线步骤**

```Java

```

*// ClaudeContainerRestartStepEnum*

CONTAINER_DETECTION("ContainerDetection", "容器检测") *// Step 1: 检测容器状态*

ROLLING_DEPLOYMENT("RollingDeployment", "滚动部署升级") *// Step 2: 滚动重启*

UPGRADE_RESULT_FEEDBACK("UpgradeResultFeedback", "升级结果反馈") *// Step 3: 验证结果*

```Plain

```

#### **滚动部署流程**

```Plain
                    重启流水线（滚动部署）
                    ──────────────────
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 1: ContainerDetection             │
    │  • 检查容器状态（必须是 IDLE 或 OCCUPIED）│
    │  • 为所有目标容器预创建检测记录           │
    │  • 状态 = WAITING                       │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 2: RollingDeployment              │
    │                                         │
    │  ┌─ 平滑滚动（ai_workflow 类型）─────┐  │
    │  │ 1. 优先处理 IDLE 容器              │  │
    │  │ 2. 每轮处理 30% 的空闲容器         │  │
    │  │ 3. 每批最多 5 个                   │  │
    │  │ 4. 每 30 秒轮询一次                │  │
    │  │ 5. 最多 60 轮（30 分钟超时）       │  │
    │  │ 6. 每轮重新检查容器状态            │  │
    │  └──────────────────────────────────┘  │
    │                                         │
    │  ┌─ 默认部署（其他类型/强制模式）─────┐  │
    │  │ 直接批量重启                       │  │
    │  └──────────────────────────────────┘  │
    └────────────────────┬────────────────────┘
                         │
    ┌────────────────────▼────────────────────┐
    │  Step 3: UpgradeResultFeedback          │
    │  • 验证重启结果                         │
    │  • 收集健康检查详情                     │
    │  • 更新容器 IP/端口/commitId/状态       │
    └─────────────────────────────────────────┘
```

#### **为什么用滚动部署而不是一次性重启**


|     |     |     |
| --- | --- | --- |
| 方案  | 优点  | 缺点  |


| **一次性重启** | 速度快 | 重启期间所有服务不可用 |

| **滚动部署** | 始终有容器可用 | 耗时较长 |

**滚动部署的核心保障**：

- 每轮只处理 30% 的空闲容器，保证至少 70% 的容器在线
- 优先处理 IDLE 容器（无进程运行），OCCUPIED 容器等进程结束后再处理
- 每批最多 5 个，避免瞬时资源压力
- 30 秒轮询间隔，给容器恢复时间
- 任务心跳机制（Redis，10 分钟过期），确保任务存活

#### **示例：批量重启 10 个容器**

```Plain
初始状态: 10 个容器（6 个 IDLE，4 个 OCCUPIED）

第 1 轮:
  → 选择 30% 的 IDLE 容器 = 2 个（每批最多 5 个，取 min(2, 5) = 2）
  → 重启 2 个 IDLE 容器
  → 等待 30 秒
  → 重新检查：6-2=4 个 IDLE + 2 个重启中 + 4 个 OCCUPIED

第 2 轮:
  → 选择 30% 的 4 个 IDLE = 2 个
  → 重启 2 个
  → 等待 30 秒

第 3 轮:
  → 选择 30% 的 2 个 IDLE = 1 个
  → 重启 1 个

... 持续直到所有 IDLE 容器重启完毕 ...

后续轮次:
  → 检查之前 OCCUPIED 的容器是否变为 IDLE
  → 逐步重启已空闲的容器

最终: 10 个容器全部重启完成
全程耗时: 约 15-25 分钟（取决于容器恢复速度和进程退出时间）
```

---

## **五、沙箱懒加载机制**

### **5.1 设计动机**

容器资源宝贵，不是每个会话都需要立即创建容器。有些用户创建会话后可能很久才发第一条消息，如果创建会话时就分配容器，这段时间容器资源就浪费了。

**打比方**：就像酒店入住。有人提前预订了房间但很晚才到，如果一预订就准备好房间并开空调，那空置期间的电费就浪费了。更好的做法是：客人到前台时再准备房间（懒加载），或者 VIP 客人提前准备好（同步预热）。

### **5.2 懒加载策略**

通过 `agent_configs` 表中的 `syncInit` 配置字段控制：

#### **同步预热模式（syncInit = true）**

```Plain
用户创建会话 → 立即分配容器 → 初始化项目文件 → 就绪
     │                                          │
     │←───────── 容器已准备好 ──────────────────→│
     │                                          │
     │        用户发第一条消息时，容器已就绪       │
```

- 新建会话时立即创建容器
- 会话创建即就绪，首条消息零等待
- 适用于：高频使用场景、对延迟敏感的场景
- 对于 CLAUDE_BOT_BUSINESS：当 `syncInit=true` 或 `teamId != null`（团队协作场景）时同步初始化

#### **懒加载模式（syncInit = false）**

```Plain
用户创建会话 → 不创建容器 → 用户发首条消息 → 按需创建容器 → 初始化 → 就绪
                                                    │              │
                                                    │←── 首次等待 ──→│
```

- 创建会话时不分配容器
- 首次对话时通过 `/api/agent/claude/sandbox/ensure` 接口按需创建
- 首条消息会有一定延迟（容器创建+初始化时间）
- 适用于：低频使用场景、资源紧张时

#### **两种模式对比**


|     |      |     |
| --- | ---- | --- |
| 维度  | 同步预热 | 懒加载 |


| **容器创建时机** | 会话创建时 | 首条消息时 |

| **首条消息延迟** | 零等待 | 有延迟（容器创建时间） |

| **资源利用率** | 可能浪费（用户不发消息） | 高效利用 |

| **适用场景** | 高频、对延迟敏感 | 低频、资源紧张 |

| **配置方式** | `syncInit=true` | `syncInit=false` |

### **5.3 容器过期与恢复**

#### **容器过期回收**

容器长时间不用会被回收，释放资源给其他用户：

```Plain
容器空闲超时 → 回收容器 → 释放资源
     │
     │ （用户再次使用时）
     ▼
通过快照恢复机制承接
```

#### **快照恢复流程**

当用户再次使用一个已被回收的会话时，系统通过快照机制恢复工作空间：

```Plain
                    快照恢复流程
                    ────────────
                         │
                         ▼
              ┌─ 分配新容器 ──┐
              │ (getSandbox   │
              │  Container)   │
              └──────────────┘
                         │
                         ▼
              ┌─ 检查是否有   ─┐    无 → 直接使用新容器
              │  已存项目记录  │
              └──────────────┘
                    │ 有
                    ▼
              ┌─ 调用恢复接口 ─┐
              │ workspace-    │
              │ restore       │
              │ (gitUrl,      │
              │  clearWorkspace│
              │  =false)      │
              └──────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
           成功                    失败
              │                     │
              ▼                     ▼
    恢复工作空间数据          容器标记为 INVALID
    可继续之前的编码工作       返回 null，触发重试
```

#### **物化流程**

当容器首次分配或恢复后，需要将项目文件"物化"到容器中：

```Plain
物化流程 (ClaudeProjectFilesInitializer.materialize)
                    │
                    ▼
         ┌─ 下载项目文件包 ──┐
         │ GET /open/sandbox-│
         │ bootstrap/tarball  │
         │ ?uuid=<uuid>       │
         └───────────────────┘
                    │
                    ▼
         ┌─ 解压到容器 ──────┐
         │ curl -fL --retry 3 │
         │ <tarball_url>      │
         │ | tar -xzf -       │
         └───────────────────┘
                    │
                    ▼
         ┌─ 写入上下文配置 ──┐
         │ .biz/context.json  │
         │ (base64 编码写入)   │
         └───────────────────┘
```

物化分两种级别：

- **完整物化**`materialize`）：下载并解压完整的 `workspace/` 和 `home/` 目录

- **用户文件刷新**`materializeUserFiles`）：仅刷新 `home/` 目录下的用户级配置文件（如 `.claude/` 配置）

> **进化故事**：早期物化方案是将所有文件内容以 base64 编码内联到 Shell 脚本中执行。但遇到 Linux `ARG_MAX` 限制（参数列表太长），后来改为通过 tarball 端点下载解压的方式。

### **5.4 无状态容器**

#### **与有状态容器的区别**


|     |       |       |
| --- | ----- | ----- |
| 维度  | 有状态容器 | 无状态容器 |


| **容器绑定** | 绑定到特定智能体/用户 | 从容器池随机分配 |

| **工作空间** | 容器内持久化 | 项目文件存数据库，使用时物化 |

| **生命周期** | 长期运行 | 用完即还（可复用） |

| **镜像** | `aigc-claude-code` | `aigc-cc-stateless` |

| **适用类型** | CLAUDE_BOT / CODE_X_BOT / CURSOR_BOT | CLAUDE_BOT_BUSINESS / GEMINI_BOT |

| **bizType** | `ai_workflow` / `codeAgent` | `claude_none_status` / `gemini_none_status` |

#### **无状态容器分配**

```Java

```

*// 无状态容器从池中随机选取*

**ClaudeContainerManager** container = agentGeminiContainerService

 .getClaudeNoneStatusContainer(pool);

*// 查询条件: bizType = "claude_none_status"*

*// pool = targetPool*

*// status != Stopped && status != Invalid*

*// 随机选取一个可用容器*

```Plain

```

#### **适用场景**

无状态容器适用于不需要维持上下文的场景：

- **一次性代码执行**：执行完即还，不需要保持工作空间

- **高并发场景**：容器池模式，快速分配和回收

- **成本敏感场景**：少量容器服务大量用户，按需物化

---

## **六、Git 平台适配**

### **6.1 工厂模式设计**

平台通过工厂模式统一管理不同 Git 平台的操作，支持美团内部 DevTools Code 和 GitHub 两个实现。

#### **接口定义**

```Java

```

*// IGitPlatformService — 统一的 Git 操作接口*

**public** **interface** IGitPlatformService {

*// 查询仓库列表（分页）*

**GitRepoPageResponseDTO** getRepoList(**String** creatorUserId,

**String** gitRepoName,

**int** pageNum, **int** pageSize);

*// 创建仓库*

**Map**<**String**, **Object**> createRepo(**ClaudeProjectVo** claudeProjectVo,

**String** creatorMis);

*// 构建 Git URL*

**String** buildGitUrl(**String** gitRepoGroup, **String** gitRepoName);

*// 从创建结果中提取 Git URL*

**String** extractGitUrlFromCreateResult(**Map**<**String**, **Object**> createRepoResult);

*// 获取平台类型*

**String** getPlatformType();

*// 获取所有仓库列表*

**List**<**String**> getAllRepoList(**String** creatorUserId);

*// ── 静态工具方法 ──*

*// 从 Git URL 解析仓库组*

**static** **String** getGitRepoGroupFromGitUrl(**String** gitUrl) { ... }

*// 从 Git URL 解析仓库名*

**static** **String** extractRepoNameFromGitUrl(**String** gitUrl) { ... }

}

```Plain

```

#### **工厂类**

```Java

```

*// GitPlatformServiceFactory — 工厂入口*

@**Component**

**public** **class** GitPlatformServiceFactory {

 @**Autowired**

**private** **DevtoolsGitService** devtoolsGitService;

 @**Autowired**

**private** **GitHubGitService** gitHubGitService;

**public** **IGitPlatformService** getService(**String** gitType) {

 if (StringUtils.isBlank(gitType)) {

 return devtoolsGitService; *// 默认使用 DevTools*

 }

**GitTypeEnum** gitTypeEnum = GitTypeEnum.getByCode(gitType);

 if (gitTypeEnum == GitTypeEnum.GITHUB) {

 return gitHubGitService;

 }

 return devtoolsGitService; *// 默认 fallback*

 }

}

```Plain

```

#### **类图结构**

```Plain
    ┌──────────────────────────┐
    │   IGitPlatformService     │  (接口)
    │   (统一 Git 操作接口)      │
    ├──────────────────────────┤
    │ + getRepoList()          │
    │ + createRepo()           │
    │ + buildGitUrl()          │
    │ + extractGitUrlFromCreate│
    │ + getPlatformType()      │
    │ + getAllRepoList()       │
    └────────┬─────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌─────────────┐
│DevtoolsGit  │  │ GitHubGit   │
│Service      │  │ Service     │
│(美团内部)    │  │ (GitHub)    │
├─────────────┤  ├─────────────┤
│buildGitUrl: │  │buildGitUrl: │
│ssh://git@   │  │git@github   │
│git.sankuai  │  │.com:owner/  │
│.com/g/r.git │  │repo.git     │
├─────────────┤  ├─────────────┤
│createRepo:  │  │createRepo:  │
│eciBaseAgent │  │gitHubApi    │
│ServiceApi   │  │Service      │
│.createRepo()│  │.createUser  │
│             │  │Repo()       │
└─────────────┘  └─────────────┘
         ▲
         │
┌──────────────────────────┐
│GitPlatformServiceFactory │  (工厂)
│                          │
│ getService(gitType)      │
│   → "GitHub" → GitHubGit │
│   → 其他   → DevtoolsGit │
└──────────────────────────┘
```

**打比方**：工厂模式就像一个"翻译公司"——不管你说法语（GitHub）还是说中文（DevTools），翻译公司都能给你安排对应的翻译员（实现类），对外提供统一的翻译服务（接口）。

### **6.2 支持的操作**


|     |                    |                  |
| --- | ------------------ | ---------------- |
| 操作  | DevtoolsGitService | GitHubGitService |


| **仓库列表查询** | 调用 `eciBaseAgentServiceApi.getMisRecentPushedRepos()` | 调用 `gitHubApiService.getUserRepos()` |

| **创建仓库** | 调用 `eciBaseAgentServiceApi.createRepo()` | 调用 `gitHubApiService.createUserRepo()` |

| **构建 Git URL** | `ssh://git@git.sankuai.com/{group}/{repo}.git` | `git@github.com:{owner}/{repo}.git` |

| **提取创建结果 URL** | 返回 null（需手动构建） | 返回 `ssh_url` 或 `clone_url` |

| **获取所有仓库** | pageSize=999 一次性获取 | pageSize=999 一次性获取 |

| **批量导入** | 支持同步两个平台，过滤已导入的仓库 | 同左 |

### **6.3 GitHub OAuth 2.0 流程**

平台通过 GitHub OAuth 2.0 获取用户的 GitHub 仓库访问权限。

#### **配置信息**

```Java

```

*// GitHubCredentialsConfigDTO*

clientId *// GitHub OAuth App 的 Client ID*

clientSecret *// Client Secret*

redirectUri *// 回调地址*

scope *// 权限范围（如 repo, user:email）*

frontendSuccessUrl *// 前端成功跳转地址*

frontendFailureUrl *// 前端失败跳转地址*

```Plain

配置通过 Apollo 配置中心管理，Key 为 `automan.credentials.github.info`。
```

#### **完整授权时序**

```Plain
  用户          前端          后端           GitHub
   │             │             │              │
   │ 1.点击关联   │             │              │
   │ GitHub      │             │              │
   ├────────────>│  2.请求授权  │              │
   │             ├────────────>│              │
   │             │             │              │
   │             │             │ 3.生成 state  │
   │             │             │  (加密 JSON:  │
   │             │             │   userId,    │
   │             │             │   timestamp, │
   │             │             │   redirectUri)│
   │             │             │              │
   │             │  4.返回     │              │
   │             │  authorizeUrl│             │
   │             │<────────────┤              │
   │             │             │              │
   │ 5.跳转到    │             │              │
   │ GitHub 授权 │             │              │
   │ 页面        │             │              │
   ├─────────────────────────────────────────>│
   │             │             │              │
   │             │             │  6.用户授权   │
   │             │             │<─────────────┤
   │             │             │              │
   │             │  7.回调带    │              │
   │             │  code+state │              │
   │             │<────────────────────────────┤
   │             │             │              │
   │             │  8.发送     │              │
   │             │  code+state │              │
   │             ├────────────>│              │
   │             │             │              │
   │             │             │ 9.验证 state │
   │             │             │  (10分钟有效) │
   │             │             │              │
   │             │             │ 10.用 code   │
   │             │             │  换 token    │
   │             │             ├─────────────>│
   │             │             │              │
   │             │             │ 11.返回      │
   │             │             │ access_token │
   │             │             │<─────────────┤
   │             │             │              │
   │             │             │ 12.获取用户  │
   │             │             │  信息        │
   │             │             ├─────────────>│
   │             │             │              │
   │             │             │ 13.返回      │
   │             │             │ user info    │
   │             │             │<─────────────┤
   │             │             │              │
   │             │             │ 14.保存凭证  │
   │             │             │  到数据库    │
   │             │             │  (upsert)    │
   │             │             │              │
   │             │             │ 15.同步仓库  │
   │             │             │  (异步)      │
   │             │             │              │
   │             │ 16.重定向到 │              │
   │             │  前端成功页 │              │
   │             │<────────────┤              │
   │             │             │              |
   │ 17.显示关联 │             │              │
   │  成功       │             │              │
   │<────────────┤             │              │
```

#### **state 安全机制**

- state 是加密的 JSON，包含 `userId`、`timestamp`、`redirectUri`
- 有效期 10 分钟（`STATE_EXPIRE_TIME = 600` 秒）
- 防止 CSRF 攻击
- 回调时验证 state 新鲜度

#### **克隆时的 URL 构建**

对于 GitHub 仓库，克隆时需要将 access_token 嵌入 URL：

```Java

```

*// 构建带认证信息的 HTTPS 克隆 URL*

**String** cloneUrl = String.format(

 "https://%s:%s@github.com/%s/%s.git",

 accountName, *// GitHub 用户名*

 accessToken, *// OAuth access_token*

 accountName, *// 仓库所有者*

 repoName *// 仓库名*

);

```Plain

```

### **6.4 Git URL 解析**

`IGitPlatformService` 接口中的静态方法 `getGitRepoGroupFromGitUrl` 支持多种 Git URL 格式解析。

#### **支持的 URL 格式**


|     |     |      |
| --- | --- | ---- |
| 格式  | 示例  | 正则模式 |


| **SSH（ssh:// 前缀）** | `ssh://git@git.sankuai.com/waimai.waimaiplat.frame/agent-api.git` | `^ssh://[^@]+@[^/]+/(.+)/[^/]+$` |

| **SSH（git@ 冒号）** | `git@github.com:owner/repo.git` | `^[^@]+@[^:]+:(.+)/[^/]+$` |

| **HTTPS/HTTP** | `https://github.com/owner/repo.git` | `^https?://[^/]+/(.+)/[^/]+$` |

#### **解析逻辑**

```Plain
输入: ssh://git@git.sankuai.com/waimai.waimaiplat.frame/agent-api.git

Step 1: 去掉 .git 后缀
  → ssh://git@git.sankuai.com/waimai.waimaiplat.frame/agent-api

Step 2: 匹配 SSH 格式
  → 匹配 ^ssh://[^@]+@[^/]+/(.+)/[^/]+$
  → 仓库组 = waimai.waimaiplat.frame
  → 仓库名 = agent-api

输出:
  gitRepoGroup = "waimai.waimaiplat.frame"
  gitRepoName  = "agent-api"
```

#### **仓库名提取**

```Java

```

**static** **String** extractRepoNameFromGitUrl(**String** gitUrl) {

*// 取最后一个 "/" 或 ":" 之后的部分*

*// 示例: git@github.com:owner/repo.git → repo*

*// 示例: https://github.com/owner/repo.git → repo*

}

```Plain

---
```

## **七、Gemini 容器管理对比**

### **7.1 共用模型**

Gemini 与 Claude 共用同一套容器管理基础设施：

- **同一数据表**`claude_container_manager`（尽管名字叫 Claude，但 Gemini 数据也存这里）

- **同一实体类**`ClaudeContainerManager`

- **同一服务实现**`AgentGeminiContainerServiceImpl`（尽管名字叫 Gemini，但 Claude 沙箱逻辑也在里面）

**为什么叫 Gemini？** 因为这套容器管理代码最初是为 Gemini 开发的，后来 Claude 无状态容器复用了相同的设计模式，通过 `bizType` 字段区分用途。

**打比方**：这就像一栋写字楼，最初是给 A 公司（Gemini）建的，后来 B 公司（Claude）也搬进来了。大楼的物业管理系统（服务实现）是同一套，只是通过门牌号（bizType）区分哪家公司用哪个房间。

#### **统一接口设计**

```Java

```

*// AgentGeminiContainerServiceImpl 中的统一入口*

**public** **ClaudeContainerManager** getGeminiSandboxContainer(

**String** agentId, **String** userId, **String** sessionId,

**String** version, **String** type, **String** bizId,

**String** agentType *// ← 关键参数：区分 Claude 还是 Gemini*

) {

 if ("claude".equalsIgnoreCase(agentType)) {

 bizTypeCode = ClaudeContainerBizTypeEnum.CLAUDE_SANDBOX.getCode();

 projectIdPrefix = "claude_sandbox";

 lockKeyPrefix = "claude_sandbox_lock:";

 } else {

*// 默认 Gemini*

 bizTypeCode = ClaudeContainerBizTypeEnum.GEMINI_SANDBOX.getCode();

 projectIdPrefix = "gemini_sandbox";

 lockKeyPrefix = "gemini_sandbox_lock:";

 }

*// projectId 格式: {prefix}_{agentId}_{userId}_{sessionId}*

**String** projectId = projectIdPrefix + "_" + agentId + "_" + userId + "_" + sessionId;

*// 后续容器分配逻辑完全相同，只是 bizType 标签不同*

*// ...*

}

```Plain

```

### **7.2 差异对比**


|     |        |        |
| --- | ------ | ------ |
| 维度  | Claude | Gemini |


| **沙箱 bizType** | `claude_sandbox` | `gemini_sandbox` |

| **无状态 bizType** | `claude_none_status` | `gemini_none_status` |

| **无状态默认池** | `claude_default` | `gemini_default` |

| **无状态默认端口** | 3567（可配置） | 3000（硬编码） |

| **无状态最小池大小** | 2（可配置） | 2（可配置） |

| **ProjectId 前缀** | `claude_sandbox_` | `gemini_sandbox_` |

| **分布式锁前缀** | `claude_sandbox_lock:` | `gemini_sandbox_lock:` |

| **底层进程** | Claude stateless 进程`aigc-cc-stateless`） | Gemini agent 进程 |

| **独占/共享池** | 支持（dedicated/shared/debug） | 不适用 |

| **管理服务** | `AgentClaudeContainerManagerService` + `AgentGeminiContainerService` | 仅 `AgentGeminiContainerService` |

| **核心能力** | 完整开发工作流 + 无状态服务 | 纯执行沙箱 |

### **7.3 Claude 独有的容器管理**

Claude 比 Gemini 多了一套独立的容器管理服务，用于独占/共享池的管理：

```Plain
                    Claude 容器管理（独有）
                    ────────────────────
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   AgentClaude      AgentClaude     AgentGemini
   ContainerManager  Container      Container
   Service           Operation      Service
   (Impl)            Service(Impl)  (Impl)
         │               │               │
         │               │               │
   容器分配           扩容/重启        沙箱/无状态
   健康检查           流水线           容器管理
   保活/回收         断点恢复         (Claude+Gemini)
   工作空间初始化
```

**Claude 独有的能力**：

- 独占/共享/调试三种池模式
- 基于权重的容器分配算法
- 操作日志分层优先级
- 自动扩缩容（90% 扩容，50% 回收）
- 工作空间初始化（CLAUDE.md 配置）
- 完整的扩容和重启流水线

**Gemini 没有这些能力的原因**：Gemini 沙箱主要用于一次性代码执行，不需要长期维护工作空间和分支，因此不需要独占池和复杂的管理逻辑。

---

## **八、面试建议**

### **8.1 讲述重点**

面试中讲述 Claude Code 引擎封装时，建议按以下层次展开：

**第一层：定位与背景（1-2 分钟）**

> "我们平台有多种 AI 引擎，Claude Code 是专门做代码执行的。和对话型引擎不同，它需要完整的开发环境——Git 仓库、文件系统、分支管理。所以我们在 Docker 容器中封装了 Claude 的编码能力。"

**第二层：核心设计——三层资源模型（3-5 分钟）**

> "围绕代码执行场景，我们设计了三层资源模型：Workspace 管理仓库克隆，Project 管理工作分支，CodingSession 管理编码会话。这样设计的好处是：仓库只克隆一次（Workspace 复用），不同项目可以并行工作（Project 隔离），每次交互有独立上下文（Session 隔离）。"

**第三层：容器管理亮点（3-5 分钟）**

> "容器管理是最复杂的部分。我们用了共享数据模型，Claude 和 Gemini 共用同一张表，通过 bizType 区分。容器分配用最少进程数算法，保证负载均衡。扩容和重启都走流水线，支持断点恢复。重启用滚动部署，保证服务不中断。"

**第四层：工程细节（按需展开）**

> - 懒加载机制：syncInit 配置，按需创建容器
> - Git 平台适配：工厂模式，统一接口
> - 无状态容器：容器池模式，随机分配，用完即还

### **8.2 高频面试问题**

**Q1: 为什么选择最少进程数算法而不是轮询？**

> 每个 Claude 进程消耗大量内存和 CPU，进程数直接反映容器真实负载。轮询不考虑负载，可能导致某个容器进程堆积而 OOM。我们还在最少进程数基础上加了加权随机，避免多个请求同时涌入同一个"最空闲"的容器。另外通过操作日志分三层优先级，保证重启期间不会把请求分配到正在重启的容器。

**Q2: 扩容流水线如何实现断点恢复？**

> 每次扩容生成唯一的 operationId，每个步骤的执行状态记录在 op_pipeline 表中。如果服务重启导致扩容中断，定时任务 `scaleOperationRecoveryHandler` 会检测超过 30 分钟仍处于 EXECUTING 状态的操作，从 op_log 表恢复请求参数重新执行。关键是 Step 2（容器创建）会检查已创建的流水线记录，计算 remainingCount = 目标数 - 已创建数，只创建差额部分，保证幂等。

**Q3: 滚动部署的具体策略是什么？**

> 每轮处理 30% 的空闲（IDLE）容器，每批最多 5 个，30 秒轮询间隔，最多 60 轮（30 分钟超时）。优先处理 IDLE 容器，OCCUPIED 容器等进程结束后再处理。每轮重新检查容器状态，确保不会重启正在使用的容器。还有 Redis 任务心跳机制（10 分钟过期），确保任务存活。

**Q4: 有状态容器和无状态容器有什么区别？**

> 有状态容器绑定到特定智能体，工作空间在容器内持久化，适合需要长期维护代码的场景。无状态容器从容器池随机分配，项目文件存在数据库中，使用时通过物化流程写入容器，用完即还。无状态模式成本低但首条消息有延迟，有状态模式体验好但资源占用多。通过 CapacityTypeEnum 中的 STATELESS_BOT_CODES 区分。

**Q5: Claude 和 Gemini 为什么共用容器数据模型？**

> 设计原则是"最小改动、向后兼容"。容器管理的核心逻辑——分配、健康检查、保活——对 Claude 和 Gemini 是通用的。通过 bizType 字段区分用途，避免了重复代码。具体来说，`AgentGeminiContainerServiceImpl` 中的 `getGeminiSandboxContainer` 方法通过 `agentType` 参数区分，Claude 走 `claude_sandbox` 前缀，Gemini 走 `gemini_sandbox` 前缀，后续逻辑完全复用。

**Q6: 三层资源模型如何保证并发安全？**

> Project 创建时使用分布式锁（Redis，30 秒 TTL），采用双重检查模式：先查缓存，再查数据库，获取锁后再查一次数据库，防止并发重复创建。容器分配时也使用分布式锁（key 为 projectId），保证同一项目不会同时分配到多个容器。

### **8.3 三层资源模型的讲述框架**

向面试官解释三层模型时，建议用以下框架：

```Plain
1. 问题是什么？
   "用户需要让 AI 在真实的代码仓库中工作，但直接给每个用户分配一个容器太浪费了。"

2. 方案是什么？
   "我们设计了三层资源模型——Workspace、Project、CodingSession。"

3. 每层解决什么问题？
   "Workspace 解决仓库复用——一个仓库只克隆一次。
    Project 解决工作隔离——不同分支互不干扰。
    Session 解决交互隔离——每次对话有独立上下文。"

4. 技术亮点是什么？
   "Workspace 层支持异步批量克隆和断点恢复。
    Project 层通过分布式锁+双重检查保证并发安全。
    Session 层通过路径隔离（repoName/sessionId）实现会话级独立。"

5. 效果如何？
   "一个 4 核 8G 的容器可以同时服务 20 个 Claude 进程，
    通过共享 Workspace 大幅减少了仓库克隆次数和存储成本。"
```

---

> **文档索引**

>


|                                            |                                       |
| ------------------------------------------ | ------------------------------------- |
| 上一章                                        | 下一章                                   |
| [02 - OpenClaw 群聊引擎](./02-OpenClaw群聊引擎.md) | [04 - 容器池调度与弹性伸缩](./04-容器池调度与弹性伸缩.md) |


>

> **相关源码文件索引**：

>


|              |                                                                            |
| ------------ | -------------------------------------------------------------------------- |
| 模块           | 关键文件路径                                                                     |
| 类型枚举         | `agent-api/.../constant/enums/agent/CapacityTypeEnum.java`                 |
| 容器实体         | `agent-api/.../dao/domain/ClaudeContainerManager.java`                     |
| BizType 枚举   | `agent-api/.../enums/claude/ClaudeContainerBizTypeEnum.java`               |
| Pool 枚举      | `agent-api/.../enums/claude/ClaudeContainerPoolTypeEnum.java`              |
| 容器状态枚举       | `agent-api/.../enums/claude/ClaudeContainerManagerStatusEnums.java`        |
| 扩容流水线步骤      | `agent-api/.../enums/claude/ClaudeContainerOpPipelineStepEnum.java`        |
| 重启流水线步骤      | `agent-api/.../enums/claude/ClaudeContainerRestartStepEnum.java`           |
| Workspace 实体 | `agent-api/.../dao/domain/AgentClaudeWorkspace.java`                       |
| Project 实体   | `agent-api/.../dao/domain/AgentClaudeProject.java`                         |
| Session 实体   | `agent-api/.../dao/domain/AgentClaudeCodingSession.java`                   |
| 容器管理服务       | `agent-api/.../service/impl/AgentClaudeContainerManagerServiceImpl.java`   |
| 容器操作服务       | `agent-api/.../service/impl/AgentClaudeContainerOperationServiceImpl.java` |
| Gemini 容器服务  | `agent-api/.../service/impl/AgentGeminiContainerServiceImpl.java`          |
| 沙箱服务         | `agent-api/.../service/claude/impl/ClaudeBotSandboxServiceImpl.java`       |
| 项目文件初始化      | `agent-api/.../service/claude/ClaudeProjectFilesInitializer.java`          |
| Git 平台接口     | `agent-api/.../service/codeAgent/IGitPlatformService.java`                 |
| Git 平台工厂     | `agent-api/.../service/codeAgent/GitPlatformServiceFactory.java`           |
| DevTools 实现  | `agent-api/.../service/codeAgent/DevtoolsGitService.java`                  |
| GitHub 实现    | `agent-api/.../service/codeAgent/GitHubGitService.java`                    |
| GitHub OAuth | `agent-api/.../service/codeAgent/impl/GitHubApiServiceImpl.java`           |
| 自动回收任务       | `agent-api/.../task/AgentContainerAutoRecycleTask.java`                    |


