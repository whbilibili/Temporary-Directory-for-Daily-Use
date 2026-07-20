# 02 - OpenClaw 引擎封装详解

> **定位**：OpenClaw 是平台的有状态 AI Agent 容器引擎，本文档详解其通信协议、消息处理、容器管理和群聊功能

> **关键词**：Bridge WebSocket、流式聚合、Redis Stream、容器生命周期、群聊

---

## 一、OpenClaw 是什么？

### 1.1 通俗理解

OpenClaw 是一个有状态的 AI Agent 容器。打个比方：

- **平台服务**是"前台接待员"——负责接待用户、记录需求、转发给后台专家

- **OpenClaw 容器**是"后台专家"——真正干活的人，他有自己的记忆（对话上下文）、工具箱（技能）、资料库（知识库）

平台服务不直接调用 LLM API，而是通过 WebSocket 通道把用户消息转发给 OpenClaw 容器，容器处理完后再把结果通过同一通道返回。平台充当"中间人"的角色，负责消息转发、流式消费和持久化。

### 1.2 OpenClaw 容器内部有什么？

- 对话上下文（历史消息记忆）
- 技能（Skill，如代码执行、文件操作等）
- 知识库（Knowledge Base，可检索的领域知识）
- 快捷命令（如安装技能、清理知识库、导出快照等）

### 1.3 与其他引擎的对比


|      |                      |             |
| ---- | -------------------- | ----------- |
| 对比维度 | OpenClaw             | Claude Code |
| 运行方式 | 有状态长驻容器              | Docker 代码沙箱 |
| 通信方式 | WebSocket（Bridge 协议） | HTTP API    |
| 状态管理 | 容器内维护上下文             | 每次传完整上下文    |
| 适用场景 | 对话型智能体               | 编码型智能体      |
| 比喻   | "聊天专家"               | "AI 程序员"    |


---

## 二、Bridge 通信协议（核心）

### 2.1 为什么需要 Bridge

平台服务和 OpenClaw 容器是两个独立的进程，跑在不同的机器上，需要一套通信协议来交换消息。选择 WebSocket 的原因：

- **全双工通信**：双方都可以随时发消息（不像 HTTP 只能客户端发起）

- **持久连接**：一次连接建立后持续使用，避免反复建连的开销

- **适合流式传输**：容器的回复是流式的（一个字一个字吐），WebSocket 天然支持

### 2.2 通信架构

Bridge 是连接平台与 OpenClaw 容器的双向 WebSocket 通道。

- **会话 ID 格式**`bridge-{智能体ID}`，比如 `bridge-agent_abc123`

- **网关端口**：默认 18790，容器启动时在网关上暴露 WebSocket 端点

- **连接方向**：平台作为 WebSocket 客户端连接到容器的网关端点

```Plain
┌─────────────────┐       WebSocket (bridge-{agentId})       ┌─────────────────┐
│                 │  ──────────── 用户消息 ──────────────▶   │                 │
│   平台服务       │                                          │  OpenClaw 容器   │
│  (Java 后端)    │  ◄──────── assistant_reply ───────────   │  (Node.js 进程) │
│                 │  ◄──────── error ─────────────────────   │                 │
│                 │  ◄──────── ping/pong ────────────────▶   │                 │
└─────────────────┘                                          └─────────────────┘
```

### 2.3 平台发给容器的消息

平台构建一条用户消息，通过 Bridge 通道发送给容器。

**单聊模式消息结构（JSON 示例）**：

```JSON
{
  "id": "msg_20260630_001",
  "sessionKey": "session_xyz789",
  "text": "帮我分析一下这段代码的问题",
  "userId": "wanghong52",
  "ts": 1719753600000,
  "tenantId": "tenant_001",
  "targetAgentId": "agent_abc123"
}
```

**群聊模式额外字段**：

