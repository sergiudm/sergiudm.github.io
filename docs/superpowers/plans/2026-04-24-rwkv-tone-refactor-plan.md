# RWKV Part 1 Tone Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the tone of "The Evolution of RWKV (Part 1)" from "I am the developer" to "We are researchers/guides exploring this together".

**Architecture:** A text refactoring using `replace` for surgical updates on `content/post/RWKV/index.md`.

**Tech Stack:** Markdown, shell commands (grep)

---

### Task 1: Update Overview Framing

**Files:**
- Modify: `content/post/RWKV/index.md`

- [ ] **Step 1: Write the failing test (Verify old text exists)**

Run: `grep "In this series, I will dissect the design and implementation of RWKV" content/post/RWKV/index.md`
Expected: 1 match.

- [ ] **Step 2: Implement the change**

Use the `replace` tool to replace the exact sentence:

**Old String:**
```markdown
In this series, I will dissect the design and implementation of RWKV. Along the journey, I will also discuss how it relates to other emerging architectures, such as [GLA](https://arxiv.org/abs/2312.06635) and [DeltaNet](https://arxiv.org/abs/2406.06484).
```

**New String:**
```markdown
In this series, we will explore the design and implementation of RWKV. Along the journey, we will also discuss how it relates to other emerging architectures, such as [GLA](https://arxiv.org/abs/2312.06635) and [DeltaNet](https://arxiv.org/abs/2406.06484).
```

- [ ] **Step 3: Run the test to verify it passes (Verify new text exists and old text is gone)**

Run: `grep "In this series, we will explore the design and implementation of RWKV" content/post/RWKV/index.md`
Expected: 1 match.
Run: `grep "In this series, I will dissect the design and implementation of RWKV" content/post/RWKV/index.md`
Expected: 0 matches.

### Task 2: Verify and Commit

**Files:**
- Test: `content/post/RWKV/index.md`

- [ ] **Step 1: Verify the "O(n) mean RNNs are superior?" section tone**

Run: `grep "In the next post, we will explore" content/post/RWKV/index.md`
Expected: 1 match.

- [ ] **Step 2: Final pass to ensure no rogue "I " or "my " remain (context dependent)**

Run: `grep -Ei "\b(I|my)\b" content/post/RWKV/index.md`
Expected: No matches for author perspective "I". (Might match indices like $i$).

- [ ] **Step 3: Commit the changes**

```bash
git add content/post/RWKV/index.md
git commit -m "docs: refactor RWKV Part 1 tone to researcher perspective"
```
