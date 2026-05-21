# Graph RAG 系统讲解

> 侧重工程实践，兼顾理论原理
> 创建时间：2025-05

---

## 目录

- [一、背景与动机](#一背景与动机)
- [二、核心概念](#二核心概念)
- [三、Graph RAG 的完整流程](#三graph-rag-的完整流程)
- [四、关键技术细节](#四关键技术细节)
- [五、与传统 RAG 的深度对比](#五与传统-rag-的深度对比)
- [六、主流实现与工具生态](#六主流实现与工具生态)
- [七、工程落地挑战](#七工程落地挑战)
- [八、前沿方向](#八前沿方向)
- [九、对照传统 RAG 的全链路优化工程实践](#九对照传统-rag-的全链路优化工程实践)

---

## 一、背景与动机

### 1.1 传统 RAG 的工作原理回顾

传统 RAG（Retrieval-Augmented Generation）的流程可以用一句话概括：**把文档切碎、向量化、相似度检索、塞给 LLM**。

```
文档 → 分块(chunk) → 向量嵌入 → 向量数据库
                                      ↓
用户提问 → 问题向量化 → Top-K 相似度检索 → 拼接上下文 → LLM 生成答案
```

这套流程在大量场景下工作良好，但它有一个根本性的结构缺陷：**每个 chunk 是孤立的**。向量数据库存储的是语义相似度，而不是知识之间的结构关系。

### 1.2 传统 RAG 的失效场景

**场景一：多跳推理（Multi-hop Reasoning）**

> 问题："负责 A 项目的工程师，之前在哪家公司工作过？那家公司的主要竞争对手是谁？"

这个问题需要跨越至少三个文档片段的关系链。传统 RAG 可能分别检索到三段相关文本，但无法感知它们之间的逻辑连接，LLM 拿到的是三段孤立的文字，很难正确推理。

**场景二：全局性/综合性问题**

> 问题："这批财报文件里，哪些业务线在过去三年持续亏损？"

这类问题需要跨越所有文档做聚合分析。传统 RAG 的 Top-K 检索只能返回局部相关片段，无法形成全局视图。

**场景三：关系型查询**

> 问题："张三和李四有没有共同合作过的项目？"

两个实体之间的关系往往不会在同一个 chunk 里出现，向量相似度检索对这类问题几乎无能为力。

**场景四：低密度长尾知识**

某些关键事实在文档中只出现一次，且表述方式与用户提问差异较大，向量相似度检索容易漏掉。

### 1.3 为什么图结构能解决这些问题

图（Graph）天然适合表达**实体与关系**：

- **节点（Node）**：实体，如人、公司、项目、概念
- **边（Edge）**：关系，如"负责"、"竞争"、"合作"、"属于"

有了图结构，上面的失效场景就有了解法：

| 失效场景 | 图的解法 |
|---------|---------|
| 多跳推理 | 图遍历（BFS/DFS），沿关系边跳转 |
| 全局问题 | 社区摘要（Community Summary），预聚合全局知识 |
| 关系查询 | 直接查询两节点之间的路径 |
| 低密度知识 | 实体抽取时已结构化，不依赖语义相似度 |

### 1.4 Graph RAG 的发展脉络

```
2020 年前  知识图谱问答（KGQA）：依赖人工构建的结构化知识库，成本极高
    ↓
2020-2022  RAG 兴起：向量检索 + LLM，工程化门槛大幅降低
    ↓
2023       学术界开始探索 Graph + RAG 的结合，如 KGRAG、G-Retriever
    ↓
2024.04    微软发布 GraphRAG 论文（Edge et al.），引入社区摘要机制，
           在全局问题上大幅超越传统 RAG，引发工业界广泛关注
    ↓
2024 下半年 LlamaIndex、LangChain、Neo4j 等主流框架相继推出 Graph RAG 支持
    ↓
2025       Graph RAG 进入工程落地阶段，成本优化、增量更新成为核心议题
```

微软 GraphRAG 论文的核心贡献在于：不只是把图用于检索，而是在**索引阶段**就用 LLM 对图中的社区（紧密相连的节点群）预先生成摘要，使得回答全局性问题时无需遍历所有原始文档。

---

## 二、核心概念

### 2.1 知识图谱基础

知识图谱（Knowledge Graph）用**三元组（Triple）**来表达知识：

```
<主体 Subject, 谓词 Predicate, 客体 Object>

示例：
<张三, 负责, 项目A>
<项目A, 属于, 技术部>
<技术部, 隶属于, ABC公司>
```

三元组是图的最小单元。多个三元组连接在一起，就形成了一张可以遍历的知识网络。

**核心术语对照：**

| 图论术语 | 知识图谱术语 | 直观理解 |
|---------|------------|---------|
| Node（节点） | Entity（实体） | 人、地点、概念、事件 |
| Edge（边） | Relation（关系） | 动词、介词短语 |
| Node Property | Entity Attribute | 实体的属性，如年龄、日期 |
| Edge Property | Relation Attribute | 关系的属性，如置信度、时间 |

### 2.2 图的类型

**同质图（Homogeneous Graph）**：所有节点和边类型相同。简单但表达力弱，适合做图算法原型验证。

**异质图（Heterogeneous Graph）**：节点和边有多种类型。Graph RAG 中最常用，因为现实世界的实体类型是多样的（人、公司、产品、事件……）。

**属性图（Property Graph）**：节点和边都可以携带任意键值对属性。Neo4j 使用的就是属性图模型，工程上最灵活。

```
// 属性图示例（Cypher 语法）
(张三:Person {age: 30, department: "技术部"})
  -[:MANAGES {since: "2023-01"}]->
(项目A:Project {status: "进行中", budget: 100000})
```

**Graph RAG 中通常使用属性图**，因为实体和关系都需要携带额外信息（来源文档、置信度、描述文本等）。

### 2.3 社区检测与社区摘要

这是微软 GraphRAG 的核心创新，也是 Graph RAG 区别于简单"图+向量"方案的关键。

**什么是社区（Community）？**

图中紧密相连的节点群。直觉上，同一个社区内的节点彼此关联密切，跨社区的连接相对稀疏。

```
社区A：[CEO, CFO, 董事会, 年度报告, 财务数据]  ← 财务相关实体
社区B：[产品经理, 工程师, 需求文档, 技术方案]  ← 研发相关实体
社区C：[销售总监, 客户, 合同, 销售数据]        ← 销售相关实体
```

**社区摘要（Community Summary）的作用：**

对每个社区，用 LLM 预先生成一段自然语言摘要，描述该社区的核心主题和关键信息。

```
社区A 摘要："该社区包含公司财务相关实体。CEO 张三和 CFO 李四
共同负责年度财务报告的审批，2023 年财务数据显示营收增长 15%……"
```

当用户提问全局性问题时，不需要遍历所有原始文档，只需检索相关社区的摘要即可。这是 Graph RAG 在全局问题上碾压传统 RAG 的根本原因。

**社区层级（Hierarchical Community）：**

社区可以嵌套，形成层级结构：

```
Level 0（最细粒度）：单个实体
Level 1：小社区（5-20 个节点）
Level 2：中社区（多个小社区合并）
Level 3：大社区（顶层主题）
```

回答不同粒度的问题时，选择不同层级的社区摘要，在精度和成本之间取得平衡。

### 2.4 索引层 vs 检索层

Graph RAG 的架构分为两个阶段，职责完全不同：

**索引层（Indexing Layer）**：离线构建，一次性（或增量）执行

```
输入：原始文档
输出：
  ├── 知识图谱（实体 + 关系）
  ├── 社区划分结果
  ├── 各层级社区摘要
  └── 实体/关系的向量嵌入
```

**检索层（Retrieval Layer）**：在线执行，响应用户查询

```
输入：用户问题
输出：
  ├── Local Search：从图中找到相关实体及其邻居，返回局部子图上下文
  └── Global Search：检索相关社区摘要，返回全局聚合上下文
```

两层分离的设计使得索引成本只需支付一次，查询时的延迟可以控制在可接受范围内。

---

## 三、Graph RAG 的完整流程

Graph RAG 的完整流程分为两大阶段：**离线索引**和**在线检索生成**。

```
┌─────────────────────────────────────────────────────────┐
│                    离线索引阶段                           │
│                                                         │
│  原始文档 → 文档解析 → 实体抽取 → 关系抽取 → 图构建      │
│                                    ↓                    │
│                             社区检测 → 社区摘要生成       │
│                                    ↓                    │
│                          向量嵌入（实体+关系+摘要）        │
└─────────────────────────────────────────────────────────┘
                              ↓ 持久化
┌─────────────────────────────────────────────────────────┐
│                    在线检索生成阶段                        │
│                                                         │
│  用户提问 → 问题分析 → Local/Global Search 路由           │
│                              ↓                          │
│                       上下文组装 → LLM 生成答案           │
└─────────────────────────────────────────────────────────┘
```

### 3.1 索引阶段：文档解析

**目标**：把各种格式的原始文档转换为干净的文本，并切分成适合处理的单元。

```python
# 示例：使用 LlamaIndex 解析文档
from llama_index.core import SimpleDirectoryReader

documents = SimpleDirectoryReader("./docs").load_data()

# 切分策略：Graph RAG 的 chunk 不宜太小
# 传统 RAG：256-512 tokens/chunk（追求精准匹配）
# Graph RAG：512-1024 tokens/chunk（保留更多上下文供实体抽取）
```

**注意事项：**
- chunk 大小影响实体抽取质量：太小会截断实体关系的上下文，太大会增加 LLM 抽取的 token 消耗
- 推荐在 chunk 之间保留一定重叠（overlap），避免跨 chunk 的关系被截断
- 表格、图片等非文本内容需要特殊处理（OCR、表格解析）

### 3.2 索引阶段：实体与关系抽取

这是整个 Graph RAG 流程中**成本最高、质量最关键**的步骤。

**基于 LLM 的抽取（主流方案）：**

```python
# 微软 GraphRAG 的抽取 Prompt 核心逻辑（简化版）
ENTITY_EXTRACTION_PROMPT = """
从以下文本中抽取所有实体和关系。

实体类型：PERSON, ORGANIZATION, LOCATION, EVENT, CONCEPT
关系格式：(实体1) -[关系描述]-> (实体2)

文本：
{text}

输出格式（JSON）：
{
  "entities": [
    {"name": "张三", "type": "PERSON", "description": "技术部工程师"},
    ...
  ],
  "relations": [
    {"source": "张三", "target": "项目A", "relation": "负责", "description": "张三是项目A的负责人"},
    ...
  ]
}
"""
```

**抽取质量的关键因素：**

1. **实体类型定义**：类型越精确，后续图查询越准确。建议根据领域定制类型（如医疗领域：Disease, Drug, Symptom, Gene）
2. **关系描述的粒度**：关系不只是一个词，最好包含完整描述，方便后续向量检索
3. **共指消解（Coreference Resolution）**：同一实体在不同文档中可能有不同称呼（"张三"、"张总"、"张工"），需要合并

```python
# 实体合并示例（基于向量相似度）
def merge_entities(entities: list[Entity], threshold: float = 0.92) -> list[Entity]:
    """
    对名称相似的实体进行合并，避免图中出现重复节点
    """
    embeddings = embed_model.encode([e.name for e in entities])
    # 计算余弦相似度矩阵，合并超过阈值的实体
    ...
```

### 3.3 索引阶段：图构建

将抽取出的实体和关系写入图数据库：

```python
# 使用 Neo4j 构建图（Python Driver）
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def build_graph(entities, relations):
    with driver.session() as session:
        # 创建实体节点（MERGE 避免重复）
        for entity in entities:
            session.run(
                """
                MERGE (e:Entity {name: $name})
                SET e.type = $type,
                    e.description = $description,
                    e.source_doc = $source_doc
                """,
                name=entity.name,
                type=entity.type,
                description=entity.description,
                source_doc=entity.source_doc
            )

        # 创建关系边
        for rel in relations:
            session.run(
                """
                MATCH (a:Entity {name: $source})
                MATCH (b:Entity {name: $target})
                MERGE (a)-[r:RELATES_TO {relation: $relation}]->(b)
                SET r.description = $description
                """,
                source=rel.source,
                target=rel.target,
                relation=rel.relation,
                description=rel.description
            )
```

### 3.4 索引阶段：社区检测

使用图算法将节点划分为社区。微软 GraphRAG 使用 **Leiden 算法**（Louvain 的改进版）：

```python
# 使用 graspologic 库执行 Leiden 社区检测
import graspologic.partition as partition
import networkx as nx

# 将 Neo4j 图导出为 NetworkX 格式
G = nx.from_neo4j(driver)

# 执行 Leiden 算法
community_map = partition.leiden(G)
# 返回：{node_id: community_id}

# 按层级划分（resolution 参数控制粒度）
communities_level1 = partition.leiden(G, resolution=1.0)   # 细粒度
communities_level2 = partition.leiden(G, resolution=0.5)   # 粗粒度
```

### 3.5 索引阶段：社区摘要生成

对每个社区，收集其包含的所有实体和关系，调用 LLM 生成摘要：

```python
COMMUNITY_SUMMARY_PROMPT = """
以下是一个知识社区中的实体和关系列表，请生成一段简洁的摘要，
描述该社区的核心主题、关键实体及其相互关系。

实体列表：
{entities}

关系列表：
{relations}

要求：
- 摘要长度：200-400 字
- 突出最重要的实体和关系
- 使用客观、信息密集的语言
"""

async def generate_community_summaries(communities: dict) -> dict:
    summaries = {}
    for community_id, nodes in communities.items():
        entities = get_entities_in_community(nodes)
        relations = get_relations_in_community(nodes)
        
        summary = await llm.complete(
            COMMUNITY_SUMMARY_PROMPT.format(
                entities=format_entities(entities),
                relations=format_relations(relations)
            )
        )
        summaries[community_id] = summary.text
    return summaries
```

**成本提示**：社区摘要生成是索引阶段 token 消耗最大的步骤。对于大型语料库，建议：
- 只对 Level 1、Level 2 社区生成摘要，Level 0（单节点）跳过
- 使用较便宜的模型（如 GPT-4o-mini）生成摘要，用更强的模型做最终回答

### 3.6 检索阶段：Local Search（局部检索）

适用于**具体、精确的问题**，如"张三负责哪些项目"、"项目A的当前状态是什么"。

```
流程：
1. 用户问题 → 向量化
2. 在实体向量库中找到最相关的 Top-K 实体
3. 从图中提取这些实体的 N 跳邻居（通常 1-2 跳）
4. 收集：实体描述 + 关系描述 + 相关社区摘要 + 原始文本片段
5. 组装上下文 → LLM 生成答案
```

```python
def local_search(query: str, top_k: int = 5, hops: int = 2) -> str:
    # Step 1: 找到最相关的实体
    query_embedding = embed_model.encode(query)
    top_entities = vector_store.search(query_embedding, top_k=top_k)
    
    # Step 2: 图遍历，获取邻居
    subgraph = []
    for entity in top_entities:
        neighbors = graph_db.get_neighbors(entity.id, hops=hops)
        subgraph.extend(neighbors)
    
    # Step 3: 组装上下文
    context = build_context(top_entities, subgraph)
    
    # Step 4: LLM 生成
    return llm.complete(f"基于以下信息回答问题：\n{context}\n\n问题：{query}")
```

### 3.7 检索阶段：Global Search（全局检索）

适用于**全局性、综合性的问题**，如"这批文档的主要主题是什么"、"哪些风险因素被反复提及"。

```
流程：
1. 用户问题 → 向量化
2. 在社区摘要向量库中检索相关社区（跨所有层级）
3. 对每个相关社区摘要，让 LLM 生成局部答案（Map 阶段）
4. 汇总所有局部答案，让 LLM 生成最终答案（Reduce 阶段）
```

```python
async def global_search(query: str) -> str:
    # Step 1: 检索相关社区摘要
    relevant_summaries = community_vector_store.search(query, top_k=20)
    
    # Step 2: Map 阶段 - 并行处理每个社区摘要
    partial_answers = await asyncio.gather(*[
        llm.complete(f"基于以下社区摘要，回答问题（如无相关信息请说明）：\n{summary}\n\n问题：{query}")
        for summary in relevant_summaries
    ])
    
    # Step 3: Reduce 阶段 - 汇总生成最终答案
    combined = "\n\n".join([a for a in partial_answers if "无相关信息" not in a])
    final_answer = await llm.complete(
        f"综合以下多个来源的信息，给出完整、准确的回答：\n{combined}\n\n问题：{query}"
    )
    return final_answer
```

### 3.8 路由策略：如何选择 Local vs Global

实际工程中，通常需要一个路由层来判断使用哪种检索策略：

```python
ROUTING_PROMPT = """
判断以下问题属于哪种类型：
- LOCAL：问题针对具体实体、事实或关系（如"谁负责X"、"X的状态是什么"）
- GLOBAL：问题需要跨文档综合分析（如"主要趋势是什么"、"有哪些共同点"）
- HYBRID：两者都需要

问题：{query}
输出：LOCAL / GLOBAL / HYBRID
"""

def route_query(query: str) -> str:
    result = llm.complete(ROUTING_PROMPT.format(query=query))
    return result.text.strip()
```

也可以直接默认使用 HYBRID 策略：先做 Local Search 获取精确事实，再做 Global Search 补充全局视角，最后合并两路结果。

### 3.9 存储架构：Chunks 与实体如何持久化

Graph RAG 索引完成后，需要持久化的数据分为四类，每类都有**结构化查询**和**语义检索**两个维度的存储需求：

```
原始文档
    ↓ 切分
Chunks（文本块）          → 文档存储（原文） + 向量数据库（语义检索）
    ↓ LLM 抽取
实体（Entities）          → 图数据库（结构遍历） + 向量数据库（种子检索）
关系（Relations）         → 图数据库（结构遍历） + 向量数据库（关系检索）
    ↓ 社区检测
社区摘要（Summaries）     → KV 存储（快速读取） + 向量数据库（Global Search）
```

**Chunk 的存储结构：**

```python
# 文档存储中的 Chunk 记录
{
    "chunk_id": "doc001_chunk_003",
    "text": "张三是技术部的高级工程师，自2021年起负责项目A的架构设计...",
    "metadata": {
        "source_doc": "team_intro.pdf",
        "page": 2,
        "chunk_index": 3,
        "token_count": 512,
    },
    # 双向关联：记录该 chunk 包含哪些实体
    "entity_ids": ["entity_001", "entity_008"],
    "relationship_ids": ["rel_023"]
}
```

**实体的存储结构：**

```python
# 图数据库（Neo4j）中的实体节点
{
    "id": "entity_001",
    "name": "张三",
    "type": "PERSON",
    "description": "技术部高级工程师，负责项目A架构设计，2021年加入",
    "community_id": "community_12",
    "degree": 5,                  # 连接的边数，用于检索排序
    # 双向关联：记录该实体出现在哪些 chunk 里
    "text_unit_ids": ["doc001_chunk_003", "doc002_chunk_007"]
}

# 向量数据库中的实体向量（用 description 字段做嵌入）
{
    "id": "entity_001",
    "vector": embed("张三 技术部高级工程师 负责项目A架构设计"),
    "payload": {"name": "张三", "type": "PERSON", "community_id": "community_12"}
}
```

**Chunk 与实体的双向关联**是 Graph RAG 能做到"答案可溯源"的基础：

```
Chunk ──→ entity_ids      ：这个 chunk 包含哪些实体
Entity ──→ text_unit_ids  ：这个实体出现在哪些 chunk 里
```

有了双向映射，Local Search 的完整数据流就是：

```
用户问题
  ↓ 向量检索（entity 向量库）
找到相关种子实体
  ↓ 图遍历（Neo4j）
找到邻居实体 + 关系
  ↓ text_unit_ids 回溯
找到原始 Chunk 文本
  ↓ 组装上下文
实体描述 + 关系描述 + 原始 Chunk → LLM 生成答案
```

**微软 GraphRAG 的默认存储方案（Parquet 文件）：**

微软 GraphRAG 的离线实现不依赖任何数据库，全部用 Parquet 文件存储：

```
output/artifacts/
├── create_base_text_units.parquet          # Chunks（含 entity_ids）
├── create_base_extracted_entities.parquet  # 原始抽取实体（未去重）
├── create_summarized_entities.parquet      # 去重合并后的实体
├── create_final_entities.parquet           # 最终实体（含向量 + text_unit_ids）
├── create_final_relationships.parquet      # 最终关系（含向量 + text_unit_ids）
├── create_final_communities.parquet        # 社区划分结果
└── create_final_community_reports.parquet  # 社区摘要（含向量）
```

```python
import pandas as pd

# 查看 Chunks 及其关联的实体
chunks = pd.read_parquet("output/artifacts/create_base_text_units.parquet")
# 列：['id', 'text', 'n_tokens', 'document_ids', 'entity_ids', 'relationship_ids']

# 查看实体及其关联的 Chunks
entities = pd.read_parquet("output/artifacts/create_final_entities.parquet")
# 列：['id', 'name', 'type', 'description', 'text_unit_ids', 'community', 'degree']

# 查看关系及其来源 Chunks
rels = pd.read_parquet("output/artifacts/create_final_relationships.parquet")
# 列：['id', 'source', 'target', 'description', 'weight', 'text_unit_ids']
```

**生产环境推荐的存储架构：**

Parquet 文件适合离线分析，生产环境需要替换为真正的数据库：

```
Chunks      ──→ PostgreSQL（原文 + 元数据）
                Qdrant collection: "chunks"（向量）

Entities    ──→ Neo4j（图结构 + 属性）
                Qdrant collection: "entities"（向量）

Relations   ──→ Neo4j（图结构 + 属性）
                Qdrant collection: "relations"（向量）

Summaries   ──→ Redis（KV，快速读取）
                Qdrant collection: "summaries"（向量）

Entity-Chunk
  Mapping   ──→ Redis（倒排索引，entity_id → chunk_ids）
```

向量数据库用同一个 Qdrant 实例，通过不同 Collection 区分数据类型，查询时按需选择目标 Collection：

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)

# Local Search：在 entities collection 中找种子实体
entity_hits = client.search(
    collection_name="entities",
    query_vector=query_embedding,
    limit=5
)

# Global Search：在 summaries collection 中找相关社区
summary_hits = client.search(
    collection_name="summaries",
    query_vector=query_embedding,
    limit=20
)
```

---

## 四、关键技术细节

### 4.1 实体与关系抽取：LLM vs 传统 NER

**传统 NER（命名实体识别）方案：**

使用 spaCy、BERT-NER 等模型，速度快、成本低，但只能识别预定义类型（人名、地名、机构名），无法抽取关系，也无法理解领域特定实体。

```python
import spacy
nlp = spacy.load("zh_core_web_sm")

doc = nlp("张三负责项目A，该项目属于技术部。")
for ent in doc.ents:
    print(ent.text, ent.label_)
# 输出：张三 PERSON, 项目A ORG, 技术部 ORG
# 问题：无法抽取"负责"、"属于"这样的关系
```

**基于 LLM 的抽取方案：**

质量高、灵活性强，可以抽取任意类型的实体和关系，但成本高、速度慢。

```python
# 使用结构化输出（Structured Output）提高抽取稳定性
from pydantic import BaseModel
from openai import OpenAI

class Entity(BaseModel):
    name: str
    type: str
    description: str

class Relation(BaseModel):
    source: str
    target: str
    relation: str
    description: str

class ExtractionResult(BaseModel):
    entities: list[Entity]
    relations: list[Relation]

client = OpenAI()

def extract_graph(text: str) -> ExtractionResult:
    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "从文本中抽取实体和关系，输出结构化数据。"},
            {"role": "user", "content": text}
        ],
        response_format=ExtractionResult,
    )
    return response.choices[0].message.parsed
```

**混合方案（推荐）：**

先用 NER 快速识别实体，再用 LLM 补充关系抽取和实体描述。在成本和质量之间取得平衡。

```
NER 识别实体（快、便宜）
    ↓
LLM 抽取实体间关系（只处理已识别实体，减少 token）
    ↓
LLM 为每个实体生成描述（批量处理，降低成本）
```

### 4.2 图嵌入（Graph Embedding）

图嵌入的目标是将图中的节点（和边）映射到低维向量空间，使得图结构上相近的节点在向量空间中也相近。

**为什么 Graph RAG 需要图嵌入？**

仅靠实体名称的文本向量无法捕捉图结构信息。两个实体可能名称相似但在图中毫无关联，也可能名称不同但在图中紧密相连。

**常用图嵌入方法：**

**Node2Vec**：通过随机游走生成节点序列，再用 Word2Vec 训练嵌入。

```python
from node2vec import Node2Vec
import networkx as nx

G = nx.read_edgelist("graph.edgelist")

# 训练 Node2Vec
node2vec = Node2Vec(
    G,
    dimensions=128,    # 嵌入维度
    walk_length=30,    # 随机游走长度
    num_walks=200,     # 每个节点的游走次数
    p=1,               # 返回参数（控制 BFS vs DFS 倾向）
    q=0.5,             # 进出参数
    workers=4
)
model = node2vec.fit(window=10, min_count=1)

# 获取节点嵌入
embedding = model.wv["张三"]  # shape: (128,)
```

**GraphSAGE**：通过聚合邻居节点特征来生成嵌入，支持归纳学习（可处理新节点）。

```python
# 使用 PyTorch Geometric
from torch_geometric.nn import SAGEConv
import torch.nn.functional as F

class GraphSAGE(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return x
```

**实践建议**：在 Graph RAG 工程中，通常不需要专门训练图嵌入模型。直接用实体的**文本描述**做向量嵌入（text embedding）已经足够好，因为 LLM 生成的实体描述本身就包含了丰富的语义信息。图嵌入更适合图结构本身携带大量信息、文本描述较少的场景。

### 4.3 Leiden 社区检测算法

Leiden 算法是 Louvain 算法的改进版，解决了 Louvain 可能产生"内部不连通社区"的问题。

**核心思想：**

最大化模块度（Modularity）Q，衡量社区内部连接密度与随机期望的差异：

```
Q = (1/2m) * Σ[A_ij - k_i*k_j/(2m)] * δ(c_i, c_j)

其中：
- A_ij：节点 i 和 j 之间的边权重
- k_i：节点 i 的度
- m：总边数
- δ(c_i, c_j)：i 和 j 在同一社区时为 1，否则为 0
```

**算法步骤：**

```
1. 初始化：每个节点自成一个社区
2. 局部移动阶段：贪心地将节点移动到能最大化模块度增益的邻居社区
3. 细化阶段（Leiden 特有）：在每个社区内部进一步细化，确保社区内部连通
4. 聚合阶段：将每个社区压缩为单个节点，重复上述步骤
5. 直到模块度不再提升为止
```

**resolution 参数的影响：**

```python
# resolution 越大 → 社区越小、越多（细粒度）
# resolution 越小 → 社区越大、越少（粗粒度）

# 实践建议：
# - 对于 Graph RAG，通常需要多个 resolution 层级
# - Level 1: resolution=1.0（默认，适合局部检索）
# - Level 2: resolution=0.5（适合中等粒度问题）
# - Level 3: resolution=0.1（适合全局问题）
```

### 4.4 混合检索：向量检索 + 图遍历的融合

单纯的向量检索和单纯的图遍历各有局限，融合两者才能发挥最大效果。

**融合策略一：先向量后图（Vector-first）**

```python
def hybrid_search_v1(query: str) -> list[Node]:
    # 1. 向量检索找到种子节点
    seed_nodes = vector_store.search(query, top_k=5)
    
    # 2. 从种子节点出发做图遍历
    expanded_nodes = []
    for node in seed_nodes:
        neighbors = graph.get_neighbors(node.id, hops=2)
        expanded_nodes.extend(neighbors)
    
    # 3. 对扩展后的节点重新排序（用向量相似度）
    return rerank_by_similarity(query, expanded_nodes)
```

**融合策略二：向量 + 图并行，结果融合（Parallel）**

```python
def hybrid_search_v2(query: str) -> list[Node]:
    # 并行执行两路检索
    vector_results = vector_store.search(query, top_k=10)
    
    # 提取查询中的实体，做图查询
    entities_in_query = extract_entities(query)
    graph_results = graph.query_by_entities(entities_in_query, hops=2)
    
    # 融合：RRF（Reciprocal Rank Fusion）
    return reciprocal_rank_fusion(vector_results, graph_results)

def reciprocal_rank_fusion(list1, list2, k=60):
    """RRF 融合算法：综合两个排序列表的结果"""
    scores = {}
    for rank, item in enumerate(list1):
        scores[item.id] = scores.get(item.id, 0) + 1 / (k + rank + 1)
    for rank, item in enumerate(list2):
        scores[item.id] = scores.get(item.id, 0) + 1 / (k + rank + 1)
    return sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
```

**融合策略三：图引导的向量检索（Graph-guided）**

```python
def hybrid_search_v3(query: str) -> list[Node]:
    # 1. 先做图查询，找到结构上相关的节点
    entities_in_query = extract_entities(query)
    structural_candidates = graph.get_subgraph(entities_in_query, hops=3)
    
    # 2. 只在候选节点范围内做向量检索（缩小搜索空间）
    candidate_ids = [n.id for n in structural_candidates]
    return vector_store.search(
        query,
        top_k=10,
        filter={"id": {"$in": candidate_ids}}  # 限定范围
    )
```

策略三在候选集质量高时效果最好，同时大幅降低向量检索的计算量。

---

## 五、与传统 RAG 的深度对比

### 5.1 架构对比

```
传统 RAG 架构：
文档 → Chunker → Embedder → VectorDB
                                ↓
查询 → Embedder → 相似度检索 → Top-K Chunks → LLM → 答案

Graph RAG 架构：
文档 → Chunker → LLM Extractor → GraphDB + VectorDB + CommunityDB
                                              ↓
查询 → 路由 → Local Search（图遍历+向量）  ─┐
           → Global Search（社区摘要+MapReduce）─┤→ LLM → 答案
```

### 5.2 能力对比矩阵

| 能力维度 | 传统 RAG | Graph RAG | 说明 |
|---------|---------|-----------|------|
| 精确事实查询 | ★★★★ | ★★★★★ | Graph RAG 通过实体定位更精准 |
| 多跳推理 | ★★ | ★★★★★ | 图遍历天然支持多跳 |
| 全局综合问题 | ★★ | ★★★★★ | 社区摘要的核心优势 |
| 关系型查询 | ★ | ★★★★★ | 图结构直接支持 |
| 简单文档问答 | ★★★★★ | ★★★★ | 传统 RAG 更轻量 |
| 索引构建速度 | ★★★★★ | ★★ | Graph RAG 索引成本高 |
| 查询延迟 | ★★★★ | ★★★ | Global Search 的 MapReduce 较慢 |
| 工程复杂度 | ★★★★★ | ★★ | Graph RAG 依赖更多组件 |
| 增量更新 | ★★★★ | ★★ | 图的增量更新较复杂 |
| Token 成本 | ★★★★ | ★★ | 索引阶段 LLM 抽取成本高 |

### 5.3 检索质量对比（基于微软论文数据）

微软 GraphRAG 论文（2024）在 Podcast 转录和新闻文章两个数据集上的评测结果：

**全局性问题（Global Sensemaking Questions）：**

```
问题示例："这批播客内容中，嘉宾们最关注的社会议题是什么？"

评测维度        传统 RAG    Graph RAG（C2）   提升
──────────────────────────────────────────────
全面性           32%          72%           +40%
多样性           28%          62%           +34%
赋权性           25%          65%           +40%
直接性           72%          68%            -4%（略有下降）
```

**局部性问题（Local Questions）：**

```
问题示例："John Smith 在哪家公司工作？"

传统 RAG 和 Graph RAG 在局部问题上表现相当，
Graph RAG 略有优势（因为实体定位更精准）
```

**结论**：Graph RAG 在全局问题上有压倒性优势，在局部问题上与传统 RAG 相当或略优。

### 5.4 成本对比

这是工程决策中最关键的因素之一。

**索引成本（一次性）：**

```
假设：100 个文档，每个文档 2000 tokens，使用 GPT-4o-mini

传统 RAG 索引：
  - 向量嵌入：100 * 2000 = 200K tokens（嵌入模型，极便宜）
  - 总成本：约 $0.02

Graph RAG 索引：
  - 实体抽取：100 * 2000 * 1.5（prompt overhead）= 300K tokens
  - 社区摘要：假设 50 个社区，每个摘要 500 tokens = 25K tokens
  - 总 LLM 调用：约 325K tokens（GPT-4o-mini）
  - 总成本：约 $0.05 ~ $0.20（取决于模型选择）

结论：Graph RAG 索引成本约为传统 RAG 的 10-100 倍
```

**查询成本（每次）：**

```
传统 RAG 查询：
  - 向量检索：极快，几乎无成本
  - LLM 生成：1 次调用，约 2K tokens
  - 延迟：< 2s

Graph RAG Local Search：
  - 向量检索 + 图遍历：稍慢
  - LLM 生成：1 次调用，约 3-5K tokens（上下文更丰富）
  - 延迟：2-5s

Graph RAG Global Search：
  - 社区摘要检索 + MapReduce
  - LLM 调用：N+1 次（N 个社区各一次 Map + 1 次 Reduce）
  - 延迟：10-30s（取决于社区数量和并发度）
```

### 5.5 适用场景决策树

```
你的问题类型是什么？
│
├── 主要是简单的事实查询（"X 是什么"、"Y 在哪里"）
│   └── → 传统 RAG 足够，成本更低
│
├── 需要跨文档的关系推理（"A 和 B 有什么关联"）
│   └── → Graph RAG（Local Search）
│
├── 需要全局综合分析（"整体趋势是什么"、"主要主题有哪些"）
│   └── → Graph RAG（Global Search）
│
├── 两种问题都有
│   └── → Graph RAG（Hybrid Search）
│
└── 文档量极大（>10万文档），更新频繁
    └── → 考虑轻量化 Graph RAG 或分层方案
```

### 5.6 何时不应该用 Graph RAG

以下场景建议坚持使用传统 RAG：

1. **文档量少、更新频繁**：索引成本高，频繁重建得不偿失
2. **问题类型单一且简单**：传统 RAG 已经够用，引入图只增加复杂度
3. **实时性要求极高**：Global Search 的延迟难以满足 < 1s 的要求
4. **预算有限**：Graph RAG 的索引 token 消耗是传统 RAG 的数十倍
5. **非结构化程度极高**：如纯粹的创意写作、情感分析，实体关系不是核心

---

## 六、主流实现与工具生态

### 6.1 微软 GraphRAG（开源框架）

**GitHub**：[microsoft/graphrag](https://github.com/microsoft/graphrag)

微软官方开源实现，论文的工程化版本，是目前最完整的 Graph RAG 参考实现。

**快速上手：**

```bash
pip install graphrag

# 初始化项目
mkdir my-graphrag && cd my-graphrag
python -m graphrag.index --init --root .

# 配置（编辑 .env 和 settings.yaml）
echo "GRAPHRAG_API_KEY=your-openai-key" > .env

# 放入文档
mkdir input && cp your-docs/*.txt input/

# 执行索引（耗时较长，会消耗大量 token）
python -m graphrag.index --root .

# 执行查询
python -m graphrag.query --root . --method global "这批文档的主要主题是什么？"
python -m graphrag.query --root . --method local "张三负责哪些项目？"
```

**settings.yaml 关键配置：**

```yaml
llm:
  api_key: ${GRAPHRAG_API_KEY}
  type: openai_chat
  model: gpt-4o-mini          # 索引用便宜模型
  max_tokens: 4000

embeddings:
  llm:
    model: text-embedding-3-small

chunks:
  size: 1200                   # chunk 大小（tokens）
  overlap: 100                 # 重叠量

entity_extraction:
  max_gleanings: 1             # 抽取轮数（越多越全，越贵）

community_reports:
  max_length: 2000             # 社区摘要最大长度
```

**优点**：功能完整，论文级实现，社区活跃。
**缺点**：索引成本高，配置复杂，对 OpenAI API 依赖较深（需要适配才能用其他模型）。

### 6.2 LlamaIndex Property Graph

**文档**：[LlamaIndex Property Graph](https://docs.llamaindex.ai/en/stable/module_guides/indexing/lpg_index_guide/)

LlamaIndex 的 Graph RAG 实现，与其生态深度集成，支持多种图数据库后端。

**快速上手：**

```python
from llama_index.core import PropertyGraphIndex, SimpleDirectoryReader
from llama_index.core.indices.property_graph import (
    ImplicitPathExtractor,
    SimpleLLMPathExtractor,
)
from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore

# 加载文档
documents = SimpleDirectoryReader("./docs").load_data()

# 配置图存储（支持 Neo4j、Nebula、本地内存等）
graph_store = Neo4jPropertyGraphStore(
    username="neo4j",
    password="password",
    url="bolt://localhost:7687",
)

# 构建索引
index = PropertyGraphIndex.from_documents(
    documents,
    property_graph_store=graph_store,
    kg_extractors=[
        ImplicitPathExtractor(),          # 基于规则的快速抽取
        SimpleLLMPathExtractor(           # 基于 LLM 的高质量抽取
            num_workers=4,
            max_paths_per_chunk=10,
        ),
    ],
    show_progress=True,
)

# 查询
query_engine = index.as_query_engine(
    include_text=True,
    response_mode="tree_summarize",
)
response = query_engine.query("张三和项目A有什么关系？")
print(response)
```

**优点**：与 LlamaIndex 生态无缝集成，支持多种图数据库，灵活性高。
**缺点**：没有内置社区摘要机制，全局问题能力弱于微软 GraphRAG。

### 6.3 LangChain + Neo4j 方案

适合已经在使用 LangChain 的团队，通过 `langchain-community` 的 Neo4j 集成实现。

```python
from langchain_community.graphs import Neo4jGraph
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings

# 初始化
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")

# 文档转图
llm_transformer = LLMGraphTransformer(llm=llm)
from langchain_core.documents import Document

docs = [Document(page_content="张三是技术部的工程师，负责项目A。项目A使用Python开发。")]
graph_documents = llm_transformer.convert_to_graph_documents(docs)
graph.add_graph_documents(graph_documents, baseEntityLabel=True, include_source=True)

# 创建向量索引（用于混合检索）
vector_index = Neo4jVector.from_existing_graph(
    OpenAIEmbeddings(),
    search_type="hybrid",
    node_label="Document",
    text_node_properties=["text"],
    embedding_node_property="embedding"
)

# 构建检索链
from langchain.chains import GraphCypherQAChain

chain = GraphCypherQAChain.from_llm(
    llm,
    graph=graph,
    verbose=True,
    allow_dangerous_requests=True
)

result = chain.invoke({"query": "张三负责哪些项目？"})
print(result["result"])
```

**优点**：LangChain 生态完整，Neo4j 是成熟的图数据库，Cypher 查询能力强。
**缺点**：GraphCypherQAChain 依赖 LLM 生成 Cypher 查询，稳定性不如向量检索。

### 6.4 各方案对比

| 维度 | 微软 GraphRAG | LlamaIndex PG | LangChain+Neo4j |
|------|-------------|--------------|----------------|
| 社区摘要 | ✅ 完整支持 | ❌ 需自行实现 | ❌ 需自行实现 |
| 全局问题能力 | ★★★★★ | ★★★ | ★★★ |
| 局部问题能力 | ★★★★ | ★★★★ | ★★★★ |
| 图数据库支持 | 内置（Parquet） | Neo4j/Nebula/内存 | Neo4j |
| 与现有框架集成 | 独立 | LlamaIndex | LangChain |
| 配置复杂度 | 高 | 中 | 中 |
| 生产就绪度 | 中（仍在快速迭代） | 高 | 高 |
| 适合场景 | 全局分析为主 | 通用 | 已有 LangChain 项目 |

### 6.5 图数据库选型

| 数据库 | 类型 | 适用场景 | 备注 |
|--------|------|---------|------|
| Neo4j | 属性图 | 生产环境首选 | 成熟、Cypher 查询强大、有云服务 |
| Nebula Graph | 分布式图 | 超大规模图（亿级节点） | 国内字节跳动开源 |
| Amazon Neptune | 托管图数据库 | AWS 生态 | 支持 Gremlin 和 SPARQL |
| TigerGraph | 原生并行图 | 实时图分析 | 商业产品 |
| NetworkX | 内存图 | 原型验证、小规模 | Python 库，不适合生产 |
| LlamaIndex 内置 | 内存图 | 快速原型 | 重启后数据丢失 |

---

## 七、工程落地挑战

### 7.1 挑战一：图的构建质量

图的质量直接决定检索效果，而图的质量问题主要来自三个方面：

**问题一：实体歧义（Entity Ambiguity）**

同一实体有多种表述，导致图中出现重复节点：

```
"张三" / "张工" / "张总" / "小张" → 应该是同一个节点
"苹果公司" / "Apple" / "Apple Inc." → 应该是同一个节点
```

**解决方案：**

```python
class EntityResolver:
    def __init__(self, similarity_threshold: float = 0.90):
        self.threshold = similarity_threshold
        self.embed_model = OpenAIEmbeddings()
    
    def resolve(self, entities: list[str]) -> dict[str, str]:
        """返回 {原始名称: 规范名称} 的映射"""
        embeddings = self.embed_model.embed_documents(entities)
        
        # 构建相似度矩阵
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        sim_matrix = cosine_similarity(embeddings)
        
        # Union-Find 合并相似实体
        parent = {e: e for e in entities}
        
        for i in range(len(entities)):
            for j in range(i + 1, len(entities)):
                if sim_matrix[i][j] > self.threshold:
                    # 合并，选择较短的名称作为规范名
                    canonical = min(entities[i], entities[j], key=len)
                    parent[entities[i]] = canonical
                    parent[entities[j]] = canonical
        
        return parent
```

**问题二：关系噪声（Relation Noise）**

LLM 可能抽取出错误的或无意义的关系：

```
错误示例：
<张三, 是, 工程师>  ← "是"不是有意义的关系
<项目A, 有, 代码>   ← 过于泛化
<张三, 提到了, 项目A> ← 来自叙述性文本，不是真实关系
```

**解决方案：**

1. 在 Prompt 中明确定义允许的关系类型（白名单）
2. 对抽取结果做后处理过滤（过滤掉置信度低的关系）
3. 人工审核高频关系类型，建立领域关系词典

**问题三：图的稀疏性**

某些实体只在少数文档中出现，关系很少，形成孤立节点，对检索贡献有限。

**解决方案**：对孤立节点（度 < 2）做特殊处理，可以降低其在检索中的权重，或者通过推理补充隐含关系。

### 7.2 挑战二：图的增量更新

这是 Graph RAG 工程落地中最棘手的问题之一。

**问题场景：**

```
已有图：包含 1000 个文档的知识图谱
新增：10 个新文档
需要：将新文档的实体和关系合并到现有图中
```

**难点：**

1. **新实体可能与旧实体重复**：需要重新做实体消歧
2. **新关系可能影响社区划分**：社区结构可能需要重新计算
3. **社区摘要需要更新**：受影响的社区摘要需要重新生成

**增量更新策略：**

```python
class IncrementalGraphUpdater:
    
    def update(self, new_documents: list[Document]):
        # Step 1: 抽取新文档的实体和关系
        new_entities, new_relations = self.extract(new_documents)
        
        # Step 2: 实体消歧（与现有实体对比）
        existing_entities = self.graph.get_all_entities()
        merged_entities = self.resolve_entities(new_entities, existing_entities)
        
        # Step 3: 写入图（只写新增部分）
        self.graph.add_entities(merged_entities)
        self.graph.add_relations(new_relations)
        
        # Step 4: 识别受影响的社区（只重新计算变化区域）
        affected_nodes = self.get_affected_nodes(merged_entities, new_relations)
        affected_communities = self.get_communities_containing(affected_nodes)
        
        # Step 5: 只重新生成受影响社区的摘要
        for community_id in affected_communities:
            new_summary = self.generate_summary(community_id)
            self.community_store.update(community_id, new_summary)
        
        # Step 6: 更新向量索引
        self.vector_store.add(merged_entities + new_relations)
```

**实践建议**：对于更新频繁的场景，可以采用"批量更新"策略——积累一定量的新文档后统一重建，而不是每次都做增量更新。重建的触发条件可以是：新文档数量超过现有文档的 10%，或者每周定时重建。

### 7.3 挑战三：成本控制

**索引成本优化：**

```python
# 策略一：分层抽取
# 先用 NER 快速识别实体，只对有实体的 chunk 调用 LLM 抽取关系
def cost_efficient_extract(chunks: list[str]) -> list[GraphDocument]:
    results = []
    for chunk in chunks:
        # 快速 NER 过滤
        entities = ner_model(chunk)
        if len(entities) < 2:
            continue  # 少于 2 个实体，跳过关系抽取
        
        # 只对有实体的 chunk 调用 LLM
        graph_doc = llm_extractor(chunk, hint_entities=entities)
        results.append(graph_doc)
    return results

# 策略二：批量调用（减少 API 请求次数）
async def batch_extract(chunks: list[str], batch_size: int = 10):
    batches = [chunks[i:i+batch_size] for i in range(0, len(chunks), batch_size)]
    results = await asyncio.gather(*[extract_batch(batch) for batch in batches])
    return [item for sublist in results for item in sublist]

# 策略三：缓存（避免重复抽取相同内容）
import hashlib
from functools import lru_cache

@lru_cache(maxsize=10000)
def cached_extract(chunk_hash: str, chunk_text: str):
    return llm_extractor(chunk_text)

def extract_with_cache(chunk: str):
    chunk_hash = hashlib.md5(chunk.encode()).hexdigest()
    return cached_extract(chunk_hash, chunk)
```

**查询成本优化：**

```python
# Global Search 成本优化：限制参与 MapReduce 的社区数量
def optimized_global_search(query: str, max_communities: int = 10) -> str:
    # 先用向量检索筛选最相关的社区（而不是所有社区都参与）
    relevant_summaries = community_vector_store.search(
        query,
        top_k=max_communities  # 限制数量
    )
    
    # 只对相关性分数超过阈值的社区做 Map
    high_quality_summaries = [
        s for s in relevant_summaries
        if s.score > 0.7  # 相关性阈值
    ]
    
    # 后续 MapReduce 流程...
```

### 7.4 挑战四：评估体系

如何衡量 Graph RAG 的效果？这是工程落地中经常被忽视但至关重要的问题。

**评估维度：**

```
1. 检索质量
   - 实体召回率：问题涉及的实体是否被正确检索到
   - 关系准确率：检索到的关系是否正确
   - 上下文相关性：提供给 LLM 的上下文是否与问题相关

2. 生成质量
   - 答案准确性：答案是否与事实一致
   - 答案完整性：是否覆盖了问题的所有方面
   - 答案可溯源性：答案是否可以追溯到原始文档

3. 系统性能
   - 索引时间
   - 查询延迟（P50/P95/P99）
   - Token 消耗
```

**自动化评估框架（使用 RAGAS）：**

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision,
)
from datasets import Dataset

# 准备评估数据集
eval_data = {
    "question": ["张三负责哪些项目？", "项目A的技术栈是什么？"],
    "answer": [graph_rag.query(q) for q in questions],
    "contexts": [graph_rag.retrieve(q) for q in questions],
    "ground_truth": ["项目A和项目B", "Python和FastAPI"],  # 人工标注的标准答案
}

dataset = Dataset.from_dict(eval_data)

# 执行评估
results = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision]
)
print(results)
```

**A/B 测试建议**：在生产环境中，建议对同一批问题同时运行传统 RAG 和 Graph RAG，通过人工评分或 LLM-as-Judge 方式对比两者的答案质量，再决定是否全量切换。

---

## 八、前沿方向

### 8.1 HippoRAG：受人类记忆启发的图 RAG

**论文**：HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models（2024）

HippoRAG 受海马体（Hippocampus）记忆机制启发，将知识图谱类比为人类的长期记忆网络。

**核心创新：**

1. **开放式知识图谱（Open KG）**：不预定义实体类型，让 LLM 自由抽取，更接近人类记忆的灵活性
2. **个性化 PageRank（PPR）**：用 PPR 算法在图上做检索，而不是简单的向量相似度
3. **记忆整合（Memory Consolidation）**：新知识写入时，自动与现有知识建立关联

```python
# HippoRAG 的检索核心：个性化 PageRank
import networkx as nx
import numpy as np

def personalized_pagerank_retrieval(
    graph: nx.Graph,
    seed_nodes: list[str],
    alpha: float = 0.85,
    top_k: int = 10
) -> list[str]:
    """
    从种子节点出发，用 PPR 在图上扩散，找到最相关的节点
    alpha: 阻尼系数（继续游走的概率）
    """
    personalization = {node: 0.0 for node in graph.nodes()}
    for seed in seed_nodes:
        if seed in personalization:
            personalization[seed] = 1.0 / len(seed_nodes)
    
    ppr_scores = nx.pagerank(
        graph,
        alpha=alpha,
        personalization=personalization,
        max_iter=100
    )
    
    # 排除种子节点本身，返回 Top-K
    results = sorted(
        [(node, score) for node, score in ppr_scores.items() if node not in seed_nodes],
        key=lambda x: x[1],
        reverse=True
    )
    return [node for node, _ in results[:top_k]]
```

**与微软 GraphRAG 的区别**：HippoRAG 更轻量，不需要社区摘要，检索延迟更低，适合实时场景。

### 8.2 RAPTOR：递归树状摘要

**论文**：RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval（2024）

RAPTOR 不构建知识图谱，而是通过递归聚类和摘要构建一棵"摘要树"，在不同粒度上回答问题。

```
原始文档 chunks（叶节点）
    ↓ 聚类 + 摘要
中层摘要节点（覆盖多个 chunk 的主题）
    ↓ 再次聚类 + 摘要
顶层摘要节点（全局主题）
```

**与 Graph RAG 的关系**：RAPTOR 可以看作 Graph RAG 社区摘要思想的简化版——用树代替图，降低了构建复杂度，但损失了实体关系信息。两者可以结合：用 RAPTOR 处理全局问题，用 Graph RAG 处理关系查询。

### 8.3 Graph RAG + Agent：图作为 Agent 的长期记忆

这是目前最受关注的方向之一。传统 Agent 的记忆是线性的（对话历史），而图结构可以作为更丰富的长期记忆。

**架构设想：**

```
用户与 Agent 交互
    ↓
Agent 执行任务，产生新知识
    ↓
知识写入图（实体 + 关系）
    ↓
下次相关任务时，从图中检索历史知识
    ↓
Agent 基于历史知识做更好的决策
```

**实践示例（基于 LangGraph）：**

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    graph_context: str  # 从知识图谱检索到的上下文

def retrieve_from_graph(state: AgentState) -> AgentState:
    """从知识图谱中检索相关历史知识"""
    last_message = state["messages"][-1]
    context = graph_rag.local_search(last_message.content)
    return {**state, "graph_context": context}

def agent_with_memory(state: AgentState) -> AgentState:
    """Agent 执行，利用图中的历史知识"""
    response = llm.invoke(
        f"历史知识：{state['graph_context']}\n\n"
        f"当前对话：{state['messages']}"
    )
    return {**state, "messages": state["messages"] + [response]}

def update_graph(state: AgentState) -> AgentState:
    """将本次交互产生的新知识写入图"""
    new_knowledge = extract_knowledge(state["messages"][-1])
    graph_rag.add_knowledge(new_knowledge)
    return state

# 构建 Agent 工作流
workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_from_graph)
workflow.add_node("agent", agent_with_memory)
workflow.add_node("update", update_graph)
workflow.add_edge("retrieve", "agent")
workflow.add_edge("agent", "update")
```

### 8.4 轻量化方向：减少对 LLM 抽取的依赖

LLM 抽取的高成本是 Graph RAG 落地的最大障碍，轻量化方向正在积极探索：

**方向一：小模型专项微调**

用 GPT-4 生成的高质量抽取结果作为训练数据，微调一个小模型（如 Llama-3-8B）专门做实体关系抽取。推理成本降低 10-100 倍。

**方向二：规则 + LLM 混合**

对于结构化程度高的领域（如医疗、法律、金融），先用规则和模板抽取大部分实体关系，只对复杂情况调用 LLM。

**方向三：无抽取图（Implicit Graph）**

不显式抽取实体关系，而是通过文档之间的引用关系、相似度关系构建隐式图。成本极低，但图的质量和表达力有限。

```python
# 隐式图：基于文档相似度构建
def build_implicit_graph(documents: list[Document], threshold: float = 0.8):
    embeddings = embed_model.encode([d.text for d in documents])
    sim_matrix = cosine_similarity(embeddings)
    
    G = nx.Graph()
    for i, doc in enumerate(documents):
        G.add_node(i, text=doc.text)
    
    for i in range(len(documents)):
        for j in range(i + 1, len(documents)):
            if sim_matrix[i][j] > threshold:
                G.add_edge(i, j, weight=sim_matrix[i][j])
    
    return G
```

### 8.5 多模态知识图谱

将图像、表格、音频等非文本信息也纳入知识图谱，构建多模态知识图谱。

**应用场景**：医疗影像（CT 图像 + 诊断报告）、工业质检（产品图片 + 检测记录）、电商（商品图片 + 描述文本）。

**技术路径**：使用多模态 LLM（如 GPT-4V、LLaVA）从图像中抽取实体和关系，与文本图谱合并。

### 8.6 Graph RAG 的未来展望

```
近期（2025）：
  - 成本优化成熟，轻量化方案普及
  - 增量更新问题得到工程化解决
  - 主流 RAG 框架全面支持 Graph RAG

中期（2026-2027）：
  - Graph RAG 与 Agent 深度融合，成为 Agent 长期记忆的标准方案
  - 多模态知识图谱在垂直领域（医疗、法律）落地
  - 图结构与 LLM 预训练结合（Graph-aware LLM）

长期：
  - 知识图谱自动演化：LLM 自主发现和更新知识
  - 个人知识图谱：每个用户拥有自己的私有知识图谱
  - 跨组织知识图谱联邦：在保护隐私的前提下共享知识
```

---

## 九、对照传统 RAG 的全链路优化工程实践

传统 RAG 经过几年工程打磨，已经形成了一套从索引到生成的完整优化体系。Graph RAG 在每个环节都有对应的工程实践，但思路和手段有所不同。本章逐环节对照，帮助有传统 RAG 经验的工程师快速找到迁移路径。

```
优化全景：
┌──────────┬──────────────────────────────┬──────────────────────────────┐
│  环节    │  传统 RAG 优化手段            │  Graph RAG 对应实践           │
├──────────┼──────────────────────────────┼──────────────────────────────┤
│ 索引优化 │ chunk 策略、元数据过滤        │ 实体抽取质量、图清洗          │
│ 查询优化 │ HyDE、查询改写、多查询        │ 实体链接、子图扩展策略        │
│ 检索优化 │ 混合检索、稀疏+稠密           │ 向量+图遍历融合、PPR          │
│ 重排优化 │ Cross-Encoder Rerank         │ 图结构感知重排                │
│ 上下文优化│ 上下文压缩、Lost-in-Middle   │ 子图剪枝、关系路径精简        │
│ 生成优化 │ Self-RAG、CRAG               │ 图引导的自我修正              │
└──────────┴──────────────────────────────┴──────────────────────────────┘
```

### 9.1 索引优化

**传统 RAG 的索引优化核心**：chunk 切分策略（固定大小 / 语义切分 / 父子 chunk）、元数据丰富化、多粒度索引。

**Graph RAG 对应的索引优化：**

**优化一：分层 chunk 策略（Parent-Child Chunk）**

Graph RAG 同样受益于父子 chunk 设计。抽取实体时用小 chunk（精准定位关系），回溯原文时返回大 chunk（保留上下文）：

```python
from llama_index.core.node_parser import HierarchicalNodeParser, get_leaf_nodes

# 构建父子 chunk 层级
parser = HierarchicalNodeParser.from_defaults(
    chunk_sizes=[2048, 512, 128]  # 父 → 子 → 孙
)
nodes = parser.get_nodes_from_documents(documents)
leaf_nodes = get_leaf_nodes(nodes)  # 128 token 的小 chunk 用于实体抽取

# 实体抽取在 leaf_nodes 上进行（精准）
# 检索时返回对应的父节点（2048 token，上下文完整）
```

**优化二：实体抽取的多轮 Gleaning**

单次 LLM 抽取往往遗漏实体，微软 GraphRAG 引入了"Gleaning"机制——对同一个 chunk 多次追问，直到 LLM 确认没有遗漏：

```python
GLEANING_PROMPT = """
你之前从文本中抽取了以下实体和关系：
{previous_result}

请仔细检查原文，是否还有遗漏的实体或关系？
如果有，请补充；如果没有，回复 "COMPLETE"。

原文：{text}
"""

def extract_with_gleaning(text: str, max_gleanings: int = 2) -> ExtractionResult:
    result = llm_extract(text)
    
    for _ in range(max_gleanings):
        gleaning = llm.complete(GLEANING_PROMPT.format(
            previous_result=result,
            text=text
        ))
        if "COMPLETE" in gleaning.text:
            break
        result = merge_results(result, parse_gleaning(gleaning.text))
    
    return result
```

**优化三：图清洗（Graph Pruning）**

索引完成后对图做质量清洗，去除噪声节点和弱关系：

```python
def prune_graph(G: nx.Graph, min_degree: int = 2, min_edge_weight: float = 0.3):
    """
    清洗策略：
    1. 删除孤立节点（度 < min_degree）
    2. 删除低置信度关系（weight < min_edge_weight）
    3. 合并高相似度实体（共指消解）
    """
    # 删除低度节点
    low_degree_nodes = [n for n, d in G.degree() if d < min_degree]
    G.remove_nodes_from(low_degree_nodes)
    
    # 删除低权重边
    low_weight_edges = [
        (u, v) for u, v, d in G.edges(data=True)
        if d.get("weight", 1.0) < min_edge_weight
    ]
    G.remove_edges_from(low_weight_edges)
    
    return G
```

### 9.2 查询优化

**传统 RAG 的查询优化核心**：HyDE（假设文档嵌入）、查询改写、多查询并行、Step-Back 提问。

**Graph RAG 对应的查询优化：**

**优化一：实体链接（Entity Linking）**

传统 RAG 直接把问题向量化去检索，Graph RAG 需要先从问题中识别出实体，再用实体去锚定图中的节点——这一步叫实体链接，是 Graph RAG 查询优化的核心：

```python
ENTITY_LINKING_PROMPT = """
从以下问题中识别出所有命名实体（人名、组织、项目、地点、概念等）。

问题：{query}

输出格式（JSON）：
{
  "entities": ["实体1", "实体2", ...]
}
"""

def entity_linking(query: str) -> list[str]:
    # Step 1: 从问题中抽取实体名称
    result = llm.complete(ENTITY_LINKING_PROMPT.format(query=query))
    candidate_names = parse_json(result.text)["entities"]
    
    # Step 2: 在图中模糊匹配（处理别名、缩写等）
    matched_entities = []
    for name in candidate_names:
        # 先精确匹配
        exact = graph.find_entity(name)
        if exact:
            matched_entities.append(exact)
            continue
        # 再向量相似度匹配（处理别名）
        similar = entity_vector_store.search(name, top_k=1, threshold=0.88)
        if similar:
            matched_entities.append(similar[0])
    
    return matched_entities
```

**优化二：查询分解（Query Decomposition）**

复杂的多跳问题可以先分解为子问题，分别检索后再合并：

```python
DECOMPOSE_PROMPT = """
将以下复杂问题分解为若干个可以独立回答的子问题。

问题：{query}

输出（JSON）：
{
  "sub_questions": [
    "子问题1",
    "子问题2",
    ...
  ]
}
"""

async def decomposed_search(query: str) -> str:
    # 分解问题
    sub_questions = decompose_query(query)
    
    # 并行检索每个子问题
    sub_answers = await asyncio.gather(*[
        local_search(sq) for sq in sub_questions
    ])
    
    # 合并子答案生成最终回答
    return llm.complete(
        f"基于以下子问题的答案，综合回答原始问题。\n\n"
        f"原始问题：{query}\n\n"
        + "\n\n".join([f"子问题{i+1}：{q}\n答案：{a}"
                       for i, (q, a) in enumerate(zip(sub_questions, sub_answers))])
    )
```

**优化三：图感知的 HyDE**

传统 HyDE 生成假设文档再向量化检索。Graph RAG 的变体是生成"假设实体列表"，直接用于图查询：

```python
HYPOTHETICAL_ENTITIES_PROMPT = """
假设你已经知道以下问题的答案，请列出回答这个问题所需涉及的关键实体。

问题：{query}

输出（JSON）：
{
  "hypothetical_entities": ["实体1", "实体2", ...]
}
"""

def graph_hyde(query: str) -> list[str]:
    """生成假设实体列表，扩大图检索的种子集合"""
    result = llm.complete(HYPOTHETICAL_ENTITIES_PROMPT.format(query=query))
    hypothetical = parse_json(result.text)["hypothetical_entities"]
    
    # 用假设实体在向量库中找真实实体
    real_entities = []
    for h_entity in hypothetical:
        matches = entity_vector_store.search(h_entity, top_k=2, threshold=0.80)
        real_entities.extend(matches)
    
    return real_entities
```

### 9.3 检索优化

**传统 RAG 的检索优化核心**：稀疏检索（BM25）+ 稠密检索（向量）混合，通过 RRF 融合。

**Graph RAG 对应的检索优化：**

**优化一：三路混合检索**

Graph RAG 的检索可以融合三路信号，而不只是两路：

```python
async def triple_hybrid_search(query: str, entities: list[str]) -> list[Node]:
    """
    三路融合：
    1. 稠密检索（向量相似度）
    2. 稀疏检索（BM25 关键词匹配）
    3. 图结构检索（从实体出发的邻居扩展）
    """
    # 路1：向量检索
    dense_results = await entity_vector_store.search(query, top_k=10)
    
    # 路2：BM25 关键词检索（对实体名称效果好）
    sparse_results = bm25_index.search(query, top_k=10)
    
    # 路3：图遍历（从实体链接结果出发）
    graph_results = []
    for entity in entities:
        neighbors = graph.get_neighbors(entity, hops=2)
        graph_results.extend(neighbors)
    
    # RRF 三路融合
    return reciprocal_rank_fusion(
        [dense_results, sparse_results, graph_results],
        weights=[0.4, 0.2, 0.4]  # 图信号权重更高
    )
```

**优化二：动态跳数控制（Adaptive Hop）**

固定 2 跳遍历可能过多（引入噪声）或过少（遗漏关键节点）。根据问题复杂度动态调整：

```python
HOP_DECISION_PROMPT = """
判断回答以下问题需要几跳图遍历：
- 1跳：直接关系（"张三的职位是什么"）
- 2跳：间接关系（"张三负责的项目用了哪些技术"）
- 3跳：深层关系（"张三的项目和李四的项目有哪些共同依赖"）

问题：{query}
输出：1 / 2 / 3
"""

def adaptive_graph_search(query: str, seed_entities: list[str]) -> list[Node]:
    hops = int(llm.complete(HOP_DECISION_PROMPT.format(query=query)).text.strip())
    
    results = []
    for entity in seed_entities:
        neighbors = graph.get_neighbors(entity, hops=hops)
        results.extend(neighbors)
    
    return results
```

**优化三：关系类型过滤**

不是所有关系都与问题相关，根据问题意图过滤关系类型，减少噪声：

```python
RELATION_FILTER_PROMPT = """
以下是可用的关系类型列表：
{relation_types}

对于问题："{query}"
哪些关系类型是相关的？请列出（JSON 数组）。
"""

def relation_filtered_search(query: str, entity: str) -> list[Node]:
    # 获取图中所有关系类型
    all_relation_types = graph.get_all_relation_types()
    
    # 让 LLM 判断哪些关系类型与问题相关
    relevant_types = llm.complete(RELATION_FILTER_PROMPT.format(
        relation_types=all_relation_types,
        query=query
    ))
    
    # 只遍历相关关系类型的边
    return graph.get_neighbors(
        entity,
        hops=2,
        relation_filter=parse_json(relevant_types.text)
    )
```

### 9.4 重排优化（Reranking）

**传统 RAG 的重排核心**：用 Cross-Encoder 模型对 Top-K 候选做精排，代表模型有 BGE-Reranker、Cohere Rerank。

**Graph RAG 对应的重排优化：**

传统 Cross-Encoder 只看文本相似度，Graph RAG 的重排需要额外考虑**图结构信号**。

**优化一：图结构感知重排（Structure-Aware Reranking）**

```python
def graph_aware_rerank(
    query: str,
    candidates: list[Node],
    seed_entities: list[str]
) -> list[Node]:
    """
    综合三个维度打分：
    1. 语义相关性（Cross-Encoder 分数）
    2. 图距离（与种子实体的最短路径长度）
    3. 节点重要性（PageRank 分数）
    """
    scores = []
    
    for node in candidates:
        # 维度1：语义相关性
        semantic_score = cross_encoder.predict([(query, node.description)])[0]
        
        # 维度2：图距离（距离越近分数越高）
        min_distance = min(
            graph.shortest_path_length(seed, node.id)
            for seed in seed_entities
            if graph.has_path(seed, node.id)
        )
        distance_score = 1.0 / (1.0 + min_distance)
        
        # 维度3：节点重要性（预计算的 PageRank）
        importance_score = node.pagerank_score
        
        # 加权融合
        final_score = (
            0.5 * semantic_score +
            0.3 * distance_score +
            0.2 * importance_score
        )
        scores.append((node, final_score))
    
    return [node for node, _ in sorted(scores, key=lambda x: x[1], reverse=True)]
```

**优化二：社区感知重排**

同一社区内的节点往往主题相关，优先保留来自不同社区的节点，提升结果多样性：

```python
def community_diverse_rerank(candidates: list[Node], top_k: int = 10) -> list[Node]:
    """
    MMR（最大边际相关性）的图版本：
    在保证相关性的同时，确保结果覆盖不同社区
    """
    selected = []
    remaining = candidates.copy()
    covered_communities = set()
    
    while len(selected) < top_k and remaining:
        best = None
        best_score = -1
        
        for node in remaining:
            # 相关性分数（已由上游排序保证）
            relevance = node.relevance_score
            
            # 多样性奖励：来自未覆盖社区的节点加分
            diversity_bonus = 0.3 if node.community_id not in covered_communities else 0.0
            
            score = relevance + diversity_bonus
            if score > best_score:
                best_score = score
                best = node
        
        selected.append(best)
        covered_communities.add(best.community_id)
        remaining.remove(best)
    
    return selected
```

### 9.5 上下文优化

**传统 RAG 的上下文优化核心**：上下文压缩（LLMLingua）、解决 Lost-in-Middle 问题（重要内容放首尾）、上下文窗口管理。

**Graph RAG 对应的上下文优化：**

**优化一：子图剪枝（Subgraph Pruning）**

图遍历可能带回大量弱相关节点，需要在组装上下文前做剪枝：

```python
def prune_subgraph_for_context(
    query: str,
    subgraph_nodes: list[Node],
    max_tokens: int = 4000
) -> list[Node]:
    """
    按相关性分数排序，在 token 预算内贪心选取节点
    """
    # 计算每个节点与 query 的相关性
    scored_nodes = [
        (node, cross_encoder.predict([(query, node.description)])[0])
        for node in subgraph_nodes
    ]
    scored_nodes.sort(key=lambda x: x[1], reverse=True)
    
    selected = []
    used_tokens = 0
    
    for node, score in scored_nodes:
        node_tokens = count_tokens(node.description)
        if used_tokens + node_tokens > max_tokens:
            break
        selected.append(node)
        used_tokens += node_tokens
    
    return selected
```

**优化二：关系路径精简（Path Simplification）**

多跳检索会带回完整路径，但路径中间节点可能是噪声。只保留路径的起点、终点和关键中间节点：

```python
def simplify_relation_path(path: list[Node], query: str) -> str:
    """
    将多跳路径压缩为自然语言描述，减少 token 消耗
    
    原始路径：张三 -[负责]-> 项目A -[使用]-> Python -[版本]-> 3.11
    压缩后：张三负责的项目A使用 Python 3.11
    """
    if len(path) <= 2:
        return format_direct_relation(path)
    
    # 用 LLM 将路径压缩为一句话
    path_text = " -> ".join([f"{n.name}({n.type})" for n in path])
    return llm.complete(
        f"将以下实体关系路径压缩为一句简洁的中文描述：\n{path_text}"
    ).text
```

**优化三：上下文结构化组装**

Graph RAG 的上下文不是简单的文本拼接，而是有结构的：

```python
def build_structured_context(
    query: str,
    seed_entities: list[Node],
    related_nodes: list[Node],
    relations: list[Relation],
    source_chunks: list[Chunk],
    community_summary: str
) -> str:
    """
    结构化上下文模板：
    1. 社区背景（全局视角）
    2. 核心实体（精确事实）
    3. 关系网络（结构信息）
    4. 原文片段（细节支撑）
    """
    context = f"""
## 背景知识
{community_summary}

## 核心实体
{format_entities(seed_entities + related_nodes)}

## 实体关系
{format_relations(relations)}

## 原文依据
{format_chunks(source_chunks)}

## 问题
{query}
"""
    return context
```

研究表明，把最重要的信息（核心实体、关系）放在上下文的**开头**，可以有效缓解 Lost-in-Middle 问题。

### 9.6 生成优化

**传统 RAG 的生成优化核心**：Self-RAG（自我反思）、CRAG（纠正性 RAG，检测检索质量后决定是否重检索）、引用溯源。

**Graph RAG 对应的生成优化：**

**优化一：图引导的自我修正（Graph-Guided Self-Correction）**

生成答案后，用图验证答案中的实体和关系是否与图中的事实一致：

```python
FACT_CHECK_PROMPT = """
以下是知识图谱中的事实：
{graph_facts}

以下是生成的答案：
{answer}

请检查答案中的每个事实性陈述是否与知识图谱一致。
对于不一致的地方，请指出并给出正确信息。

输出（JSON）：
{
  "is_consistent": true/false,
  "inconsistencies": [
    {"claim": "答案中的陈述", "correction": "正确信息"}
  ]
}
"""

async def self_correcting_generate(query: str, context: str) -> str:
    # 第一次生成
    answer = await llm.complete(f"基于以下信息回答问题：\n{context}\n\n问题：{query}")
    
    # 提取答案中涉及的实体，从图中获取相关事实
    answer_entities = extract_entities(answer.text)
    graph_facts = graph.get_facts_about(answer_entities)
    
    # 事实核查
    check_result = await llm.complete(FACT_CHECK_PROMPT.format(
        graph_facts=format_facts(graph_facts),
        answer=answer.text
    ))
    
    result = parse_json(check_result.text)
    if result["is_consistent"]:
        return answer.text
    
    # 有不一致，修正后重新生成
    corrections = result["inconsistencies"]
    corrected_context = context + f"\n\n## 重要修正\n{format_corrections(corrections)}"
    return await llm.complete(
        f"基于以下信息（注意修正部分）回答问题：\n{corrected_context}\n\n问题：{query}"
    )
```

**优化二：引用溯源（Citation Tracing）**

Graph RAG 天然支持答案溯源，因为每个实体和关系都记录了来源 chunk：

```python
def generate_with_citations(query: str, context_nodes: list[Node]) -> dict:
    """生成带引用的答案"""
    # 构建节点 ID 到来源的映射
    citation_map = {
        node.id: node.text_unit_ids
        for node in context_nodes
    }
    
    # 在 Prompt 中要求 LLM 标注引用
    CITATION_PROMPT = """
回答问题时，对每个关键事实用 [节点ID] 标注来源。

可用信息：
{context}

问题：{query}
"""
    answer = llm.complete(CITATION_PROMPT.format(
        context=format_nodes_with_ids(context_nodes),
        query=query
    ))
    
    # 解析引用，回溯到原始 chunk
    cited_node_ids = extract_citations(answer.text)
    source_chunks = []
    for node_id in cited_node_ids:
        chunk_ids = citation_map.get(node_id, [])
        chunks = [chunk_store.get(cid) for cid in chunk_ids]
        source_chunks.extend(chunks)
    
    return {
        "answer": answer.text,
        "sources": deduplicate(source_chunks)
    }
```

### 9.7 优化效果的量化评估

每个优化手段都应该有对应的评估指标，避免盲目优化：

```python
# 各优化环节的评估指标
optimization_metrics = {
    "索引优化": {
        "实体召回率": "人工标注的实体中，有多少被正确抽取",
        "关系准确率": "抽取的关系中，有多少是正确的",
        "图密度": "平均每个节点的连接数（过低说明抽取不足）",
    },
    "查询优化": {
        "实体链接准确率": "问题中的实体有多少被正确链接到图节点",
        "种子实体覆盖率": "回答问题所需的实体有多少在种子集合中",
    },
    "检索优化": {
        "上下文精确率": "检索到的节点中，有多少与答案相关",
        "上下文召回率": "回答问题所需的信息有多少被检索到",
    },
    "重排优化": {
        "MRR@10": "正确答案在重排后的平均倒数排名",
        "NDCG@10": "归一化折损累积增益",
    },
    "生成优化": {
        "事实一致性": "答案中的事实与图中事实的一致率",
        "答案完整性": "答案是否覆盖了问题的所有方面（RAGAS）",
        "引用准确率": "引用的来源是否真实支撑了对应陈述",
    }
}
```

**A/B 测试框架：**

```python
async def ab_test_optimization(
    queries: list[str],
    baseline_pipeline,
    optimized_pipeline,
    judge_llm
) -> dict:
    """用 LLM-as-Judge 对比两个 pipeline 的答案质量"""
    results = {"wins": 0, "losses": 0, "ties": 0}
    
    for query in queries:
        baseline_answer = await baseline_pipeline.query(query)
        optimized_answer = await optimized_pipeline.query(query)
        
        judgment = await judge_llm.complete(f"""
对比以下两个答案，哪个更好？（A/B/TIE）
问题：{query}
答案A：{baseline_answer}
答案B：{optimized_answer}
输出：A / B / TIE，并简要说明理由。
""")
        
        if "B" in judgment.text[:5]:
            results["wins"] += 1
        elif "A" in judgment.text[:5]:
            results["losses"] += 1
        else:
            results["ties"] += 1
    
    results["win_rate"] = results["wins"] / len(queries)
    return results
```

---

*文档持续更新中。如有问题或补充，欢迎在对应章节添加注释。*
