---
title: "The Evolution of RWKV(part 2)"
date: 2025-04-04 00:00:00+0000
slug: "RWKV"
draft: false
weight: 1
description: "A deep dive into the RWKV v4 architecture."
tags: 
    - "RWKV"
    - "lienar attention"
    - "RNN"
image: "image.png"
categories: ["Research"]
---

# [Linear Attention](https://arxiv.org/abs/2006.16236) Basics
In the [previous "boring" post](https://sergiudm.github.io/p/rwkv/), we discussed the traditional softmax attention mechanism and its limitations, particularly in terms of $O(n^2)$ computation cost during inference. We also reviewed the "age-old" RNNs, which have $O(n)$ computation cost but struggle to be trained in parallel.

Now, let's see something interesting: 
- Attention without softmax = RNN
- RNN with rank-1 hidden matrix and no reflection = Attention

**This is wild!!!**

## Dereivation
### attention -> RNN
Let's start with the softmax attention mechanism:
$$
\text{Attn}(t)=\sum_{i=1}^{n} \frac{\exp(\mathbf{q_t k_i^T})}{\sum_{j=1}^{n} \exp(\mathbf{q_t k_j^T})} \mathbf{v}_i
$$
Without the softmax, we have:
$$
\text{Attn}(t)=\sum_{i=1}^{n} \frac{\mathbf{q_t k_i^T}}{\sum_{j=1}^{n} \mathbf{q_t k_j^T}} \mathbf{v}_i
=\frac{\mathbf{q}_t\sum_{i=1}^{n}\mathbf{k}_i^T\mathbf{v}_i}{\mathbf{q}_t\sum_{j=1}^{n} \mathbf{k}_j^T}
$$

Let $\mathbf{S}_t=\sum_{i=1}^{n-1}\mathbf{k}_i^T\mathbf{v}_i$ and $\mathbf{Z}_t=\sum_{j=1}^{n-1} \mathbf{k}_j^T$, we have:
$$
\begin{align*}
\mathbf{S}_t &= \mathbf{S}_{t-1} + \mathbf{k}_{t}^T\mathbf{v}_{t} \\
\mathbf{Z}_t &= \mathbf{Z}_{t-1} + \mathbf{k}_{t}^T \\
\mathbf{O}_t &=\frac{\mathbf{q}_t \mathbf{S}_t}{\mathbf{q}_t \mathbf{Z}_t} = \text{Attn}(t)
\end{align*}
$$
Which is a linear RNN!

### RNN -> attention
Now, let's start with a simple RNN:
$$
\mathbf{h}_t = \mathbf{h}_{t-1} \mathbf{W}_{h} + f_I(\mathbf{x}_t)
$$
$$
\mathbf{y}_t = f_O(\mathbf{h}_t)
$$
where $f(\mathbf{x}_t) = (\mathbf{x}_t \mathbf{W}_k)^T (\mathbf{x}_t \mathbf{W}_v) = \mathbf{k}_t^T \mathbf{v}_t \in \mathbb{R}^{d \times d}$ , $\mathbf{W}_h = \mathbf{I}$, and $f_O(\mathbf{h}_t) = \mathbf{q}_t \mathbf{h}_t = \mathbf{x}_t \mathbf{W}_q \mathbf{h}_t$.

Now, the hidden state is no longer a vector, but a $d \times d$ rank-1 matrix. Together with another hidden state $\mathbf{k}_t$, we can rewrite the RNN as:
$$
\mathbf{H}_t = \mathbf{H}_{t-1} + \mathbf{k}_t^T \mathbf{v}_t
$$
$$
\mathbf{O}_t = \mathbf{q}_t \mathbf{H}_t
$$
Unfolding the RNN, we have:
$$
\begin{align*}
\mathbf{O}_t 
&= \mathbf{q}_t (\mathbf{H}_{t-1} +  \mathbf{k}_t^T \mathbf{v}_t) \\
&= \mathbf{q}_t (\mathbf{H}_{t-2} +  \mathbf{k}_{t-1}^T \mathbf{v}_{t-1}) + \mathbf{q}_t \mathbf{k}_t^T \mathbf{v}_t \\
&= \mathbf{q}_t (\mathbf{H}_{t-3} +  \mathbf{k}_{t-2}^T \mathbf{v}_{t-2}) + \mathbf{q}_t \mathbf{k}_{t-1}^T \mathbf{v}_{t-1} + \mathbf{q}_t \mathbf{k}_t^T \mathbf{v}_t \\
&= \cdots \\
&= \sum_{i=1}^{t} \mathbf{q}_t \mathbf{k}_i^T \mathbf{v}_i
\end{align*}
$$
This is the attention output (linear combination of value vectors)!

## So what?
What an exciting result! It allows us to train our models in "attention" mode, and then switch to "RNN" mode for inference. But wait, there's more! Take a look at the "attention" formula:
$$
\text{Attn}(t)
=\frac{\mathbf{q}_t\sum_{i=1}^{n}\mathbf{k}_i^T\mathbf{v}_i}{\mathbf{q}_t\sum_{j=1}^{n} \mathbf{k}_j^T}
$$
The term $\sum_{i=1}^{n}\mathbf{k}_i^T\mathbf{v}_i$ and $\sum_{j=1}^{n} \mathbf{k}_j^T$ are independent of the current token $t$. This means that we can pre-compute these terms and store them in a cache, allowing us to compute the attention output in $O(1)$ time at each time step. Therefore, the total computation cost for processing a sequence of length $n$ is $O(n)$, which is much more efficient than the traditional softmax attention mechanism.
> Another view of this is that when we drop the softmax, instead of computing $(\mathbf{Q}\mathbf{K}^T)\mathbf{V}$, which takes $O(n^2d)$ multiplications, we compute $\mathbf{Q}(\mathbf{K}^T\mathbf{V})$, which takes $O(nd^2)$ multiplications.

>Spoiler: what if we have a causal mask? See the [next post](https://sergiudm.github.io/p/rwkv3/) for more details.

# Attention Free Transformer
Before we see the RWKV architecture, it's worth paying a glance at the [attention-free transformer](https://arxiv.org/abs/2105.14103) (AFT), since it provides insight into the RWKV architecture.

### AFT-Simple
Firstly, let's see the AFT-simple architecture:
$$
\mathbf{y}_t = \frac{\sigma_q(\mathbf{q}_t) \odot \sum_{j=1}^{N}\exp(\mathbf{K}_j)\odot \mathbf{v}_j}{\sum_{j=1}^{N} \exp(\mathbf{K}_j)}
$$
where $\sigma_q(\mathbf{q}_t)$ is a non-linear function(sigmoid as default) of the query vector $\mathbf{q}_t$, $\odot$ denotes element-wise multiplication, and the division is also element-wise.

With the knowledge of linear attention, now we can see that the values of $\sum_{j=1}^{N}\exp(\mathbf{K}_j)\odot \mathbf{v}_j$ and $\sum_{j=1}^{N} \exp(\mathbf{K}_j) \in \mathbb{R}^d$ are independent of $t$, thus can be cached to save computation cost. Furthermore, all operations are element-wise, the hidden state reduces to a vector, and the computation cost is $O(n)$.

The RNN form of AFT-Simple is:
$$
\mathbf{S}_t = \mathbf{S}_{t-1} + \exp(\mathbf{K}_t) \odot \mathbf{v}_t
$$
$$
\mathbf{Z}_t = \mathbf{Z}_{t-1} + \exp(\mathbf{K}_t)
$$
$$
\mathbf{y}_t = \sigma_q(\mathbf{q}_t) \odot \frac{\mathbf{S}_t}{\mathbf{Z}_t}
$$
### AFT-Full
AFT-Full introduces a learable "pair-wise position bias" to AFT-Simple:
$$
\mathbf{y}_t = \frac{\sigma_q(\mathbf{q}_t) \odot \sum_{j=1}^{N}\exp(\mathbf{K}_j+w_{t,j})\odot \mathbf{v}_j}{\sum_{j=1}^{N} \exp(\mathbf{K}_j+w_{t,j})}
$$
where $w_{t,j} \in \mathbb{R}$ is the learnable position bias for the $j$-th token at time step $t$. Together they form a $N \times N$ matrix. The interpretation of this is that $\exp(\mathbf K_j+w_{t,j})\odot \mathbf{v}_j=\exp(w_{t,j})\exp(\mathbf K_j)\odot \mathbf{v}_j$, therefore $w_{t,j}$ acts like an input gate for the $j$-th token at $t$.

Note that the AFT-Full architecture cannot be unfolded into a RNN, since the position bias $w_{t,j}$ is not independent of $t$. And the computation cost is still $O(n)^2$.

# RWKV v4
Finally, we are ready to see the RWKV v4 architecture. The RWKV v4 architecture starts with the AFT-Full architecture, 