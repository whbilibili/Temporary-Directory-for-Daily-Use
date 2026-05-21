"""
Advanced RAG 系统
优化点：
  1. 新版 LangChain API（langchain_community / langchain_huggingface）
  2. Parent-Child Chunking：小块检索，父块送 LLM
  3. 混合检索：向量 + BM25，RRF 融合排名
  4. Reranking：Cross-Encoder 精排
  5. RAGAS 自动评估（Faithfulness / Answer Relevancy / Context Precision）
"""

from __future__ import annotations

import os
import uuid
from typing import List, Dict, Tuple, Optional

# ── LangChain（新版包路径）──────────────────────────────────────────────────
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# ── Reranking ──────────────────────────────────────────────────────────────
from sentence_transformers import CrossEncoder

# ── RAGAS 评估 ─────────────────────────────────────────────────────────────
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset


# ══════════════════════════════════════════════════════════════════════════════
# 1. Parent-Child Chunking
# ══════════════════════════════════════════════════════════════════════════════

class ParentChildChunker:
    """
    两级切块策略：
      - child_chunk  (小块，~200 字)  → 用于向量检索，粒度细、命中精准
      - parent_chunk (父块，~800 字)  → 命中后返回给 LLM，上下文完整

    存储结构：
      child_doc.metadata["parent_id"] 指向对应父块的 UUID
      parent_store: Dict[str, Document]  内存字典，按 parent_id 取父块
    """

    def __init__(
        self,
        parent_chunk_size: int = 800,
        parent_chunk_overlap: int = 100,
        child_chunk_size: int = 200,
        child_chunk_overlap: int = 20,
    ):
        self.parent_splitter = RecursiveCharacterTextSplitter(
            chunk_size=parent_chunk_size,
            chunk_overlap=parent_chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", " ", ""],
        )
        self.child_splitter = RecursiveCharacterTextSplitter(
            chunk_size=child_chunk_size,
            chunk_overlap=child_chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", " ", ""],
        )

    def split(self, documents: List[Document]) -> Tuple[List[Document], Dict[str, Document]]:
        """
        Returns:
            child_docs   : 用于向量化的小块列表
            parent_store : {parent_id -> parent_doc} 字典
        """
        child_docs: List[Document] = []
        parent_store: Dict[str, Document] = {}

        parent_chunks = self.parent_splitter.split_documents(documents)

        for parent_doc in parent_chunks:
            parent_id = str(uuid.uuid4())
            parent_doc.metadata["parent_id"] = parent_id
            parent_store[parent_id] = parent_doc

            # 在父块基础上再切子块
            children = self.child_splitter.split_documents([parent_doc])
            for child in children:
                child.metadata["parent_id"] = parent_id
                child_docs.append(child)

        print(f"  Parent-Child Chunking: {len(parent_chunks)} 父块 → {len(child_docs)} 子块")
        return child_docs, parent_store


# ══════════════════════════════════════════════════════════════════════════════
# 2. 混合检索 + RRF 融合
# ══════════════════════════════════════════════════════════════════════════════

def reciprocal_rank_fusion(
    results_list: List[List[Document]],
    k: int = 60,
) -> List[Tuple[Document, float]]:
    """
    Reciprocal Rank Fusion：将多路检索结果融合为统一排名。

    公式：score(d) = Σ  1 / (k + rank_i(d))
    k=60 是论文推荐的平滑参数，防止头部文档分数过高。
    """
    scores: Dict[str, float] = {}
    doc_map: Dict[str, Document] = {}

    for results in results_list:
        for rank, doc in enumerate(results, start=1):
            # 用内容哈希作为去重 key
            doc_id = str(hash(doc.page_content))
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
            doc_map[doc_id] = doc

    # 按融合分数降序排列
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [(doc_map[doc_id], score) for doc_id, score in ranked]


class HybridRetriever:
    """
    混合检索器：向量检索 + BM25 关键词检索，RRF 融合。

    向量检索擅长：语义相似、同义词、模糊表达
    BM25 擅长：精确关键词、专有名词、产品型号
    两者互补，融合后召回率显著提升。
    """

    def __init__(
        self,
        vectorstore: Chroma,
        child_docs: List[Document],
        vector_top_k: int = 20,
        bm25_top_k: int = 20,
        final_top_k: int = 10,
    ):
        self.vectorstore = vectorstore
        self.vector_top_k = vector_top_k
        self.final_top_k = final_top_k

        # BM25 检索器（基于子块）
        self.bm25_retriever = BM25Retriever.from_documents(child_docs)
        self.bm25_retriever.k = bm25_top_k

    def retrieve(self, query: str) -> List[Document]:
        """执行混合检索，返回 RRF 融合后的 Top-K 子块"""
        # 向量检索
        vector_results = self.vectorstore.similarity_search(query, k=self.vector_top_k)

        # BM25 检索
        bm25_results = self.bm25_retriever.get_relevant_documents(query)

        # RRF 融合
        fused = reciprocal_rank_fusion([vector_results, bm25_results])

        # 取 Top-K
        return [doc for doc, _ in fused[: self.final_top_k]]


