---
title: "The Evolution of RWKV(part 3)"
date: 2025-04-05 00:00:00+0000
slug: "RWKV"
draft: false
weight: 1
description: "Introduce RWKV v5 and v6."
tags: 
    -"RWKV"
    -"lienar attention"
    -"RNN"
image: "image.png"
categories: ["Research"]
---
## Problem
However, there is a problem with this approach. For autoregressive tasks, e.g., GPT, we need to apply a causal mask to the attention output, which make the associativity property of the attention output no longer hold. In details, the attention output is computed as:
$$
\text{Attn}(t)
=\frac{\mathbf{q}_t\sum_{i=1}^{t}\mathbf{k}_i^T\mathbf{v}_i}{\mathbf{q}_t\sum_{j=1}^{t} \mathbf{k}_j^T}
$$
Notice the change in the upper limit of the summation. This means that we cannot pre-compute the terms $\sum_{i=1}^{t}\mathbf{k}_i^T\mathbf{v}_i$ and $\sum_{j=1}^{t} \mathbf{k}_j^T$ and store them in a cache, as they depend on the current token $t$. 