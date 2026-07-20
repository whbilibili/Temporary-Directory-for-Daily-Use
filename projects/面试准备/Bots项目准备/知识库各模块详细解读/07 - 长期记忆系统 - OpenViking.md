# 长期记忆系统——OpenViking

> 本篇讲清楚"长期记忆和知识库检索有什么不同"、"记忆怎么自动捕获和召回"、"三路检索和重排机制"。

---

## 一、长期记忆 vs 知识库检索

虽然两者都用向量检索技术，但解决的是完全不同的问题：

知识库检索：查企业预置的文档（FAQ、手册、规范），内容由人主动导入，是"已知知识"。比如"公司退货政策是什么"。

长期记忆：自动从对话中提取值得记住的信息（用户偏好、重要决定），是"对话中学到的知识"。比如"用户说他偏好 Python 而不是 Java"。

两者并行让智能体既有"专业知识"又有"个人记忆"。

---

## 二、系统架构

系统往容器中部署两个 Python 钩子脚本，分别在不同时机触发：

- auto_[recall.py](http://recall.py)（UserPromptSubmit Hook）：用户提问时触发——"回忆"相关记忆并注入对话上下文
- auto_[capture.py](http://capture.py)（Stop Hook）：对话结束时触发——从对话中"沉淀"新记忆

脚本本身不直接连接向量数据库，而是统一走 Java 侧的中转开放接口（`/open/ovkb/data/mem/*`），Java 再透传给外部 OpenViking 向量服务。

```Plain
用户提问
  → Claude Code 触发 auto_recall.py
  → HTTP POST 到 Java 侧 /open/ovkb/data/mem/search/find（三路并发检索）
  → Java 透传给 OpenViking 向量服务
  → 脚本本地做去重/重排/TopN → 输出 <relevant-memories> 注入对话上下文

对话结束
  → Claude Code 触发 auto_capture.py
  → 读取对话记录 → 内容过滤
  → HTTP POST 到 Java 侧 /open/ovkb/data/mem/capture（异步）
  → Java 后台异步执行记忆提取
```

---

## 三、auto_[capture.py](http://capture.py)：记忆沉淀

### 3.1 触发时机

Claude Code 的 `Stop` 事件——一轮对话结束时触发。

### 3.2 执行流程

1. 身份加载：从脚本目录往上找 `.biz/context.json`，读出 `misId`（用户工号）和 `agentId`（智能体 ID）。缺任何一个就直接放行，不做记忆。

1. 读取对话记录：从 Claude 传入的 JSON 中拿到 `transcript_path`（会话记录文件路径）和 `session_id`。

1. 增量解析：在本地状态文件中记录"已处理到第几轮"（`capturedTurnCount`），只取新增的轮次，避免重复提取。默认只捕获用户说的话，不捕获 AI 的回复。

1. 内容过滤——决定这段话值不值得记：
  1. 先剥掉已有的 `<relevant-memories>` 块（防止把上一轮注入的记忆又当新内容捕获，形成滚雪球效应）
  2. 长度门槛：含中日韩字符时最短 4 字，纯英文最短 10 字；上限 24000 字
  3. 跳过 `/命令` 类消息
  4. 跳过纯标点/符号
  5. 两种模式：`semantic` 模式只要通过基本过滤就捕获（把语义判断交给服务端）；`keyword` 模式要求命中"记住/偏好/喜欢/邮箱/电话"等关键词

1. 提交：POST 到 Java 侧的 `/open/ovkb/data/mem/capture`，body 包含用户 ID、智能体 ID 和内容。这是异步接口——Java 立即返回"已接收"，真正的记忆提取在后台线程执行。

### 3.3 记忆提取（Java 后台）

Java 收到捕获请求后，在后台异步执行四步：

1. `createSession` —— 创建提取会话
2. `addMessage` —— 添加对话内容
3. `extract` —— 调用 AI 模型提取值得记住的事实
4. `delete` —— 清理临时会话

提取出的记忆以向量形式存入 OpenViking 向量数据库。

---

## 四、auto_[recall.py](http://recall.py)：记忆回忆

### 4.1 触发时机

`UserPromptSubmit` 事件——用户刚提交问题、还没发给模型时触发。

### 4.2 三路并发检索

使用线程池（3 个线程）并发发起三路检索，每路都调 Java 侧的 `/open/ovkb/data/mem/search/find`：


|     |                           |                         |
| --- | ------------------------- | ----------------------- |
| 路   | 检索目标                      | 含义                      |
| 第一路 | `viking://user/memories`  | 用户级记忆——跨该用户所有智能体共享的个人偏好 |
| 第二路 | `viking://agent/memories` | 智能体级记忆——当前智能体专属沉淀       |
| 第三路 | `viking://agent/skills`   | 技能知识——智能体绑定的技能相关知识      |


三路结果合并后按 URI 做第一次去重。

### 4.3 去重、重排、TopN 三步

第一步：初筛（post_process）

- 只保留 level=2 的叶子节点（真正的记忆条目，非目录）
- 分数低于 0.01 的丢弃
- 按 category 或 URI 去重
- 按原始分数降序，取前 candidate_limit 条（候选量是最终返回量的 4 倍，默认 24 条）

第二步：重排（pick_memories）

计算加权综合分，考虑五个维度：

- `baseScore`：OpenViking 返回的原始相似度分数（权重最高）
- `leafBoost`（+0.12）：叶子节点加权——真正的记忆条目比目录更有价值
- `eventBoost`（+0.1）：查询含时间意图（"什么时候"、"昨天"）且记忆是事件类——时间相关问题优先返回事件记忆
- `prefBoost`（+0.08）：查询含偏好意图（"喜欢"、"偏好"）且记忆是偏好类——偏好相关问题优先返回偏好记忆
- `overlapBoost`（最高 +0.2）：查询词与记忆内容的词面重合度——除了语义相似，词面重叠也是相关性信号

按综合分降序排序，再按 abstract 去重一次。优先塞叶子节点，不够再从其余候选补齐。

第三步：内容读取与注入

对每条选中记忆，并发调 `/open/ovkb/data/mem/content/read` 拉取正文内容。拼成 `<relevant-memories>...</relevant-memories>` 块，通过 `additionalContext` 注入回对话上下文。

### 4.4 兜底哲学

整个脚本任何异常都走"放行"逻辑——不注入记忆、不阻断对话。所有关键事件写本地日志文件（JSONL 格式）。记忆功能失败时用户完全无感知，对话正常进行。

---

## 五、URI 空间补全机制

这是一个和 OpenViking 服务端对齐的固定算法：

- 用户级 space = `ov_user`（就是用户工号 misId）
- 智能体级 space = `md5(f"{ov_user}:{ov_agent}")[:12]`（用户+智能体的 md5 前 12 位）

把 `viking://user/memories/...` 里缺失的 space 段补全成 `viking://user/{space}/memories/...`，确保检索请求能正确路由到对应的向量空间。

---

## 六、Hook 的下发与管理

### 6.1 有容器路径（ClaudeBot）

1. 把两个 Python 脚本写进容器 `.claude/hooks/` 目录
2. 合并 Hook 配置到 `agent_configs.HOOKS`（先按文件名剔除旧的 OpenViking 条目再追加，保证幂等不重复）
3. 推送到容器 `settings.json`
4. 通过 `update-settings` 快捷命令注入环境变量（`OPENVIKING_RECALL_LIMIT` 等）

### 6.2 无容器路径（ClaudeBotBusiness）

面向无状态企业版，把脚本写进 `agent_project_files` 数据库表而非容器文件系统。其余步骤相同。

### 6.3 启停设计

启停通过 bot 保存时的 `OPEN_VIKING_ENABLED` 字段触发。停用时精准移除两条 Hook（保留用户自建的其他 Hook），清除 `OPENVIKING_` 前缀的环境变量。

### 6.4 context.json 的写入

脚本运行需要知道"当前用户是谁、当前智能体是谁"，这些信息写在 `.biz/context.json` 文件中：

- 有容器路径：容器首次创建时由 `AgentGeminiContainerServiceImpl` 写入
- 无容器路径：沙箱首次创建时由 `ClaudeBotSandboxServiceImpl` 写入

---

## 七、面试怎么说

问：知识库检索和长期记忆有什么区别？

答：两者都用向量检索技术，但解决不同问题。知识库检索是查"企业预置的知识"——由人主动导入的文档、FAQ、手册等，内容相对稳定。长期记忆是记住"对话中学到的信息"——AI 自动从对话中提取用户偏好、重要决定等事实，存入向量库，下次对话时自动召回。知识库的内容是"已知的"，长期记忆是"动态积累的"。两者并行让智能体既有"专业知识"又有"个人记忆"。

问：长期记忆怎么实现的？

答：在容器里部署两个 Python Hook 脚本。一个在用户提问时触发，做三路并发向量检索（用户级记忆、智能体级记忆、技能知识），然后去重、重排、取 TopN 注入对话上下文。另一个在对话结束时触发，从对话内容中过滤出值得记住的信息，异步提交给 Java 后端，由后端调用 AI 模型提取记忆事实存入向量库。脚本不直接连向量库，而是通过 Java 中转接口透传给 OpenViking 服务。整个设计遵循"失败不阻断"原则——记忆功能出任何异常都不影响正常对话。

问：三路检索的重排机制怎么设计的？

答：综合分考虑五个维度：原始相似度分数（权重最高）、叶子节点加权（+0.12，真实记忆比目录更有价值）、事件意图匹配（+0.1，时间相关问题优先返回事件记忆）、偏好意图匹配（+0.08，偏好问题优先返回偏好记忆）、词面重叠度（最高+0.2，除了语义相似还考虑词面重叠）。这样既利用了向量语义检索的能力，又通过多维度加权提升了结果的相关性。