```JSON
{
  "id": "msg_20260630_002",
  "sessionKey": "session_group_456",
  "text": "@代码审查Agent 帮我看看这个PR",
  "userId": "wanghong52",
  "ts": 1719753700000,
  "tenantId": "tenant_001",
  "groupId": "group_nano123",
  "groupName": "代码审查群",
  "groupMembers": [
    {"agentId": "agent_001", "name": "代码审查Agent", "role": "代码审查专家，擅长发现bug"},
    {"agentId": "agent_002", "name": "安全审计Agent", "role": "安全审计专家，擅长发现漏洞"},
    {"userId": "wanghong52", "name": "王宏", "role": "用户"}
  ],
  "groupContext": [
    {"role": "user", "content": "大家好，我有个PR需要审查"},
    {"role": "assistant", "content": "好的，请分享PR链接"}
  ],
  "targetAgentId": "agent_001",
  "mentions": ["agent_001"],
  "triggerMsgId": "msg_20260630_001",
  "roundNumber": 2
}
```

### 2.4 容器回复平台的消息

容器处理后，通过同一个 WebSocket 连接返回响应消息。消息按 `type` 字段分类：

**assistant_reply（AI 回复）**：

```JSON
{
  "type": "assistant_reply",
  "id": "msg_20260630_001",
  "text": "这段代码有几个问题：\n1. 空指针风险...",
  "done": false,
  "sessionKey": "session_xyz789",
  "fromAgentId": "agent_abc123"
}
```

- `done: false` 表示还有后续内容（流式输出中）
- `done: true` 表示回复结束

**error（错误信息）**：

```JSON
{
  "type": "error",
  "id": "msg_20260630_001",
  "code": "INTERNAL_ERROR",
  "message": "容器内部处理异常",
  "sessionKey": "session_xyz789",
  "ts": 1719753660000
}
```

**ready（就绪信号）**：容器启动完成后发送，表示可以接收消息了。

```JSON
{
  "type": "ready",
  "version": "1",
  "bridgeId": "bridge-agent_abc123",
  "ts": 1719753600000
}
```

**ping/pong（心跳保活）**：定期发送，保持连接活跃。

### 2.5 流式片段聚合（装饰器模式）

**问题**：容器的流式输出可能分多条消息返回——每个 token（甚至每个字符）一条消息。如果直接转发给前端，前端会收到大量碎片消息，体验很差。

**解决方案**：用装饰器模式在平台侧做消息聚合。

**具体做法**：

```Plain
容器输出 token 流：
    "这" → "段" → "代" → "码" → "有" → "几" → "个" → "问" → "题" → [End]
     │      │      │      │      │      │      │      │      │       │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼       ▼
   装饰器累积缓冲区（ConcurrentHashMap<sessionId, StringBuilder>）
     │                                                              │
     │  每收到一条 LLM 消息，追加到缓冲区                              │
     │                                                              │
     │  收到 End 标记后，取出缓冲区完整内容                            │
     ▼                                                              ▼
  组装完整的 assistant_reply：
  {
    "type": "assistant_reply",
    "id": "msg_20260630_001",
    "text": "这段代码有几个问题：\n1. 空指针风险...",
    "done": true
  }
```

**为什么用装饰器模式**：不修改原有的消息发送逻辑，只是在上面"包了一层"聚合逻辑。当不需要聚合时（比如非流式场景），可以去掉装饰器，原有逻辑不受影响。

---

## 三、消息处理流程

### 3.1 用户发送消息到 OpenClaw（完整链路）

