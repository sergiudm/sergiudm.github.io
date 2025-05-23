---
title: "The Evolution of RWKV (Part 3)"
date: 2025-04-14 00:00:00+0000
draft: true
weight: 1
description: "Introduce RWKV v5 and v6."
tags: 
    - "RWKV"
    - "lienar attention"
    - "RNN"
image: "image.png"
categories: ["Research"]
---
# One thing about linear attention

$$
\text{Attn}(t)
=\frac{\mathbf{q}_t\sum_{i=1}^{t}\mathbf{k}_i^T\mathbf{v}_i}{\mathbf{q}_t\sum_{j=1}^{t} \mathbf{k}_j^T}
$$
Notice the change in the upper limit of the summation. This means that we cannot pre-compute the terms $\sum_{i=1}^{t}\mathbf{k}_i^T\mathbf{v}_i$ and $\sum_{j=1}^{t} \mathbf{k}_j^T$ and store them in a cache, as they depend on the current token $t$. 