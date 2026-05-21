# 深入浅出完整解析 AIGC 时代 Transformer 核心基础知识【阅读总结】

## 深入浅出完整解析 AIGC 时代 Transformer 核心基础知识

> 本文由 CatDesk 阅读整理自知乎文章《深入浅出完整解析AIGC时代Transformer核心基础知识》（作者：Rocky Ding），原文链接：[https://zhuanlan.zhihu.com/p/709874399](https://zhuanlan.zhihu.com/p/709874399)
> 整理时间：2026-04-07

---

### 一、背景与意义：一篇 15 页论文如何重构 AI 世界

2017 年，Google 发布论文《Attention is All You Need》，提出了 Transformer 架构。这篇全文仅 15 页的论文，却为整个 AI 行业带来了深刻变革。从传统深度学习时代（CV、NLP）到当前的 AIGC 时代（AI 绘画、AI 视频、大模型、AI 多模态），Transformer 架构无处不在，正在一步步重构所有 AI 技术方向，成为 AI 技术架构与多模态整合的关键核心。

**深度思考：为什么 Transformer 能跨越两个时代？**

Transformer 的跨周期价值，本质上来自两个核心能力：**长距离依赖关系处理**和**并行计算**。相比 RNN 架构，Transformer 的自注意力机制能够直接建模序列中任意两个位置之间的关系，不受距离限制；同时，由于不依赖时序递推，整个序列可以并行计算，大幅提升训练效率。这两点优势，使得 Transformer 在算力和数据规模不断扩大的今天，能够持续受益于 Scaling Law，成为大模型时代的基石。

---

### 二、Transformer 整体架构初识

原生 Transformer 是一个端到端（End-to-End）的架构，主要由 **Encoder（编码器）** 和 **Decoder（解码器）** 两大核心模块构成，其中 Encoder 和 Decoder 各包含 6 个 Block 结构。

#### 2.1 原生 Transformer 工作流程

整体工作流程分为三步：

**第一步：输入处理。** 将输入文本通过 Tokenizer（分词器）转换为 Tokens，提取 Text Embeddings 特征向量，并与位置 Embeddings 相加，拼接后得到完整的输入特征矩阵 X（维度为 n×d，其中 n 为单词数，d=512）。

**第二步：Encoder 编码。** 将特征矩阵 X 传入 Transformer 的 Encoder，经过 6 个 Encoder Block 后，得到输入文本的高维编码矩阵 C。每个 Encoder Block 的输入输出维度完全相同。

**第三步：Decoder 解码。** 将编码矩阵 C 传入 Decoder，Decoder 根据已翻译的 1~i 个单词，逐步预测第 i+1 个单词。在推理过程中，通过 Mask（掩膜）操作遮盖未来位置的信息，实现自回归生成。

#### 2.2 Transformer 在 AIGC 时代的各领域应用

进入 AIGC 时代后，Transformer 已全面渗透到 AI 各个方向：

- **AI 绘画领域**：ViT（Vision Transformer）、DiT（Diffusion Transformer）等模型，Stable Diffusion 系列以 Transformer 为底座。
- **AI 视频领域**：Sora 等开创性大模型以 Transformer 架构为基础。
- **大模型领域**：DeepSeek、GPT-4o、Llama 等主流大模型全面采用 Transformer 架构。
- **AI 多模态领域**：Transformer 的跨模态对齐能力打通了视觉、语言、语音等信息壁垒，成为多模态模型的基石。
- **传统深度学习领域**：图像分类（ViT）、图像分割（SAM）、目标检测（GroundingDINO）、自动驾驶（BEVFormer）等均以 Transformer 为核心。

**深度思考：Transformer 的"大一统"趋势意味着什么？**

统一的模型架构 + 海量数据 + 坚实算力，这三者的结合正在推动 AI 向 AGI 初级阶段迈进。当所有模态的数据都可以被 Token 化并统一处理时，模型的泛化能力将得到质的飞跃。这也是为什么 GPT-4o 能够同时处理文本、图像、语音的根本原因——它们在 Transformer 的视角下，本质上都是"Token 序列"。

---

### 三、Transformer 输入端：Token 化思想的深远价值

Transformer 的输入端思想是整个架构中最具前瞻性的设计之一：**将所有不同模态的数据 Token 化，进行特征对齐**，从而为 AI 模型的性能爆发打下坚实基础。

#### 3.1 单词 Embedding（Token Embedding）

文本数据由离散的单词或子词组成，需要通过嵌入层（可采用 Word2Vec、GloVe 等预训练算法，也可在 Transformer 中训练得到）将其映射到固定维度的连续向量空间。

以句子 "We love WeThinkIn" 为例，假设词嵌入维度 d_model = 512，则每个单词被映射为一个 512 维向量，三个单词组合成形状为 3×512 的特征矩阵。

#### 3.2 位置 Embedding（Positional Encoding）

由于 Transformer 不采用 RNN 的时序结构，无法自然感知单词顺序，因此需要显式地为每个位置添加位置信息。原生 Transformer 采用正弦和余弦函数计算位置编码：

```
// 代码块
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

```

其中 pos 为单词在句子中的位置，i 为维度索引，d 为 PE 的维度。

这种设计有两大优势：

1. **增强扩展性与泛化性**：可以为训练集中未见过的长序列位置生成编码，不受训练集最大长度限制。
2. **捕捉相对位置信息**：正弦和余弦函数的周期性使得 PE(pos+k) 可以由 PE(pos) 线性表示，帮助模型理解序列中的相对位置关系。

最终，将词 Embedding 与位置 Embedding 相加，得到 Transformer 的完整输入表示：

```
// 代码块
Input Representation = Embedding + Positional Encoding

```

#### 3.3 AIGC 时代的多模态大一统

在 AIGC 时代，Token 化思想被推广到所有模态：图像、视频、文本、音频、3D 数据都可以被 Token 化，从而形成统一的多模态模型。这是 Transformer 能够在 AIGC 时代继续繁荣的根本原因。

**深度思考：Token 化是 AI 多模态的"通用语言"**

Token 化的本质是将不同模态的信息压缩到同一个语义空间中。当图像被切分为 Patch Token、视频被切分为时空 Token、音频被切分为频谱 Token 时，Transformer 的注意力机制就可以在这些 Token 之间自由地建立关联。这种设计的深远意义在于：它为 AI 系统提供了一种"通用语言"，使得跨模态的知识迁移和联合学习成为可能。

---

### 四、Self-Attention（自注意力）机制：Transformer 的核心引擎

#### 4.1 自注意力机制的本质

注意力机制的核心思想是**动态分配权重**，根据输入的不同部分对当前任务的重要程度进行加权处理。Self-Attention 使用矩阵 Q（查询）、K（键值）、V（值）进行计算，这三个矩阵均由输入特征矩阵 X 通过线性变换得到：

```
// 代码块
Q = XW^Q
K = XW^K
V = XW^V

```

其中 W^Q, W^K, W^V 为可学习的权重矩阵，维度为 d_model × d_k。

#### 4.2 Self-Attention 的计算过程

Self-Attention 的输出（Scaled Dot-Product Attention）计算公式为：

```
// 代码块
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V

```

**逐步拆解：**

1. **计算 QK^T**：Q 与 K 的转置做点积，得到 n×n 的相关性矩阵，表示序列中每个位置之间的注意力强度。其本质是 X 矩阵中每行向量与其他向量的内积，内积越大说明两个向量相关度越高。
2. **缩放因子 1/sqrt(d_k)**：防止点积值过大导致 Softmax 分布过于陡峭，从而引发梯度消失。假设 Q、K 均值为 0、方差为 1，则 QK^T 的方差为 d_k，除以 sqrt(d_k) 后方差恢复为 1，使训练过程中梯度保持稳定。
3. **Softmax 归一化**：对每一行进行归一化，得到每个单词对其他所有单词的注意力权重（权重之和为 1）。
4. **加权求和 V**：用注意力权重对 V 矩阵加权求和，得到最终输出 Z。每个位置的输出向量是所有位置的值向量的加权组合，权重由注意力分数决定。

#### 4.3 Multi-Head Attention（多头注意力）机制

Multi-Head Attention 是 Self-Attention 的上层建筑，通过并行计算多个注意力头，使模型能够从不同的表示子空间中捕获信息。

**完整计算流程：**

1. **线性映射**：将输入 X 通过线性变换得到 Q、K、V 矩阵。
2. **划分头**：将 Q、K、V 划分为 h 个头，每个头的维度为 d_k = d_model / h。
3. **并行计算注意力**：对每个头独立计算注意力输出：head_i = Attention(Q_i, K_i, V_i)。
4. **拼接结果**：将所有头的输出拼接：Concat = [head_1; head_2; ...; head_h]。
5. **最终线性映射**：Output = Concat · W^O，得到与输入维度相同的输出矩阵。

完整公式为：

```
// 代码块
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W^O
head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)

```

**多头注意力的优势：**

- **捕获多样性特征**：多个头从不同子空间学习，捕获输入序列中丰富的特征。
- **提升模型性能**：在实践中证明能够提升各类任务的性能。
- **稳定训练过程**：分散注意力机制，减轻单个注意力头可能出现的过拟合问题。

**深度思考：多头注意力的"集体智慧"**

可以将多头注意力理解为一个"专家委员会"：每个头是一位专家，专注于输入信息的不同方面（如语法关系、语义相似性、指代关系等）。单个专家的判断可能有偏差，但多位专家的综合意见往往更加全面和准确。这种设计哲学与集成学习（Ensemble Learning）有异曲同工之妙，但 Transformer 通过并行计算实现了更高的效率。

---

### 五、Transformer Encoder 结构详解

Transformer 的 Encoder Block 主要由三个核心组件构成：**Multi-Head Attention**、**Add & Norm 层**、**Feed Forward 层**。

#### 5.1 Add & Norm 层

Add & Norm 层由残差连接（Residual Connection）和层归一化（Layer Normalization）组成：

```
// 代码块
Output = LayerNorm(X + SubLayer(X))

```

- **Add（残差连接）**：将子层的输入与输出相加，缓解深层网络中的梯度消失问题，促进信息的直接传播。这一设计借鉴自 ResNet，是深度网络训练的关键技巧。
- **Norm（Layer Normalization）**：对每一层神经元的输入进行归一化（均值为 0，方差为 1），加快训练收敛，稳定训练过程。公式为：LayerNorm(X) = (X - μ) / σ · γ + β，其中 γ 和 β 为可学习参数。

#### 5.2 Feed Forward 层

前馈神经网络（FFN）是一个两层全连接层：

```
// 代码块
FFN(X) = max(0, XW_1 + b_1) * W_2 + b_2

```

第一层使用 ReLU 激活函数引入非线性，增强模型的表达能力；第二层不使用激活函数，对每个位置的向量独立进行变换。FFN 的输出维度与输入 X 一致。

#### 5.3 Encoder 完整工作流程

```
// 代码块
输入 → [多头自注意力] → [残差连接和层归一化] → [前馈神经网络] → [残差连接和层归一化] → 输出

```

多个 Encoder Block 堆叠，第一个 Block 的输入为词向量矩阵，后续 Block 的输入为前一个 Block 的输出，最后一个 Block 的输出即为编码信息矩阵 C，供 Decoder 使用。

**Encoder 的核心特点：**

- **并行计算**：不依赖时序，可对整个序列并行计算，大幅提升训练效率。
- **长距离依赖**：自注意力机制直接捕获任意两个位置之间的依赖关系，无论距离多远。
- **可解释性**：注意力权重提供了模型决策过程中关注哪些部分的线索。

---

### 六、Transformer Decoder 结构详解

Transformer 的 Decoder Block 由三个主要子层构成：

1. **掩码多头自注意力机制（Masked Multi-Head Self-Attention）**
2. **编码器-解码器注意力机制（Encoder-Decoder Attention）**
3. **前馈神经网络（Feed-Forward Neural Network）**

每个子层后同样添加了残差连接和层归一化。

#### 6.1 Masked Multi-Head Attention（掩码多头自注意力）

在翻译过程中，模型在生成第 t 个词时，只能依赖已生成的词（第 1 到第 t-1 个词）。Masked Multi-Head Attention 通过**上三角掩码矩阵**实现这一约束：对角线以上的元素设为负无穷大，经过 Softmax 后变为 0，从而防止模型"偷看"未来信息。

**完整计算公式：**

```
// 代码块
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k) + Mask) * V

```

其中 Mask 为上三角掩码矩阵。

在训练时，Decoder 可以使用 **Teacher Forcing** 技术并行化训练：将正确的单词序列（如 `<Begin> I have a cat`）和对应输出（`I have a cat <end>`）同时传入，通过 Mask 操作确保每个位置只能看到之前的信息。

#### 6.2 Encoder-Decoder Attention（编码器-解码器注意力）

Decoder 的第二个 Multi-Head Attention 与常规 Multi-Head Attention 的主要区别在于：**K、V 矩阵来自 Encoder 的编码信息矩阵 C，而 Q 来自上一个 Decoder Block 的输出**。

```
// 代码块
Q_dec = X_dec * W^Q
K_enc = X_enc * W^K
V_enc = X_enc * W^V

Attention(Q_dec, K_enc, V_enc) = softmax(Q_dec * K_enc^T / sqrt(d_k)) * V_enc

```

这样设计的好处是：Decoder 中每一个位置的单词都可以利用 Encoder 所有单词的信息（无需 Mask），实现了源语言与目标语言之间的信息交互。

#### 6.3 Softmax 预测输出

Decoder Block 最后通过 Softmax 层预测下一个单词的概率分布，由于 Mask 的存在，每个位置的输出只包含该位置及之前位置的信息，从而实现自回归生成。

#### 6.4 Decoder 完整工作流程

```
// 代码块
输入 → [掩码多头自注意力] → [残差连接和层归一化]
     → [编码器-解码器注意力] → [残差连接和层归一化]
     → [前馈神经网络] → [残差连接和层归一化] → 输出

```

**Decoder 的核心特点：**

- **自回归生成**：通过掩码多头自注意力，在生成序列时只依赖已生成的词。
- **全局信息交互**：编码器-解码器注意力使 Decoder 能够关注 Encoder 输出的任意位置。
- **训练并行、推理串行**：训练时可并行计算（Teacher Forcing），推理时由于自回归性质需逐步生成。

---

### 七、Transformer 原理总结

| 核心特性 | 说明 |
| --- | --- |
| 并行训练 | 不依赖时序递推，整个序列可并行计算，训练效率远高于 RNN |
| 位置编码 | 不能自然感知顺序，需显式添加位置 Embedding，否则退化为词袋模型 |
| Self-Attention | 核心思想，使用 Q、K、V 矩阵捕捉序列中任意位置间的依赖关系 |
| Multi-Head Attention | 多个 Self-Attention 并行，从不同子空间捕获多维度的注意力信息 |
| Encoder-Decoder 架构 | Encoder 提取源序列特征，Decoder 自回归生成目标序列 |
| Masked Attention | Decoder 中防止信息泄露，确保生成时只依赖历史信息 |

---

### 八、深度思考：Transformer 的历史地位与未来展望

#### 8.1 Transformer 为何能成为 AI 的"基础设施"？

Transformer 的成功并非偶然，它在设计上具有几个关键的"正确选择"：

**选择注意力而非递推**：RNN 的时序依赖限制了并行化，而 Transformer 的全局注意力机制天然支持并行，使其能够充分利用现代 GPU/TPU 的并行计算能力。

**选择可学习的特征交互**：相比 CNN 的局部感受野，Self-Attention 允许任意两个位置直接交互，捕获长距离依赖，这在语言理解和生成任务中至关重要。

**选择模块化设计**：Encoder-Decoder 架构、残差连接、层归一化等设计使得 Transformer 易于扩展和修改，催生了 BERT（仅 Encoder）、GPT（仅 Decoder）、T5（Encoder-Decoder）等一系列变体。

#### 8.2 Transformer 的局限性与改进方向

尽管 Transformer 取得了巨大成功，但它并非没有局限：

**计算复杂度**：Self-Attention 的计算复杂度为 O(n²)，对于超长序列（如长文档、高分辨率图像）计算代价极高。这催生了 Sparse Attention、Linear Attention、Flash Attention 等一系列优化方案。

**位置编码的局限**：原始的正弦位置编码在处理超长序列时泛化能力有限，后续出现了 RoPE（旋转位置编码）、ALiBi 等更先进的位置编码方案，被 LLaMA、GPT-NeoX 等大模型广泛采用。

**推理效率**：自回归解码的串行性质使得推理速度较慢，KV Cache、Speculative Decoding 等技术应运而生。

#### 8.3 从 Transformer 看 AI 发展的底层逻辑

Transformer 的成功揭示了一个深刻的规律：**通用架构 + 规模扩展 + 数据驱动**，是当前 AI 发展的核心范式。当一个架构足够通用、足够可扩展时，随着算力和数据的增长，模型能力会呈现出令人惊叹的涌现（Emergence）现象。

这也意味着，未来 AI 的竞争，在架构层面的差异化空间正在收窄，而在数据质量、训练效率、应用场景的深度理解上，将成为新的核心竞争力。

---

### 九、参考资源

- 原文链接：[深入浅出完整解析AIGC时代Transformer核心基础知识](https://zhuanlan.zhihu.com/p/709874399)
- Transformer 核心论文：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- Transformer 官方项目库：[https://github.com/huggingface/transformers](https://github.com/huggingface/transformers)
- Transformer 视频讲解：李宏毅老师讲解 Transformer
- The Illustrated Transformer：[https://jalammar.github.io/illustrated-transformer/](https://jalammar.github.io/illustrated-transformer/)