```Plain
用户通过 WebSocket 发送消息
    │
    ▼
ChatWebsocketTextHandler.handleBizMessage()
    │ 解析 WebSocketData<ChatRequest>
    │ 调用 isOpenClawAgent() 判断是否为 OpenClaw 类型
    │   → 检查 subAgentId 是否在配置列表中
    │   → 或查数据库 capacityType 是否为 OPENCLAW_BOT
    │
    ▼
ChatServiceRouter.getOpenClawService(chatRequest)
    │ 根据 Apollo 开关选择旧版或新版实现
    │   → 旧版：OpenClawAgentServiceImpl
    │   → 新版：UnifiedOpenClawAgentServiceImpl（继承统一骨架）
    │
    ▼
UnifiedOpenClawAgentServiceImpl.execute(chatRequest)
    │
    ├── 1. beforeHook() 前置处理链
    │   ├── SessionArchivedCheckHook   → 检查会话是否归档
    │   ├── TeamArchivedCheckHook      → 检查团队是否归档
    │   ├── AgentCollabInitHook        → 协作初始化（如有 teamId）
    │   ├── AgentChatInitHook          → 聊天记录初始化
    │   ├── AgentCollabMessageContentHook → 协作消息内容处理
    │   └── OpenClawBeforeHook         → 文件下载到容器工作区
    │
    ├── 2. 获取分布式锁
    │   key = streamConsumeLock:{assistantMessageId}
    │   启动心跳续期线程
    │
    ├── 3. 构建并发送消息给容器
    │   ├── 构建 OpenClawUserMessage（id, sessionKey, text, userId...）
    │   ├── 群聊模式补充 groupId/groupMembers/groupContext
    │   ├── 子 Agent → 父 Agent ID 替换
    │   └── 通过 Bridge WebSocket 发送：
    │       sendText("bridge-" + subAgentId, messageJson)
    │
    ├── 4. 消费 Redis Stream（阻塞等待容器回复）
    │   ├── streamKey = assistantMessageId
    │   ├── groupId = 配置的消费组ID
    │   └── idleTimeout = 30 分钟
    │
    └── 5. finally：释放锁 + 取消心跳
```

### 3.2 OpenClaw 容器回复消息（反向链路）

```Plain
OpenClaw 容器处理完成
    │ 通过 Bridge WebSocket 发送 JSON 消息
    │
    ▼
ChatbotBridgeWebSocketHandler.handleTextMessage()
    │ 解析消息 JSON
    │ 过滤非业务消息：
    │   → type == "ping" → 跳过（心跳）
    │   → type == "user_message" → 跳过（回显）
    │   → type == "ready" → 跳过（就绪信号）
    │
    ▼ 有效消息（assistant_reply / error）
    writeToRedisStream(streamKey=messageJson.id, body=msgObj)
    │ XADD streamKey {data: messageJson}
    │
    ├── 如果是定时任务场景：enqueueDrainIfCronFinal()
    │
    ▼
RedisStreamMessageConsumeService（消费端，阻塞等待中）
    │ XREADGROUP 读取到新消息
    │
    ▼
OpenClawStreamMessageHandlerService.handleMessage()
    │
    ├── 解析 body.data → JSONObject
    │
    ├── 按 type 分发：
    │   ├── "assistant_reply" → handleAssistantReply()
    │   │   ├── 解析回复内容（text, done, fromAgentId, groupId...）
    │   │   ├── 构建 WorkFlowData + NodeContent
    │   │   ├── 合并快照（sseMessageUtil.merge）
    │   │   ├── 累积文本（打字机效果）
    │   │   ├── 替换组件占位符（__@{id} → <AgentComp>）
    │   │   ├── 推送 WebSocket 给前端
    │   │   │   → done=false：增量推送
    │   │   │   → done=true：推送结束状态
    │   │   └── 持久化 system payload 到 agent_chat_record
    │   │
    │   └── "error" → handleErrorMessage()
    │       ├── 构建错误 WorkFlowData
    │       ├── 推送 WebSocket 给前端
    │       └── 更新状态为 Ended
    │
    └── 返回消费结果（SUCCESS / CONTINUE / SKIP）
```

### 3.3 定时任务链路

定时触发场景（如定时报告、定时提醒）的消息处理与实时链路略有不同：

- 使用 `OpenClawCronAssistantMergedStreamConsumeService`（合并消费服务）
- 多个定时任务的消息可能合并处理
- 消费逻辑复用 `OpenClawStreamMessageHandlerService`，但消费配置不同
- 定时任务的消息会通过 `enqueueDrainIfCronFinal()` 做合并逻辑

---

## 四、容器生命周期管理

### 4.1 状态机

```Plain
         创建
          │
          ▼
     STARTING ──────▶ RUNNING
                         │
                    ┌────┴────┐
                    │         │
                 停止      重启
                    │         │
                    ▼         ▼
                STOPPED ◀── RESTARTING
                    │
                    │ (重新创建)
                    └─────▶ STARTING
```