# ══════════════════════════════════════════════════════════════════════════════
# 3. Cross-Encoder Reranking
# ══════════════════════════════════════════════════════════════════════════════

class Reranker:
    """
    Cross-Encoder 精排。

    Bi-Encoder（向量检索）：query 和 doc 分别编码，速度快但精度有损
    Cross-Encoder：query + doc 拼接后一起编码，精度高但慢

    工程上的标准做法：
      Bi-Encoder 粗召回（Top-20）→ Cross-Encoder 精排（取 Top-5）→ 送 LLM
    """

    def __init__(self, model_name: str = "BAAI/bge-reranker-v2-m3", top_k: int = 5):
        print(f"  加载 Reranker 模型: {model_name}")
        self.model = CrossEncoder(model_name)
        self.top_k = top_k

    def rerank(self, query: str, docs: List[Document]) -> List[Document]:
        """对候选文档精排，返回 Top-K"""
        if not docs:
            return []

        pairs = [(query, doc.page_content) for doc in docs]
        scores = self.model.predict(pairs)

        # 按分数降序排列
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[: self.top_k]]


# ══════════════════════════════════════════════════════════════════════════════
# 4. Advanced RAG 主类
# ══════════════════════════════════════════════════════════════════════════════

class AdvancedRAG:
    """
    Advanced RAG 系统

    检索流程：
      用户问题
        ↓
      混合检索（向量 + BM25 + RRF）→ Top-20 子块
        ↓
      Cross-Encoder Reranking → Top-5 子块
        ↓
      Parent-Child 扩展 → 取对应父块（上下文更完整）
        ↓
      拼入 Prompt → LLM 生成答案
    """

    def __init__(
        self,
        embedding_model: str = "BAAI/bge-large-zh-v1.5",
        reranker_model: str = "BAAI/bge-reranker-v2-m3",
        llm_model: str = "gpt-3.5-turbo",
        parent_chunk_size: int = 800,
        child_chunk_size: int = 200,
        rerank_top_k: int = 5,
    ):
        print("🚀 初始化 Advanced RAG 系统...")

        # Embedding 模型（中文推荐 BGE large）
        print(f"  📦 加载 Embedding 模型: {embedding_model}")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},  # BGE 需要归一化
        )

        # LLM
        print(f"  🤖 加载 LLM: {llm_model}")
        self.llm = ChatOpenAI(model_name=llm_model, temperature=0.1)

        # Reranker
        self.reranker = Reranker(model_name=reranker_model, top_k=rerank_top_k)

        # Chunker
        self.chunker = ParentChildChunker(
            parent_chunk_size=parent_chunk_size,
            child_chunk_size=child_chunk_size,
        )

        # 运行时状态
        self.vectorstore: Optional[Chroma] = None
        self.hybrid_retriever: Optional[HybridRetriever] = None
        self.parent_store: Dict[str, Document] = {}
        self.child_docs: List[Document] = []

        # Prompt 模板
        self.prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""你是一个专业的 AI 助手。请严格基于以下上下文信息回答问题。

【规则】
1. 只使用上下文中的信息，不要凭空推断
2. 如果上下文中没有足够信息，明确回答"根据提供的信息无法回答"
3. 回答要准确、简洁，优先引用具体数据或事实
4. 如果信息来自多个片段，综合后再回答

上下文：
{context}

问题：{question}

