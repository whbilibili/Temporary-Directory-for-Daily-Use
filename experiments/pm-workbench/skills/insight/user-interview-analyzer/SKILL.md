---
name: user-interview-analyzer
description: 用户访谈分析工具。用JTBD框架从访谈记录提炼核心Job，按频率×强度排序优先级。触发词：访谈分析、用研结果整理、用户访谈总结、提炼用户需求、JTBD分析。

metadata:
  skillhub.creator: "gaoyuan65"
  skillhub.updater: "gaoyuan65"
  skillhub.version: "V2"
  skillhub.source: "FRIDAY Skillhub"
  skillhub.skill_id: "13334"
---

# user-interview-analyzer

**用研访谈分析器** — 用JTBD框架从访谈记录中提炼用户核心需求和行为洞察。

## 触发条件
用户提到：访谈记录分析、用户调研结论、访谈总结、用研报告、JTBD分析。

## 执行步骤

### Step 1：接收访谈材料
支持输入格式：
- 原始访谈记录（逐字稿）
- 访谈摘要
- 多个访谈的汇总

### Step 2：提取Jobs to Be Done
从每段访谈中提取：
- **当时情境**（When/Where）：发生什么情况时产生了需求？
- **动机**（Why）：用户真正想要实现什么？
- **阻碍**（Obstacle）：什么妨碍了他们？
- **现有方案**（Current Solution）：他们现在怎么做？
- **期望改进**（Desired Improvement）：他们希望怎样更好？

### Step 3：聚类与优先级
将所有Jobs聚类：
- 按"频率 × 强度"排序
- 标注"已有解法的满意度"
- 发现"无解法或解法很差的高频Job"（机会点）

### Step 4：洞察质量检验
- 需求是否有行为证据支撑（而非只是"用户说他想要"）
- 是否区分了功能需求和情感需求
- 是否发现了"超出预期的发现"

## 输出格式
```
【访谈分析报告】样本量：[N人] | 访谈时间：[日期范围]

核心洞察（Top 3 Jobs）：
1. Job：[一句话描述用户任务]
   情境：[什么时候/什么场景]
   当前痛点：[现有解法的问题]
   频率：高/中/低 | 满意度：[1-5]
   💡 机会点：[产品可以怎么做]

2. ...

反直觉发现：
- [超出预期的发现，需要进一步验证]

需要继续调研的问题：
- [本次访谈未解答的关键问题]

数据置信度：[高/中/低] | 原因：[样本代表性、访谈质量等]
```


---

💬 **使用反馈**：用完觉得好用或有问题，[点这里告诉作者](https://user-skill-insights.mynocode.host)，30秒搞定。