**各状态含义**：


|            |     |           |
| ---------- | --- | --------- |
| 状态         | 含义  | 触发条件      |
| STARTING   | 启动中 | 创建容器或重启后  |
| RUNNING    | 运行中 | 探活通过      |
| STOPPED    | 已停止 | 手动停止或心跳超时 |
| RESTARTING | 重启中 | 用户触发重启    |


### 4.2 容器操作详解

**创建容器**：

```Plain
createAndInitContainer()
    │
    ├── 1. 调用设备 API 创建 Docker 容器
    │       → 指定镜像、资源限制、网络配置
    │
    ├── 2. 写网关配置
    │       → 在网关上注册 WebSocket 路由
    │       → 端口 18790
    │
    ├── 3. 探活
    │       → 轮询发送 HTTP 请求到容器
    │       → 等待 ready 信号
    │
    ├── 4. 写入状态
    │       → agent_configs 表：OPENCLAW_RUNNING_STATUS = RUNNING
    │
    └── 5. 安装技能和知识库
            → clean-kb-skills（清理）
            → install-knowledge-recall（安装）
```

**重启容器**：

```Plain
restart()
    │
    ├── 判断当前状态
    │   ├── STOPPED → 走 recreateAndRestore（重建+恢复）
    │   │   ├── 创建新容器
    │   │   ├── 从备份恢复数据
    │   │   └── 安装技能
    │   │
    │   └── RUNNING → 走设备层 restart
    │       └── 直接重启 Docker 容器
    │
    └── 更新状态为 RESTARTING → RUNNING
```

**停止容器**：

```Plain
stop()
    │
    ├── 1. 备份容器数据
    │       → 导出快照
    │
    ├── 2. 销毁容器
    │       → 调用设备 API 删除 Docker 容器
    │
    └── 3. 更新状态为 STOPPED
```

**探活**：

```Plain
keepalive()
    │
    ├── 通过网关端口 18790 发送 HTTP 探活请求
    │
    ├── 成功 → 更新 OPENCLAW_LAST_HEARTBEAT 时间戳
    │
    └── 失败 → 标记为 STOPPED
```

### 4.3 心跳检测机制

平台定期检查容器是否存活：

```Plain
心跳检测流程：
    │
    ├── 读取 OPENCLAW_LAST_HEARTBEAT 时间戳
    │
    ├── 计算与当前时间的差值
    │
    ├── 差值 > 超时阈值？
    │   ├── 是 → 自动标记为 STOPPED
    │   └── 否 → 容器正常
    │
    └── 状态存储在 agent_configs 表
        key = OPENCLAW_RUNNING_STATUS
```

### 4.4 技能和知识库同步

当智能体配置更新后（比如修改了知识库内容或新增了技能），需要同步到容器：

```Plain
onBotSaved() → installOrUpdateKnowledge()
    │
    ├── 1. 清理旧技能
    │   → 执行快捷命令 clean-kb-skills
    │   → 清除容器 ~/.openclaw/skills/ 目录
    │
    ├── 2. 渲染新内容
    │   ├── 渲染 rule（规则提示词）
    │   └── 渲染 knowledge-recall（知识召回模板）
    │
    └── 3. 安装到容器
        → 执行快捷命令 install-knowledge-recall
        → 写入容器 ~/.openclaw/skills/ 目录
```

**快捷命令一览**：


|                          |         |
| ------------------------ | ------- |
| 命令                       | 功能      |
| download                 | 下载文件到容器 |
| export-snapshot          | 导出快照备份  |
| system-info              | 查看系统信息  |
| clean-kb-skills          | 清理知识和技能 |
| install-knowledge-recall | 安装知识召回  |


---

## 五、群聊功能设计

### 5.1 业务场景

多个用户和多个智能体在一个群里对话。比如：

> **产品经理**在群里说：「@需求分析Agent 帮我分析一下这个用户反馈」

> **需求分析Agent**回复分析结果

> **产品经理**说：「@开发Agent 根据分析结果写个技术方案」

