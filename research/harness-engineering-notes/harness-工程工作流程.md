# Harness 工程工作流程

### 标准流程

```
// 代码块
新项目启动
    ↓
backend-architect（初始化 harness 三件套）
    ↓
Coding Agent（按 feature-list.json 执行任务）
    ↓
会话结束 → session-handoff（交接棒）
    ↓
发现缺陷 → issue-triage → issues.json[analyzed_and_ready]
    ↓
架构师唤醒 → backend-architect（读取 issues.json 排期）
    ↓
harness-watchdog（每日/每次大改后的健康巡检）
```

### 各环节说明

#### backend-architect

初始化 harness 三件套：feature-list.json、progress.txt、init.sh。新项目启动时调用，负责将产品需求或项目描述深度转化为可落地的工程任务清单。

#### Coding Agent

按 feature-list.json 逐条执行任务，每次只处理一个 in_progress 状态的任务。任务完成后立即更新状态为 completed，再开始下一条。

#### session-handoff（交接棒）

会话结束前强制触发。自动归档当前工作状态、更新 progress.txt、同步 feature-list.json 任务状态、生成 CHANGELOG 条目，确保下一个 Session 能无摩擦接续工作。

#### issue-triage（缺陷分诊）

接收 Bug 描述写入 issues.json，进行根因分析，将状态推进到 analyzed_and_ready，通知架构师可以排期修复。

#### backend-architect（二次唤醒）

读取 issues.json 中 analyzed_and_ready 的工单，将修复任务重新排入 feature-list.json 并排期执行。

#### harness-watchdog（健康巡检）

建议每日或每次大改后运行。检测僵尸任务（in_progress 超期）、progress.txt 过长、孤儿工单、AGENT.md 索引与实际文件不一致、verification 命令失效等熵增问题。