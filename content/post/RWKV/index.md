---
title: "The Evolution of RWKV(part 1)"
slug: "RWKV"
date: 2025-04-03 21:00:00+0000
weight: 1
description: "This is a series of posts about the RWKV architecture(From v4 to v7)"
image: "image.png"
categories:
    - "Research"
tags:
    - "RWKV"
    - "RNN"
    - "linear attention"
---

# Overview
This is a series of posts about the RWKV architecture. The RWKV architecture is a novel neural network architecture that combines the strengths of recurrent neural networks (RNNs) and linear attention mechanisms. In this series, I will explore the design and implementation of the RWKV architecture, and during the journey, I will also discuss the relationship between the RWKV architecture and other popular neural network architectures, such as [GLA](https://arxiv.org/abs/2312.06635) and [DeltaNet](https://arxiv.org/abs/2406.06484).

# Before we go: traditional softmax attention
Before we dive into the RWKV architecture, let's first review the traditional softmax attention mechanism, which is a key component of many modern neural network architectures, including transformers.
The attention mechanism allows the model to focus on different parts of the input sequence when making predictions. It computes a weighted sum of the input tokens, where the weights are determined by the similarity between the query and key vectors.

Given a sequence of $n$ tokens $\mathbf{x} = \begin{bmatrix} \mathbf{x}_1 \\ \mathbf{x}_2 \\ \vdots \\ \mathbf{x}_n \end{bmatrix} \in \mathbb{R}^{n \times d}$, the (non-causal) attention output can be expressed as:
$$
\text{Attention}(\mathbf{x}_t) = \sum_{i=1}^n \alpha(i,t)\mathbf{v}_i=\sum_{i=1}^{n} \frac{\text{sim}(\mathbf{q_t, k_i})}{\sum_{j=1}^{n} \text{sim}(\mathbf{q_t, k_j})} \mathbf{v}_i=\sum_{i=1}^{n} \frac{\exp(\mathbf{q_t^T k_i})}{\sum_{j=1}^{n} \exp(\mathbf{q_t^T k_j})} \mathbf{v}_i
$$
where $\mathbf{q}_t$, $\mathbf{k}_i$, and $\mathbf{v}_i$ are the query, key, and value vectors for the $t$-th token and the $i$-th token, respectively. The attention weights $\alpha(i,t)$ are computed using the softmax function, which normalizes the scores to sum to 1.

## Conputation cost
It is easy to see that the attention computation has a time complexity of $O(n^2)$, since for each token $t$, we need to compute the attention weights for **all** $n$ tokens. This can be a bottleneck for long sequences, as the computation time increases quadratically with the sequence length. (during inference, the cost is still $O(n^2)$ even if you apply the cache mechanism to speed up the computation.)

# RNNs
Unlike the attention mechanism, RNNs process sequences of tokens **one at a time**, maintaining a hidden state that is updated at each time step. The hidden state is computed using the previous hidden state and the current input token. The RNN can be expressed as:
$$
\mathbf{h}_t = f(\mathbf{W}_h \mathbf{h}_{t-1} + \mathbf{W}_x \mathbf{x}_t + \mathbf{b})
$$
$$
\mathbf{y}_t = g(\mathbf{W}_y \mathbf{h}_t + \mathbf{b}_y)
$$
where $\mathbf{h}_t$ is the hidden state at time step $t$, and $\mathbf{y}_t$ is the output at time step $t$. The function $f$ (and $g$) is typically a non-linear activation function. The matrices $\mathbf{W}_h$, $\mathbf{W}_x$, and $\mathbf{W}_y$ are the weight matrices for the hidden state, input, and output, respectively, and $\mathbf{b}$ and $\mathbf{b}_y$ are the bias vectors.

## Computation cost
Notice that the hidden state $\mathbf{h}_t$ is calculated only with the **previous** hidden state $\mathbf{h}_{t-1}$ and the current input token $\mathbf{x}_t$ instead of the entire $\{\mathbf{h_0,h_1,\ldots,h_{t-1}\}}$. This means that at each time step, the computation cost is $O(1)$ (we don't consider the dimension of the hidden state so far). Thus, the total computation cost for processing a sequence of length $n$ is $O(n)$, which is much more efficient than the attention mechanism for long sequences.

# Question: Does $O(n)$ mean that RNNs are better than softmax attention?
Unfortunately, the answer is **NO**. There are several reasons why RNNs are not as effective as softmax attention for long sequences, and some of the most important reasons include:

1. **Parallelization**: Although attention has a higher computation cost, it can be **parallelized** across all tokens in the sequence. For instance, to train out transformer neural network, given a sequence $\{\mathbf{x}_1,\mathbf{x}_2,\mathbf{x}_3\}$, we want to compute the attention output $\{\mathbf{y}_1,\mathbf{y}_2,\mathbf{y}_3\}$. Instead of computing $\mathbf{y}_1$ first and then $\mathbf{y}_2$, we can compute $\mathbf{y}_1$, $\mathbf{y}_2$, and $\mathbf{y}_3$ at the same time. After all, the attention output $\mathbf{y}_t$ is independent of the other tokens in the sequence. In contrast, RNNs process tokens sequentially, which means that the computation for later tokens must wait for the computation of earlier tokens to finish. This can lead to longer training time.

2. **Long-range dependencies**: RNNs struggle to capture long-range dependencies in sequences, especially when the sequences are very long. This is because the fixed size hidden state $\mathbf{h}_t$ is updated at each time step, and information from earlier tokens can be lost or diluted as it passes through the network. In contrast, attention mechanisms can directly access all tokens in the sequence, allowing them to capture long-range dependencies more effectively.

# Summary
In summary, while RNNs have a lower computation cost for processing sequences during inference, they are not as effective as attention mechanisms for capturing long-range dependencies and parallelizing computations during training. In the next post, we will explore the RWKV architecture and how it combines the strengths of both RNNs and attention mechanisms to achieve better performance on long sequences.

# References
- [Gated Linear Attention Transformers with Hardware-Efficient Training](https://arxiv.org/abs/2312.06635)
- [Parallelizing Linear Transformers with the Delta Rule over Sequence Length](https://arxiv.org/abs/2406.06484)