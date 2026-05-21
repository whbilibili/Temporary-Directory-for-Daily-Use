# AGENTS.md 模板 - 全局路由索引

> 这是项目的全局导航地图，指向所有工程和文档

```markdown
# 全局路由索引

**项目名称**：[项目名]  
**创建时间**：2026-04-20  
**维护者**：架构师  
**最后更新**：2026-04-20

---

## 📍 工程导航

### 前端工程（B）

| 资源 | 位置 | 用途 |
|------|------|------|
| 任务清单 | [B/harness/feature-list.json](../B/harness/feature-list.json) | 前端任务管理 |
| 进度记录 | [B/harness/progress.txt](../B/harness/progress.txt) | 前端进度追踪 |
| 架构文档 | [B/harness/ARCHITECTURE.md](../B/harness/ARCHITECTURE.md) | 前端架构约束 |
| 踩坑档案 | [B/harness/docs/caveats.md](../B/harness/docs/caveats.md) | 前端已知问题 |
| 技术债 | [B/harness/docs/tech-debt.md](../B/harness/docs/tech-debt.md) | 前端技术债清单 |
| 变更日志 | [B/harness/docs/CHANGELOG.md](../B/harness/docs/CHANGELOG.md) | 前端版本记录 |
| 同步状态 | [B/.sync-state.json](../B/.sync-state.json) | 前端同步检查点 |
| 代码仓库 | [B/code-repo](../B/code-repo) | 前端代码（公共仓库） |

### 后端工程（C）

| 资源 | 位置 | 用途 |
|------|------|------|
| 任务清单 | [C/harness/feature-list.json](../C/harness/feature-list.json) | 后端任务管理 |
| 进度记录 | [C/harness/progress.txt](../C/harness/progress.txt) | 后端进度追踪 |
| 架构文档 | [C/harness/ARCHITECTURE.md](../C/harness/ARCHITECTURE.md) | 后端架构约束 |
| 踩坑档案 | [C/harness/docs/caveats.md](../C/harness/docs/caveats.md) | 后端已知问题 |
| 技术债 | [C/harness/docs/tech-debt.md](../C/harness/docs/tech-debt.md) | 后端技术债清单 |
| 变更日志 | [C/harness/docs/CHANGELOG.md](../C/harness/docs/CHANGELOG.md) | 后端版本记录 |
| 同步状态 | [C/.sync-state.json](../C/.sync-state.json) | 后端同步检查点 |
| 代码仓库 | [C/code-repo](../C/code-repo) | 后端代码（公共仓库） |

---

## 🤝 前后端协作文档

| 文档 | 位置 | 维护者 | 用途 |
|------|------|--------|------|
| API 接口契约 | [A/docs/API-CONTRACT.md](../docs/API-CONTRACT.md) | 后端架构师 | 前后端接口定义 |
| 部署流程 | [A/docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) | 运维/架构师 | 环境部署和配置 |
| 安全规则 | [A/docs/SECURITY.md](../docs/SECURITY.md) | 架构师 | 全局安全约束 |
| 全局计划 | [A/PLANS.md](../PLANS.md) | 产品/架构师 | 迭代计划和里程碑 |

---

## 🔄 工作流程

### 1. 开始新任务
```
1. 查看 B/harness/feature-list.json 或 C/harness/feature-list.json
2. 找到 status=pending 的任务
3. 更新 status 为 in_progress
4. 读取相关的 ARCHITECTURE.md 和 caveats.md
5. 开始编码
```

### 2. 完成任务
```
1. 代码完成并测试通过
2. 更新 feature-list.json：status=completed
3. 更新 progress.txt：记录完成情况
4. 如有新问题 → 更新 docs/caveats.md
5. 如有新技术债 → 更新 docs/tech-debt.md
6. 提交代码到本地分支
```

### 3. 会话结束（交接棒）
```
1. 运行 session-handoff skill
2. 自动更新 progress.txt 和 feature-list.json
3. 生成 memory/YYYY-MM-DD.md
4. 更新 .sync-state.json
5. 生成交接报告
```

### 4. 定期巡检
```
每周一：运行 harness-watchdog
- 检查僵尸任务
- 检查文档一致性
- 生成健康报告
```

---

## 📊 当前状态

### 前端工程
- 任务总数：[查看](../B/harness/feature-list.json)
- 完成率：[查看 progress.txt](../B/harness/progress.txt)
- 最后更新：[查看 .sync-state.json](../B/.sync-state.json)

### 后端工程
- 任务总数：[查看](../C/harness/feature-list.json)
- 完成率：[查看 progress.txt](../C/harness/progress.txt)
- 最后更新：[查看 .sync-state.json](../C/.sync-state.json)

---

## 🛠️ 常用命令

```bash
# 初始化前端 harness
bash harness-init.sh frontend frontend

# 初始化后端 harness
bash harness-init.sh backend backend

# 会话结束时运行
session-handoff --harness B/harness/

# 定期巡检
harness-watchdog --check-sync B/harness/ B/code-repo/

# 查看健康报告
cat .agents/health-report.md
```

---

## 📞 联系方式

- **架构师**：[MIS ID]
- **前端负责人**：[MIS ID]
- **后端负责人**：[MIS ID]

---

**维护规则**：
- 新增工程 → 更新此文档
- 工程目录变更 → 更新此文档
- 其他文档变更 → 无需更新此文档
```
