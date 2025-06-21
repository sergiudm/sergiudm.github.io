---
title: "The Evolution of RWKV (Part 3)"
date: 2025-04-14 00:00:00+0000
weight: 1
description: "Introduce RWKV v5 and v6."
tags: 
    - "RWKV"
    - "linear attention"
image: "image.png"
categories: ["Research"]
---
In the [last part of our journey](https://sergiudm.github.io/p/the-evolution-of-rwkv-part-2/), we saw how RWKV evolved from an unstable experiment (v2) into a robust and powerful architecture (v4). The key breakthrough in v4 was the **time-shift** and mechanism and the `wkv` operation, which brilliantly allowed a model with an RNN's soul to be trained with a Transformer's parallelism. It was a monumental step, proving that you could have the best of both worlds: efficient O(1) inference and scalable, parallel training.

But once you’ve solved a problem like parallelism, a new, more ambitious question arises: **Is it possible to make it *even smarter*?**

The AI research landscape was buzzing with this question. The goal was no longer just efficiency; it was about increasing the model's **expressive power** to truly rival the quadratic attention of a full Transformer.

This is the story of RWKV-5 (Eagle) and RWKV-6 (Finch): the evolution from a clever linear RNN into a sophisticated model with deep, dynamic memory.

## RWKV-5 (Eagle): From Flat Vectors to Rich Matrices

Before we dive into RWKV-5, let’s recap the core idea of RWKV-4. 

The state of an RWKV-4 layer, the `wkv` state, is a vector. At each step, we update this vector by adding the new information (`k*v`) and decaying the old state. It’s effective, but it’s also a bottleneck. All the rich, multi-faceted information from past tokens gets compressed into a single, flat vector for each channel.

**The core insight of RWKV-5 was to upgrade this state from a vector to a matrix.**

What does this actually mean? Let’s unpack the change.

*   In **RWKV-4**, the state update is conceptually $s_t = w * s_{t-1} + k_t * v_t$. The state `s` is a vector.
*   In **RWKV-5**, the state update becomes $S_t = \text{diag}(w) * S_{t-1} + k_t^T * v_t$. Notice the capital `S`—our state is now a matrix.

This isn't just a minor change in shape; it's a fundamental shift in how the model remembers things. The new $k_t^T * v_t$ operation creates an **outer product**, resulting in a rank-1 matrix. This matrix is then added to the existing state matrix $S$.

Think of it like this:

> The RWKV-4 vector state is like a single, running summary of a conversation. You keep updating the summary with new points.
>
> The RWKV-5 matrix state is like a **full ledger or a memory bank**. Each row of the matrix can be seen as a separate "memory slot." The `k` (key) vector acts as an **address**, directing *which memory slots* the current `v` (value) vector should be written to.

This "matrix-valued state" allows the model to store and access past information in a much more structured and disentangled way. A single head can now maintain multiple, parallel streams of information from the past, each decaying at its own channel-specific rate. This drastically increases the model's capacity to handle complex, interwoven patterns in data without losing its linear-time recurrence.

Alongside this, RWKV-5 introduced other refinements:
*   A better gating mechanism (`SiLU` on the attention output) for cleaner signal flow.
*   Improved parameter initializations for more stable training starts.

With these changes, Eagle (RWKV-5) wasn't just an incremental update. It was a foundational upgrade to the model's "brain," giving it a richer, deeper memory to draw upon. Benchmark results confirmed this: Eagle significantly outperformed RWKV-4 across the board, especially on tasks requiring complex reasoning.

## RWKV-6 (Finch): Making Memory Itself Context-Aware

Eagle gave our model a better memory structure. The next logical step was to make that memory *smarter*.

In all previous versions of RWKV, the time-decay parameter `w` was a **fixed, learned vector**. Once training was done, each channel had a predetermined decay rate. A channel was either designated for "short-term memory" (high decay) or "long-term memory" (low decay), and it stuck with that role for the entire sequence, no matter the context.

But what if the model could *decide* how much to forget on the fly? What if it could say, "This is the start of a new topic, I should forget the previous paragraph," or, "This is a critical detail, I must remember it for a long time"?

This is the groundbreaking idea behind **RWKV-6 (Finch): Dynamic Recurrence.**

Finch makes the time-decay parameter `w` **data-dependent**. Instead of being a static value, `w` becomes `w_t`—it is calculated at each and every time step, based on the current input `x_t`.

How is this done efficiently? We took inspiration from Low-Rank Adaptation (LoRA). We use a small, data-dependent function to produce an "offset" that modifies the base time-decay vector.

$$
w_t = \text{base_decay} + \text{LoRA}(x_t)
$$

This is a profound change. It gives the model a **dynamic memory management system**.

> Imagine the time decay `w` as a "Forget-Me-Not" flower for each channel.
>
> In RWKV-4 and v5, each flower is either genetically predisposed to wilt quickly or to last a long time.
>
> In RWKV-6, each flower can look at the "weather" (the current input token) and decide for itself whether to wilt (forget) or bloom stronger (remember).

This allows for incredibly flexible behavior. The model can learn to:
*   **Reset its state:** When it encounters a sentence or document boundary, it can learn to generate a high `w_t` (strong decay) to flush its memory and start fresh.
*   **Preserve context:** During a long, coherent passage, it can learn to generate a low `w_t` (weak decay) to maintain context over thousands of tokens.

Finch also made the token-shift mechanism data-dependent, allowing the model to dynamically decide how much of the previous token's representation to mix in. Every core component of the recurrence became adaptive.

### The Journey Continues

The evolution from RWKV-4 to v6 marks a shift in our core mission. We started by reinventing the RNN to match the Transformer's training paradigm. Now, we are pushing the boundaries of what recurrent models can do, creating architectures with unique capabilities that are not just "efficient alternatives" but powerful systems in their own right.

*   **RWKV-4** gave us parallel training.
*   **RWKV-5 (Eagle)** gave us a richer, matrix-based state.
*   **RWKV-6 (Finch)** gave us dynamic, context-aware memory.

Each step has been a leap in expressivity and performance, bringing us closer to a model that combines the theoretical elegance of recurrence with the raw power of modern deep learning. The journey is far from over, but with each evolution, the potential of this architectural path becomes clearer and more exciting.