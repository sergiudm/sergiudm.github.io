# Refactor RWKV Part 2 Tone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the tone of the "So what?" section in the RWKV Part 2 blog post from "I am the developer" to "We are researchers/guides exploring this together".

**Architecture:** This is a content-only refactor of a Markdown file. We will follow TDD by verifying the content before and after the change.

**Tech Stack:** Markdown, Git

---

### Task 1: Verify Current Content

**Files:**
- Modify: `content/post/RWKV2/index.md`

- [ ] **Step 1: Write a script to verify the current content**

```bash
grep -F "> **Spoiler:** What if we have a causal mask? Standard matrix associativity breaks down with causal masking in a way that makes naive parallelization difficult. RWKV solves this, as we will see in the [next post](https://sergiudm.github.io/p/rwkv3/)." content/post/RWKV2/index.md
```

- [ ] **Step 2: Run the script to verify it passes**

Run: `grep -F "> **Spoiler:** What if we have a causal mask? Standard matrix associativity breaks down with causal masking in a way that makes naive parallelization difficult. RWKV solves this, as we will see in the [next post](https://sergiudm.github.io/p/rwkv3/)." content/post/RWKV2/index.md`
Expected: The exact line is printed.

---

### Task 2: Refactor the "So what?" section

**Files:**
- Modify: `content/post/RWKV2/index.md`

- [ ] **Step 1: Apply the tone refactor**

Replace:
```markdown
> **Spoiler:** What if we have a causal mask? Standard matrix associativity breaks down with causal masking in a way that makes naive parallelization difficult. RWKV solves this, as we will see in the [next post](https://sergiudm.github.io/p/rwkv3/)."
```
With:
```markdown
> **Spoiler:** What if we have a causal mask? Standard matrix associativity breaks down with causal masking in a way that makes naive parallelization difficult. The RWKV architecture introduces an elegant solution to this, as we will see in the [next post](https://sergiudm.github.io/p/rwkv3/)."
```

- [ ] **Step 2: Verify the change**

Run: `grep -F "> **Spoiler:** What if we have a causal mask? Standard matrix associativity breaks down with causal masking in a way that makes naive parallelization difficult. The RWKV architecture introduces an elegant solution to this, as we will see in the [next post](https://sergiudm.github.io/p/rwkv3/)." content/post/RWKV2/index.md`
Expected: The new line is printed.

- [ ] **Step 3: Commit the change**

```bash
git add content/post/RWKV2/index.md
git commit -m "docs: refactor RWKV Part 2 tone to researcher perspective"
```