答案：""",
        )
        self.llm_chain = LLMChain(llm=self.llm, prompt=self.prompt)

        print("✅ 初始化完成\n")

    # ── 文档加载 ──────────────────────────────────────────────────────────────

    def load_documents(self, file_paths: List[str]) -> List[Document]:
        print("📂 加载文档...")
        all_docs: List[Document] = []
        for path in file_paths:
            print(f"  - {path}")
            loader = PyPDFLoader(path) if path.endswith(".pdf") else TextLoader(path, encoding="utf-8")
            all_docs.extend(loader.load())
        print(f"  共加载 {len(all_docs)} 个文档\n")
        return all_docs

    # ── 构建知识库 ────────────────────────────────────────────────────────────

    def build_knowledge_base(self, documents: List[Document], persist_dir: str = "./chroma_db_advanced"):
        print("🔨 构建知识库...")

        # 1. Parent-Child 切块
        print("  1️⃣  Parent-Child Chunking...")
        self.child_docs, self.parent_store = self.chunker.split(documents)

        # 2. 向量化子块
        print("  2️⃣  向量化子块并写入 Chroma...")
        self.vectorstore = Chroma.from_documents(
            documents=self.child_docs,
            embedding=self.embeddings,
            persist_directory=persist_dir,
        )

        # 3. 构建混合检索器
        print("  3️⃣  构建混合检索器（向量 + BM25）...")
        self.hybrid_retriever = HybridRetriever(
            vectorstore=self.vectorstore,
            child_docs=self.child_docs,
        )

        print("✅ 知识库构建完成\n")

    # ── 核心检索流程 ──────────────────────────────────────────────────────────

    def _retrieve_with_parent_expansion(self, query: str) -> List[Document]:
        """
        完整检索流程：
          混合检索 → Reranking → Parent 扩展
        """
        # Step 1: 混合检索，得到 Top-20 子块
        candidate_children = self.hybrid_retriever.retrieve(query)

        # Step 2: Cross-Encoder 精排，得到 Top-5 子块
        reranked_children = self.reranker.rerank(query, candidate_children)

        # Step 3: 用 parent_id 取对应父块（上下文更完整）
        seen_parent_ids = set()
        parent_docs: List[Document] = []
        for child in reranked_children:
            pid = child.metadata.get("parent_id")
            if pid and pid not in seen_parent_ids:
                seen_parent_ids.add(pid)
                parent_doc = self.parent_store.get(pid)
                if parent_doc:
                    parent_docs.append(parent_doc)

        return parent_docs

    # ── 查询接口 ──────────────────────────────────────────────────────────────

    def query(self, question: str, verbose: bool = True) -> Dict:
        """
        查询并返回答案 + 来源文档。

        Returns:
            {
                "answer": str,
                "source_docs": List[Document],
                "context": str,   # 送给 LLM 的完整上下文（供 RAGAS 使用）
            }
        """
        if not self.hybrid_retriever:
            raise RuntimeError("请先调用 build_knowledge_base()")

        if verbose:
            print(f"🔍 问题：{question}")
            print("-" * 60)

        # 检索
        source_docs = self._retrieve_with_parent_expansion(question)
        context = "\n\n---\n\n".join(doc.page_content for doc in source_docs)

        # 生成
        answer = self.llm_chain.run(context=context, question=question)

        if verbose:
            print(f"\n💡 答案：\n{answer}\n")
            print(f"📚 引用了 {len(source_docs)} 个父块")
            for i, doc in enumerate(source_docs, 1):
                print(f"  [{i}] {doc.page_content[:80]}...")
            print("-" * 60 + "\n")

        return {"answer": answer, "source_docs": source_docs, "context": context}

    # ── RAGAS 评估 ────────────────────────────────────────────────────────────

    def evaluate_with_ragas(
        self,
        test_cases: List[Dict],
    ) -> Dict:
        """
        用 RAGAS 自动评估 RAG 系统质量。

        Args:
            test_cases: 测试用例列表，每条格式：
                {
                    "question": "问题",
                    "ground_truth": "标准答案"   # 可选，有则计算 context_precision
                }

        Returns:
            RAGAS 评估结果字典，包含各指标均值。

        评估指标说明：
            faithfulness      : 答案是否有文档支撑（防幻觉）
            answer_relevancy  : 答案是否切题
            context_precision : 检索内容是否精准（需要 ground_truth）
        """
        print("📊 开始 RAGAS 评估...")
        print(f"  测试用例数量: {len(test_cases)}\n")

        questions, answers, contexts, ground_truths = [], [], [], []

        for i, case in enumerate(test_cases, 1):
            print(f"  [{i}/{len(test_cases)}] 处理: {case['question'][:40]}...")
            result = self.query(case["question"], verbose=False)

            questions.append(case["question"])
            answers.append(result["answer"])
            contexts.append([doc.page_content for doc in result["source_docs"]])
            ground_truths.append(case.get("ground_truth", ""))

        # 构建 RAGAS Dataset
        dataset = Dataset.from_dict(
            {
                "question": questions,
                "answer": answers,
                "contexts": contexts,
                "ground_truth": ground_truths,
            }
        )

        # 选择评估指标
        metrics = [faithfulness, answer_relevancy]
        if any(gt for gt in ground_truths):
            metrics.append(context_precision)

        result = evaluate(dataset=dataset, metrics=metrics)

        print("\n📈 RAGAS 评估结果：")
        print("-" * 40)
        result_dict = result.to_pandas().mean().to_dict()
        for metric, score in result_dict.items():
            bar = "█" * int(score * 20)
            print(f"  {metric:<25} {score:.3f}  {bar}")
        print("-" * 40 + "\n")

        return result_dict


# ══════════════════════════════════════════════════════════════════════════════
# 5. 使用示例
# ══════════════════════════════════════════════════════════════════════════════

def create_sample_docs():
    """创建示例文档"""
    with open("company_report.txt", "w", encoding="utf-8") as f:
        f.write("""