> **开发Agent**读取分析结果，输出技术方案

### 5.2 数据模型

**群组表（openclaw_chat_group）**：


|                     |        |                   |
| ------------------- | ------ | ----------------- |
| 字段                  | 类型     | 说明                |
| id                  | Long   | 自增主键              |
| group_uid           | String | 群组唯一标识（NanoId 生成） |
| name                | String | 群名称               |
| type                | Int    | 类型：1=私有群，2=群聊     |
| creator_id          | String | 创建者用户 ID          |
| group_profile_photo | String | 群头像               |


**成员表（openclaw_chat_group_member）**：


|           |          |               |
| --------- | -------- | ------------- |
| 字段        | 类型       | 说明            |
| id        | Long     | 自增主键          |
| group_uid | String   | 群组 ID         |
| user_id   | String   | 用户 ID（人类成员）   |
| agent_id  | String   | 智能体 ID（AI 成员） |
| role      | Int      | 角色：1=用户，2=智能体 |
| joined_at | DateTime | 加入时间          |


**会话关联**`agent_session_info` 表增加 `group_id` 字段，关联群组。

### 5.3 API 设计

路径前缀：`/api/v1/openclaw/group` 或 `/open/v1/openclaw/group`


|                  |      |                               |
| ---------------- | ---- | ----------------------------- |
| 接口               | 方法   | 说明                            |
| `/create`        | POST | 创建群组并自动创建会话                   |
| `/update`        | POST | 更新群名/类型/头像                    |
| `/delete`        | POST | 删除群组及关联成员                     |
| `/member/add`    | POST | 添加成员（自动去重）                    |
| `/member/remove` | POST | 移除成员                          |
| `/member/list`   | GET  | 群成员列表（智能体成员补充详情）              |
| `/detail`        | GET  | 群聊详情（含 memberCount、sessionId） |
| `/list`          | GET  | 按创建者查群列表                      |


### 5.4 群聊消息的特殊处理

**额外携带的群组信息**：

- `groupId` / `groupName`：群组标识和名称
- `groupMembers`：成员列表，每个成员包含 agentId/userId、name、role 描述
- `groupContext`：会话历史（从 agent_chat_record 按 sessionId 查最近 100 条）

**@mention 定向触发**：

当用户消息中包含 `@代码审查Agent` 时，平台解析 mention 列表，设置 `targetAgentId`，只有被 @ 的智能体会回复。

**群成员角色描述自动填充**：

从智能体的 `agent.describe_message` 配置中读取角色描述，填充到 groupMembers 中每个成员的 `role` 字段。这样 LLM 就能理解每个成员的定位——"哦，代码审查Agent 负责代码审查，安全审计Agent 负责安全审计"。

**示例：群聊消息的完整数据**：

```JSON
{
  "id": "msg_group_001",
  "sessionKey": "session_group_456",
  "text": "@代码审查Agent 帮我看看这个PR的代码质量",
  "userId": "wanghong52",
  "ts": 1719753700000,
  "groupId": "group_nano123",
  "groupName": "代码审查群",
  "groupMembers": [
    {
      "agentId": "agent_review",
      "name": "代码审查Agent",
      "role": "你是代码审查专家，擅长发现代码质量问题、潜在bug和改进建议"
    },
    {
      "agentId": "agent_security",
      "name": "安全审计Agent",
      "role": "你是安全审计专家，擅长发现安全漏洞和风险"
    },
    {
      "userId": "wanghong52",
      "name": "王宏",
      "role": "用户"
    }
  ],
  "groupContext": [
    {"role": "user", "content": "大家好"},
    {"role": "assistant", "content": "你好！有什么可以帮你的？"}
  ],
  "targetAgentId": "agent_review",
  "mentions": ["agent_review"],
  "roundNumber": 3
}
```

---

## 六、新旧版本双轨运行

### 6.1 为什么要双版本

系统重构过程中，新版实现（Unified 版）复用了统一执行骨架，代码更简洁。但旧版已经在生产环境运行，不能一次性切换所有流量。因此需要新旧版本并行运行，逐步切流。

### 6.2 切流策略

