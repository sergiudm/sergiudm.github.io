---
title: "The Evolution of RWKV"
date: 2025-04-4 21:00:00+0000
slug: "RWKV"
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
This is a series of posts about the RWKV architecture. The RWKV architecture is a novel neural network architecture that combines the strengths of recurrent neural networks (RNNs) and linear attention mechanisms. In this series, I will explore the design and implementation of the RWKV architecture, as well as its applications in natural language processing and other domains.

# Before we go: traditional dot-product attention
Talk is cheap, show me the formula. Here is the formula for the dot-product attention mechanism:
$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

# First Step: AFT
The first step in the RWKV architecture is the attention-free transformer (AFT) layer. The AFT layer is a novel type of transformer layer that does not use attention mechanisms to compute the interactions between tokens in a sequence. Instead, the AFT layer uses a set of learnable parameters to compute the interactions between tokens in a sequence, which allows it to capture long-range dependencies more efficiently than traditional attention mechanisms.

# RWKV v1