2023年度公司财务报告

一、业绩概况
2023年全年，公司实现营业收入2.5亿元，同比增长35%。
其中，第四季度单季度营收达到5000万元，创历史新高。
净利润为3200万元，净利润率12.8%，较上年提升2.1个百分点。

二、产品线表现
- AI助手产品：年销售额1.2亿元，占比48%，同比增长52%
- 数据分析平台：年销售额8000万元，占比32%，同比增长28%
- 企业服务：年销售额5000万元，占比20%，同比增长18%

三、研发投入
全年研发投入4500万元，占营收比例18%，同比增加800万元。
研发团队扩充至120人，新增专利申请23项。

四、市场展望
预计2024年公司营收将突破3亿元，继续保持高速增长态势。
重点布局大模型应用、多模态交互两个方向。
""")

    with open("product_manual.txt", "w", encoding="utf-8") as f:
        f.write("""
产品使用手册

产品名称：智能AI助手 v2.0

一、核心功能
1. 自然语言对话：支持多轮对话，理解上下文，对话轮次上限200轮
2. 知识问答：基于企业私有知识库回答问题，支持引用溯源
3. 任务自动化：自动执行重复性任务，支持定时触发和事件触发
4. 数据分析：实时分析业务数据，支持图表生成和趋势预测

二、技术规格
- 响应延迟：P99 < 3秒
- 并发支持：单实例最高500 QPS
- 知识库容量：最大支持100万文档片段
- 支持格式：PDF、Word、TXT、Markdown、HTML

三、使用场景
- 客户服务：24小时在线客服，支持多语言
- 内部协作：团队知识管理，文档智能检索
- 业务分析：销售数据洞察，自动生成周报

四、部署要求
- 最低配置：8核CPU，16GB内存，100GB存储
- 推荐配置：16核CPU，32GB内存，500GB SSD
- 操作系统：Linux（Ubuntu 20.04+）或 macOS 12+
""")


def main():
    # ── 初始化系统 ──────────────────────────────────────────────────────────
    rag = AdvancedRAG(
        embedding_model="BAAI/bge-large-zh-v1.5",   # 中文效果最好的开源 Embedding
        reranker_model="BAAI/bge-reranker-v2-m3",   # BGE 精排模型
        llm_model="gpt-3.5-turbo",
        parent_chunk_size=800,
        child_chunk_size=200,
        rerank_top_k=5,
    )

    # ── 准备文档 ────────────────────────────────────────────────────────────
    create_sample_docs()
    documents = rag.load_documents(["company_report.txt", "product_manual.txt"])

    # ── 构建知识库 ──────────────────────────────────────────────────────────
    rag.build_knowledge_base(documents)

    # ── 功能测试 ────────────────────────────────────────────────────────────
    print("=" * 70)
    print("功能测试")
    print("=" * 70 + "\n")

    rag.query("2023年第四季度的营收是多少？")
    rag.query("AI助手的并发支持能力如何？")
    rag.query("公司在研发方面投入了多少？")

    # ── RAGAS 评估 ──────────────────────────────────────────────────────────
    print("=" * 70)
    print("RAGAS 自动评估")
    print("=" * 70 + "\n")

    test_cases = [
        {
            "question": "2023年第四季度营收是多少？",
            "ground_truth": "2023年第四季度单季度营收达到5000万元，创历史新高。",
        },
        {
            "question": "AI助手产品的年销售额占比是多少？",
            "ground_truth": "AI助手产品年销售额1.2亿元，占比48%。",
        },
        {
            "question": "智能AI助手支持哪些文件格式？",
            "ground_truth": "支持PDF、Word、TXT、Markdown、HTML格式。",
        },
        {
            "question": "公司2024年的战略重点是什么？",
            "ground_truth": "重点布局大模型应用、多模态交互两个方向。",
        },
    ]

    scores = rag.evaluate_with_ragas(test_cases)
    print("✅ 评估完成！")


if __name__ == "__main__":
    main()
