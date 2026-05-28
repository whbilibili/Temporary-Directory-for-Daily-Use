# CLAUDE.md — 产品经理工作台

## 这是什么

这是一个**产品经理认知工作台**，不是简单的 prompt 模板集合。在这里工作时，你拥有：

- **持久化的产品上下文**（`context/`）：产品愿景、用户画像、功能注册表、决策历史、技术约束
- **结构化的工作流程**（`AGENTS.md`）：明确的输入→处理→输出流水线
- **子智能体能力**（`skills/`）：用户调研、数据分析、竞品情报、PRD 审查
- **质量门禁**（`hooks/`）：写前检查防冲突，写后审查保质量
- **验证工具**（`scripts/`）：自动化的文档完整性校验

## 快速开始

### 首次使用：初始化你的产品上下文

1. 填写 `context/product-vision.md` — 你的产品是什么、为谁、核心指标
2. 填写 `context/user-personas.md` — 至少 2 个核心用户画像
3. 填写 `context/tech-constraints.md` — 技术团队给的约束条件
4. 清空 `context/feature-registry.json` 中的示例数据

### 日常使用：写一份 PRD

```
我要写一份关于 [功能名] 的 PRD

→ AI 自动执行:
  1. [pre-write hook] 检查冲突和一致性
  2. 加载相关上下文
  3. 按需调用子智能体（用户调研/数据分析/竞品参考）
  4. 使用 prd-template 撰写 PRD
  5. [prd-reviewer] 自动审查
  6. [post-write hook] 更新注册表和决策日志
  7. 归档到 outputs/prds/
```

## 目录结构

```
pm-workbench/
├── CLAUDE.md              ← 你在这里（工程入口）
├── AGENTS.md              ← 角色定义 + 工作流程 + 子智能体路由
├── context/               ← 持久化的产品认知上下文
│   ├── product-vision.md      产品愿景和北极星指标
│   ├── user-personas.md       用户画像库
│   ├── feature-registry.json  功能注册表（防重复）
│   ├── decisions-log.md       决策日志（防翻旧账）
│   └── tech-constraints.md    技术约束（防不可行）
├── templates/             ← 产出物模板
│   ├── prd-template.md
│   ├── user-story-template.md
│   └── competitive-analysis-template.md
├── skills/                ← 子智能体
│   ├── user-research/         用户调研分析
│   ├── data-analyst/          数据指标设计
│   ├── competitive-intel/     竞品情报分析
│   └── prd-reviewer/          PRD 质量审查
├── hooks/                 ← 质量门禁
│   ├── pre-write.md           写前：冲突检查
│   └── post-write.md          写后：审查+归档+更新
├── outputs/               ← 产出物存档
│   ├── prds/
│   ├── specs/
│   └── competitive-analyses/
└── scripts/               ← 工具脚本
    └── validate-prd.py        PRD 完整性校验
```

## 核心规则

1. **先加载上下文再动笔**: 每次写东西前必须执行 pre-write hook
2. **产出必须可追溯**: 每个功能对应 feature-registry 中一条记录
3. **决策必须有记录**: 重要取舍写入 decisions-log
4. **质量必须有验证**: 写完后自动触发 prd-reviewer
5. **假设必须标注**: 未经验证的用户洞察标注"待验证"

## 命令

```bash
# 验证单个 PRD
~/Library/Application\ Support/xiaomei-cowork/Python311/python/bin/python3 scripts/validate-prd.py outputs/prds/xxx.md

# 批量验证所有 PRD
~/Library/Application\ Support/xiaomei-cowork/Python311/python/bin/python3 scripts/validate-prd.py outputs/prds/
```

## 设计理念

这个工作台解决的核心问题是：**让 AI 产出的产品文档具有持久性和一致性。**

没有工作台时，每次对话都是从零开始，AI 不知道你的产品历史、不知道什么已经做过、什么已经否决过。有了工作台，AI 站在完整的产品认知之上工作，产出的文档自然就有深度和一致性。

这本质上就是 Harness Engineering 在非代码领域的应用：
- `feature-registry.json` 相当于代码项目里的模块注册
- `decisions-log.md` 相当于 ADR（Architecture Decision Records）
- `hooks/` 相当于 git hooks / CI checks
- `skills/` 相当于 microservices / 子模块
- `validate-prd.py` 相当于 lint / type check