**旧版（OpenClawAgentServiceImpl）**：

- 直接管理分布式锁和 Stream 消费
- 自己实现完整的执行流程
- 不继承统一骨架

**新版（UnifiedOpenClawAgentServiceImpl）**：

- 继承 AbstractChatExecutionService（统一执行骨架）
- 只实现差异化部分（buildTrigger, buildHandler 等）
- 复用通用的锁、心跳、Stream 消费逻辑

**切流过程**：

```Plain
配置中心（Apollo）：
    agent.chat.unified.openclaw.enable = false  （初始关闭）
    agent.chat.unified.openclaw.whitelist = user1,user2  （白名单）

ChatServiceRouter 路由逻辑：
    if (enable == true || whitelist.contains(userId)) {
        return unifiedOpenClawService;  // 新版
    } else {
        return openClawService;  // 旧版
    }

灰度步骤：
    第 1 天：白名单加入 5 个测试用户
    第 3 天：白名单扩大到 50 个用户
    第 7 天：全局开关打开，全量切换
    第 10 天：下线旧版代码
```

---

## 七、关键配置项


|                                             |                      |                       |
| ------------------------------------------- | -------------------- | --------------------- |
| 配置项                                         | 说明                   | 示例值                   |
| `spring.redis.openclaw.consumer.group-id`   | Redis Stream 消费组 ID  | openclaw-consumer     |
| `spring.redis.openclaw.stream-consume-lock` | 分布式锁前缀               | stream:consume:lock:  |
| `spring.redis.openclaw.session-zset`        | Stream 索引有序集合        | openclaw:session:zset |
| `spring.redis.openclaw.session-zset.expire` | Stream 过期时间          | 86400                 |
| `agent.chat.unified.openclaw.enable`        | Unified 版开关          | false                 |
| `openClawSubAgentIds`                       | OpenClaw Agent ID 列表 | agent_001,agent_002   |
| `openclaw.gateway.port`                     | 容器网关端口               | 18790                 |
| `bots.wsUrl`                                | Bridge WebSocket 地址  | ws://gateway:18790    |


---

## 八、面试建议

### 8.1 讲述重点

讲 OpenClaw 封装时，重点突出三个技术亮点：

1. **Bridge 通信协议**——自己设计了一套 WebSocket 双向通信协议，包含消息类型分类、心跳保活、流式聚合

2. **装饰器模式做流式聚合**——不修改原有逻辑，优雅地解决了流式碎片问题

3. **群聊功能**——多智能体群聊的上下文管理、@mention 路由、角色描述自动填充

### 8.2 可能被追问的问题

**Q: Bridge 通信如果连接断了怎么办？**

> 平台有重连机制。WebSocket 断开后会自动重连，重连后恢复 Bridge 会话。如果容器本身挂了，心跳检测会标记为 STOPPED，后续请求会触发重启或报错。

**Q: 流式聚合的缓冲区会不会内存溢出？**

> 缓冲区用的是 ConcurrentHashMap，key 是会话 ID。每个会话的缓冲区是 StringBuilder，正常对话回复不会太大。而且消费完成后会清除缓冲区。极端情况下（比如超长回复），有 Stream 的空闲超时机制兜底，5 分钟没完成就退出。

**Q: 群聊消息的 groupContext 每次都传 100 条历史，token 量会不会太大？**

> 会有这个问题。我们做了控制：最多 100 条，而且只传 role 和 content 的精简格式。如果 Token 超限，OpenClaw 容器内部会做截断处理。后续优化方向是做智能摘要，而不是传原始历史。

**Q: 新旧版本切流时，同一个用户的请求会不会一半走新版一半走旧版？**

> 不会。路由判断在请求入口做，同一个用户的请求总是走同一个版本（基于白名单判断）。切换是用户级的，不是请求级的。切换前正在处理的请求会走完旧版流程，新请求走新版。

---

*本文档基于 efficiency-agent-service 代码库深度调研整理，涵盖 OpenClaw 引擎的 Bridge 通信协议、消息处理流程、容器生命周期管理、群聊功能等核心技术方案。*