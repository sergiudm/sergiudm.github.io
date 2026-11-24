---
title: "Software in the Next 3 Years, Part 1: The Bottleneck Is Now the Interface"
description: "Models and harnesses keep improving. The links around the agent have not: you still talk to it in prose, and it still reads your apps through screenshots. That is the new bottleneck."
slug: "software-in-the-next-3-years"
date: 2026-11-11 09:00:00+0000
image: "cover.png"
showCover: false
categories:
    - "thoughts"
tags:
    - "AI agents"
    - "interface engineering"
    - "LaunchX"
    - "Schedule Everything"
---

Agents can do about ten times more than they could two years ago.{{< sidenote >}}By [METR's measure](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/), the length of task an agent can finish has doubled roughly every seven months since 2019. Two years of that is about 10x.{{< /sidenote >}} Are you ten times more productive? Probably not. And I don't think the model or the harness is what's holding you back anymore.
{.lead}

{{< figure src="gap.svg" dark="gap-dark.svg" size="wide" alt="An illustrative chart from 2023 to 2026. The line for what agents can do rises steeply. A dashed line for your productivity, if it had kept up, rises with it. The solid line for what you actually get done stays nearly flat, and a large question mark sits in the widening gap." caption="An illustration, not a measurement. This post is about the flat line." >}}

The gap is not only a feeling. In a [2025 randomized study by METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), experienced open-source developers took 19% longer with AI tools, while believing they had been 20% faster. The models have improved a lot since then, and I am not saying agents don't help. I am saying that what agents can do and what we get out of them are no longer growing at the same rate.

Nearly every improvement since ChatGPT came out has landed in two places: better models, and better harnesses around them (function calling, MCP, skills, subagents, memory, runs that go on for hours). This post is about the parts that did not improve, and why I think they are now the bottleneck.

## The bottleneck moved

In 2023, when an agent failed at a task, it was nearly always the agent's own fault. It called the wrong tool, looped on the same action, or simply lost the instructions. We complained about short context windows, poor instruction following, and clumsy harnesses. The bottleneck was the agent itself.

{{< figure src="pipeline-then.svg" dark="pipeline-then-dark.svg" size="wide" alt="2023: you write a prompt and read an answer, the agent executes a tool call or two on software and explores what the tools return. The agent is marked as the bottleneck: it lost the plan, repeated itself and stopped too early." caption="**2023.** You write a prompt and read an answer; the agent makes a tool call or two. The narrowest part of the pipeline is the agent itself." >}}

Thanks to the whole AI community, agents improved on every one of those fronts, and we got bolder about what we hand them: first code completion, then whole pull requests, then essays and slide decks. Lately, always-on assistants such as OpenClaw have started to work proactively, around the clock. Their developers want to automate as much as possible, so that all you have to do is write a prompt and read an answer.

Now look at what stayed the same in the picture. We still write prompts and read answers. The agent still works on software from the outside. The way we talk to agents is almost the same as in 2023, and so is the way agents reach our software. The bottleneck has moved from the middle to the two links. If you have ever rewritten a prompt three times, or skimmed a 900-word answer for the one line you needed, you have felt it. That is what puts most of us on the flat line in the first picture.

There is one exception, and it proves the rule: coding. Coding is the one domain that partly escaped the chat box. In Cursor you press <kbd>Tab</kbd> to accept the next edit, so your intent travels in one key, and the agent reads where you are from your cursor. When an agent changes code, you check its work in one glance at a `git diff`, and the tests check it for you. Both links are wide. Canvas and Artifacts brought a little of this to writing and small apps. I don't think it is a coincidence that coding agents feel magical, while agents that make slides, plan your week or drive desktop apps still feel clunky.

{{< figure src="pipeline-now.svg" dark="pipeline-now-dark.svg" size="wide" alt="2026: the agent, wrapped in a harness, plans, calls tools and works for hours. The two links are marked as bottlenecks. Between you and the agent, what you see has to become words and you read long answers. Between the agent and the software, screenshots, clicks and file reads burn tokens before the work starts." caption="**2026.** The agent grew and the pipes did not. More waits at each end than fits through, so the red has moved from the middle to the two links." >}}

Let's take the two links one at a time.

## Bottleneck 1: prose is bad at structure

Is a chat session good enough for talking to an agent? I don't think so.

Two kinds of information pass between you and an agent:

1. **Content**: what you actually care about. Which runs failed. Which task comes first.
2. **Structure**: how that content is organized. A list of runs, each with a status and a loss. A task with a priority and a due date.

Natural language is good at content and bad at structure. When you write a long prompt, much of the effort goes into spelling out structure, and structure barely changes from one prompt to the next. That is exactly why it can be turned into patterns.

The other direction is no better. An agent's answer is often long, and reading a long answer is slow and error-prone: you miss something, or you misread it. Try it:

{{< demo title="Same report, two forms" size="wide" caption="Both sides carry the same facts. Turn on **Show only the values** to see how much of the prose is structure you already knew." >}}
<style>
  .rp { display: grid; gap: 12px; }
  .rp__q { margin: 0; font-weight: 600; }
  .rp__cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
  .rp__col { display: grid; gap: 8px; align-content: start; min-width: 0; }
  .rp__head { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 30px; }
  .rp__head strong { font: 700 0.75rem/1.2 var(--font-sans); letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .rp__toggle { font: 600 0.78rem/1 var(--font-sans); padding: 7px 11px; border-radius: 999px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; }
  .rp__toggle[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .rp__prose, .rp__board { box-sizing: border-box; height: 380px; border: 1px solid var(--border); border-radius: 10px; }
  .rp__prose { overflow: auto; padding: 12px 14px; background: var(--code-bg); font-size: 0.85rem; line-height: 1.55; color: var(--text); transition: color 0.2s; }
  .rp__prose h4 { margin: 0.9em 0 0.3em; font-size: 0.88rem; }
  .rp__prose h4:first-child { margin-top: 0; }
  .rp__prose p, .rp__prose ul { margin: 0 0 0.6em; }
  .rp__prose ul { padding-left: 1.2em; }
  .rp__prose li { margin: 0.25em 0; }
  .rp.is-values .rp__prose { color: color-mix(in srgb, var(--text) 20%, transparent); }
  .rp.is-values .rp__prose .v { color: var(--text); background: var(--mark); border-radius: 3px; box-shadow: 0 0 0 2px var(--mark); }
  .rp__stat { margin: 0; font-size: 0.85rem; color: var(--muted); }
  .rp__stat b { color: var(--text); font-variant-numeric: tabular-nums; }
  .rp__board { display: grid; grid-template-rows: auto auto 1fr; gap: 10px; padding: 12px; background: var(--surface); }
  .rp__label { font-size: 0.8rem; color: var(--muted); }
  .rp__runs { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }
  .rp__run { display: grid; gap: 4px; padding: 8px 9px; border: 1.5px solid var(--border); border-radius: 9px; background: var(--bg); min-width: 0; }
  .rp__run--bad { border-color: var(--c-caution); background: var(--c-caution-bg); }
  .rp__run--best { border-color: var(--c-tip); }
  .rp__name { font: 600 0.72rem/1.2 var(--font-mono); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rp__val { font: 700 0.98rem/1.15 var(--font-sans); font-variant-numeric: tabular-nums; color: var(--text); }
  .rp__chip { justify-self: start; font: 700 0.64rem/1 var(--font-sans); letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 6px; border-radius: 999px; }
  .rp__chip--done { color: var(--c-tip); background: var(--c-tip-bg); }
  .rp__chip--bad { color: var(--c-caution); background: color-mix(in srgb, var(--c-caution) 14%, transparent); }
  .rp__chip--run { color: var(--c-warning); background: var(--c-warning-bg); }
  .rp__bar { height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
  .rp__bar i { display: block; height: 100%; width: 73%; background: var(--c-warning); }
  .rp__ask { align-self: end; display: grid; gap: 8px; padding: 10px; border: 1.5px dashed var(--c-important); border-radius: 10px; background: var(--c-important-bg); }
  .rp__ask p { margin: 0; font-size: 0.86rem; color: var(--text); }
  .rp__btns { display: flex; flex-wrap: wrap; gap: 6px; }
  .rp__btns button { font: 600 0.78rem/1 var(--font-sans); padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; }
  .rp__btns button:hover { border-color: var(--accent); }
  .rp__btns button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--surface); }
  .rp__out { margin: 0; min-height: 1.4em; font: 0.74rem/1.4 var(--font-mono); color: var(--muted); overflow-wrap: anywhere; }
  @media (max-width: 720px) {
    .rp__cols { grid-template-columns: minmax(0, 1fr); }
    .rp__prose { height: 300px; }
    .rp__board { height: auto; }
  }
</style>
<div class="rp" data-rp>
  <p class="rp__q">Your agent ran a six-run learning-rate sweep overnight. Which runs need you, and what is it asking?</p>
  <div class="rp__cols">
    <div class="rp__col">
      <div class="rp__head"><strong>As prose</strong><button class="rp__toggle" type="button" aria-pressed="false" data-rp-toggle>Show only the values</button></div>
      <div class="rp__prose" data-rp-prose tabindex="0" aria-label="The agent's report, as prose">
        <h4>Overnight sweep: status report</h4>
        <p>I've completed a thorough review of all six training runs in the learning-rate sweep. Here is a detailed breakdown of where everything currently stands, along with my recommendations for next steps.</p>
        <h4>✅ Completed runs</h4>
        <ul>
          <li><strong><span class="v">run-01</span></strong> (lr = <span class="v">1e-4</span>) <span class="v">finished</span> successfully after the full 12,000 steps. Its final validation loss was <strong><span class="v">2.31</span></strong>, which is broadly in line with what we expected.</li>
          <li><strong><span class="v">run-03</span></strong> (lr = <span class="v">3e-4</span>) also <span class="v">finished</span> without any issues. It reached a final validation loss of <strong><span class="v">2.18</span></strong>, which makes it the <strong><span class="v">best run</span></strong> in the sweep so far.</li>
          <li><strong><span class="v">run-04</span></strong> (lr = <span class="v">5e-4</span>) <span class="v">finished</span> as well, with a final validation loss of <span class="v">2.26</span>.</li>
        </ul>
        <h4>⚠️ Runs that need your attention</h4>
        <ul>
          <li><strong><span class="v">run-02</span></strong> (lr = <span class="v">2e-3</span>) <span class="v">diverged</span> at around step <span class="v">7,400</span>. The loss spiked sharply and became NaN shortly afterwards, which is a classic sign that the learning rate is too high for this configuration.</li>
          <li><strong><span class="v">run-05</span></strong> (lr = <span class="v">1e-3</span>) showed similar signs of instability and ultimately <span class="v">diverged</span> at step <span class="v">9,100</span>.</li>
        </ul>
        <h4>⏳ Still in progress</h4>
        <ul>
          <li><strong><span class="v">run-06</span></strong> (lr = <span class="v">7e-4</span>) is <span class="v">still running</span>. It is currently at step 8,800 of 12,000 (roughly <span class="v">73%</span>) and should finish in approximately <span class="v">2 hours</span>.</li>
        </ul>
        <h4>Next steps</h4>
        <p>Would you like me to <span class="v">rerun run-02 and run-05</span> with <span class="v">gradient clipping</span> enabled? Alternatively, I could <span class="v">lower their learning rates</span> and try again. Just let me know how you'd like to proceed, and I'll take care of the rest!</p>
      </div>
      <p class="rp__stat" data-rp-stat aria-live="polite"></p>
    </div>
    <div class="rp__col">
      <div class="rp__head"><strong>As structure</strong></div>
      <div class="rp__board">
        <span class="rp__label">Overnight sweep · validation loss</span>
        <div class="rp__runs">
          <div class="rp__run"><span class="rp__name">run-01 · 1e-4</span><span class="rp__chip rp__chip--done">done</span><span class="rp__val">2.31</span></div>
          <div class="rp__run rp__run--bad"><span class="rp__name">run-02 · 2e-3</span><span class="rp__chip rp__chip--bad">diverged</span><span class="rp__val">NaN @ 7.4k</span></div>
          <div class="rp__run rp__run--best"><span class="rp__name">run-03 · 3e-4</span><span class="rp__chip rp__chip--done">best</span><span class="rp__val">2.18</span></div>
          <div class="rp__run"><span class="rp__name">run-04 · 5e-4</span><span class="rp__chip rp__chip--done">done</span><span class="rp__val">2.26</span></div>
          <div class="rp__run rp__run--bad"><span class="rp__name">run-05 · 1e-3</span><span class="rp__chip rp__chip--bad">diverged</span><span class="rp__val">NaN @ 9.1k</span></div>
          <div class="rp__run"><span class="rp__name">run-06 · 7e-4</span><span class="rp__chip rp__chip--run">running</span><span class="rp__val">73% · 2 h</span><span class="rp__bar"><i></i></span></div>
        </div>
        <div class="rp__ask">
          <p><strong>Rerun run-02 and run-05?</strong></p>
          <div class="rp__btns" data-rp-btns>
            <button type="button" aria-pressed="false" data-out='rerun(["run-02", "run-05"], grad_clip=1.0)'>With clipping</button>
            <button type="button" aria-pressed="false" data-out='rerun(["run-02", "run-05"], lr="×0.5")'>Lower LR</button>
            <button type="button" aria-pressed="false" data-out="// not now: they stay on the board">Not now</button>
          </div>
          <p class="rp__out" data-rp-out aria-live="polite"></p>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
(function () {
  var root = document.querySelector('[data-rp]');
  if (!root) return;
  var prose = root.querySelector('[data-rp-prose]');
  var stat = root.querySelector('[data-rp-stat]');
  var toggle = root.querySelector('[data-rp-toggle]');
  function words(s) { return (s.match(/[A-Za-z0-9][\w.,%@×'-]*/g) || []).length; }
  var total = words(prose.textContent);
  var vals = 0;
  prose.querySelectorAll('.v').forEach(function (el) { vals += words(el.textContent); });
  var pct = Math.round(vals / total * 100);
  function render() {
    var on = toggle.getAttribute('aria-pressed') === 'true';
    root.classList.toggle('is-values', on);
    toggle.textContent = on ? 'Show everything' : 'Show only the values';
    stat.innerHTML = on
      ? 'Only <b>' + vals + '</b> of these <b>' + total + '</b> words (<b>' + pct + '%</b>) are values. The rest is structure.'
      : '<b>' + total + '</b> words. Scroll to find what needs you.';
  }
  toggle.addEventListener('click', function () {
    toggle.setAttribute('aria-pressed', toggle.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    render();
  });
  var out = root.querySelector('[data-rp-out]');
  root.querySelectorAll('[data-rp-btns] button').forEach(function (b, _, all) {
    b.addEventListener('click', function () {
      all.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      out.textContent = '→ ' + b.dataset.out;
    });
  });
  render();
})();
</script>
{{< /demo >}}

The left side is not hard to read because it is badly written. It is hard because most of your effort goes into matching a structure you already know (run, learning rate, status, loss) before you reach the values you came for. The right side hands that job to your eyes. Every math teacher knows this: a Venn diagram beats a paragraph of set notation. For structured information, our brains prefer pictures to prose.

Machines have the same preference, for a different format:

> Code and JSON are how machines read structure. A GUI is how human eyes read structure. Today we force both sides into their worst format: people read and write prose, and agents squint at screenshots.
{.pull}

My bet is that over the next few years, human efficiency on the user's side will matter as much as token efficiency on the agent's side, and that GUIs will become a new language for talking to agents. The more structured the information, the more a GUI will win over words. As a bonus, people who are not native speakers of the agent's best language will get a much better experience.

{{< figure src="keystrokes.svg" dark="keystrokes-dark.svg" size="wide" alt="Two brags side by side. Today: my agent did it in 10 million tokens, drawn as a long stream of token marks. Next: I did it in 10 keystrokes, drawn as ten keycaps such as Tab, A and R." caption="Token efficiency is what we measure today. Your efficiency is what will matter." >}}

Here is a view I find useful: **a GUI is a representation of structured information**, and in an agent's world, that information is the app's state. When you click a button or drag a card, you are not describing anything. You are changing the state directly. Which brings us to the second link.

## Bottleneck 2: agents are locked outside the GUI

We already have plenty of GUI software, so why not just use it? Because in today's apps, only you can "speak" through the GUI. You click, and the state changes. The agent has no good way to speak back to you through the same surface, so it falls back on chat.

To see why, look at how agents use GUI software today. A computer-use agent (CUA) does what you ask by operating the computer the way you would: it looks at the screen, moves the mouse, and types. Since [OSWorld](https://os-world.github.io/) gave the field a shared benchmark of real desktop tasks, CUAs have become much stronger, and they can now finish a wide range of them. But the way they work with a GUI doesn't make much sense to me, for two reasons.

- **Pixel loops carry little information per step.** For most closed-source apps, the agent learns the app's state from screenshots. Even closing a popup means: take a high-resolution screenshot, have a model read it, click, and take another screenshot to check. Where an accessibility tree or a DOM is available, it describes how the screen is drawn, not the app's state, it is noisy, and many desktop apps expose too little of it, so the agent falls back to screenshots anyway. Unlike the output of a shell command, each screenshot says very little, so a task takes many of them. Closing a popup and adding one task to a to-do app takes at least four screenshots (about 5,000 image tokens) and four sequential calls to a vision model, each of which can misread the screen or click a few pixels off.{{< sidenote >}}Anthropic's vision docs estimate an image at about width × height / 750 tokens, so a 1280×720 screenshot is about 1,200 tokens. Models that read full-resolution screenshots can spend up to about 4,800 on one.{{< /sidenote >}} In my own task app, the same change is one command of about twenty tokens, `rmd add "Reply to reviewer 2" 8`. And if the agent needs to know everything first, one call, `rmd state`, returns all that the app's pages can show: about 34 KB of JSON, or roughly 10,000 tokens. That is the price of about eight screenshots, each of which would show one screen of one page.{{< sidenote >}}Measured on my own data with `rmd state | wc -c`. The token count is an estimate at 3 to 4 bytes per token.{{< /sidenote >}}
- **GUIs have no `git diff` and no unit tests.** When an agent writes code, we check its work with tests, version control, and a diff we can read at a glance. When an agent works through a GUI, there is nothing like that. Part of the reason is that GUI tasks take many small steps, and asking you to approve each one would bury you. So you either trust thirty clicks you didn't watch, or you watch all thirty.

So, can we make GUI software agent-friendly? That means the agent needs only a few steps to act, and you can accept or reject the result at a glance. I think we can. The key is a bridge that lets the agent speak to the software directly, the way you do when you click. Then the UI responds to both of you.

The first piece of this runs today. In [Schedule Everything](https://github.com/AutoPhd-org/schedule-everything), my agent goes through my inbox and calendar for things I should do. It never adds a task by itself. It runs one command, and the suggestion appears on my task board, waiting for a yes or a no:

{{< demo title="Same task, two routes" size="wide" caption="The right side is the real flow in Schedule Everything: the command is the one my agent runs, and the card is how a suggestion appears on my board. The left side is a typical computer-use loop, simplified." >}}
<style>
  .sr { display: grid; gap: 12px; }
  .sr__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
  .sr__task { margin: 0; font-weight: 600; flex: 1 1 280px; }
  .sr__go { font: 600 0.82rem/1 var(--font-sans); padding: 8px 14px; border-radius: 999px; border: 1px solid var(--accent); background: var(--accent); color: var(--surface); cursor: pointer; }
  .sr__cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: stretch; }
  .sr__col { display: grid; grid-template-rows: auto 1fr auto auto; gap: 8px; min-width: 0; padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
  .sr__head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .sr__head strong { font: 700 0.75rem/1.2 var(--font-sans); letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .sr__head span { font-size: 0.78rem; color: var(--faint); }
  .sr__log { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; align-content: start; min-height: 300px; font-size: 0.82rem; }
  .sr__log li { display: grid; grid-template-columns: 46px 1fr; gap: 8px; align-items: baseline; animation: sr-in 0.25s ease-out; }
  .sr__tag { font: 700 0.62rem/1 var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em; padding: 3px 0; border-radius: 4px; text-align: center; }
  .sr__tag--shot { color: var(--c-caution); background: var(--c-caution-bg); }
  .sr__tag--look { color: var(--c-important); background: var(--c-important-bg); }
  .sr__tag--act { color: var(--muted); background: var(--code-bg); }
  .sr__meter { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 0.8rem; color: var(--muted); border-top: 1px solid var(--border); padding-top: 8px; }
  .sr__meter b { color: var(--text); font-variant-numeric: tabular-nums; }
  .sr__you { margin: 0; font-size: 0.82rem; color: var(--text); }
  .sr__right { display: grid; gap: 10px; align-content: start; min-height: 300px; }
  .sr__cmd { margin: 0; padding: 10px 12px; border-radius: 8px; background: var(--term-bg, #111317); color: #e6e3dc; font: 0.74rem/1.5 var(--font-mono); white-space: pre-wrap; overflow-wrap: anywhere; min-height: 6.2em; }
  .sr__cmd .p { color: #8a877f; }
  .sr__cmd .ok { color: #7fd1a3; }
  .sr__card { display: grid; gap: 5px; padding: 10px 12px; border: 1.5px dashed var(--c-important); border-radius: 10px; background: var(--c-important-bg); animation: sr-in 0.3s ease-out; }
  .sr__card[hidden] { display: none; }
  .sr__by { font: 600 0.74rem/1.2 var(--font-sans); color: var(--c-important); }
  .sr__card strong { font-size: 0.95rem; color: var(--text); }
  .sr__why { font-size: 0.8rem; color: var(--muted); }
  .sr__btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .sr__btns button { font: 600 0.8rem/1 var(--font-sans); padding: 8px 11px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; }
  .sr__btns .sr__add { background: var(--c-tip); border-color: var(--c-tip); color: var(--surface); }
  .sr__card.is-added { border-style: solid; border-color: var(--border); background: var(--bg); }
  .sr__card.is-added .sr__by { color: var(--c-tip); }
  .sr__card.is-rejected { opacity: 0.55; border-style: solid; border-color: var(--border); background: var(--bg); }
  .sr__card.is-rejected .sr__by { color: var(--muted); }
  .sr__card.is-rejected strong { text-decoration: line-through; }
  .sr__undo { justify-self: start; font: 600 0.78rem/1 var(--font-sans); padding: 0; border: 0; background: none; color: var(--accent); text-decoration: underline; cursor: pointer; }
  @keyframes sr-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  @media (max-width: 720px) { .sr__cols { grid-template-columns: minmax(0, 1fr); } .sr__log, .sr__right { min-height: 0; } }
  @media (prefers-reduced-motion: reduce) { .sr__log li, .sr__card { animation: none; } }
</style>
<div class="sr" data-sr>
  <div class="sr__top">
    <p class="sr__task">An email from reviewer 2 means you have one more thing to do. Your agent puts it on your task list.</p>
    <button class="sr__go" type="button" data-sr-go>Run both</button>
  </div>
  <div class="sr__cols">
    <div class="sr__col">
      <div class="sr__head"><strong>Through the GUI</strong><span>computer-use loop</span></div>
      <ol class="sr__log" data-sr-log aria-live="polite"></ol>
      <div class="sr__meter"><span><b data-sr-shots>0</b> screenshots</span><span><b data-sr-calls>0</b> vision calls</span><span>~<b data-sr-tok>0</b> image tokens</span></div>
      <p class="sr__you">To check its work, you replay every step.</p>
    </div>
    <div class="sr__col">
      <div class="sr__head"><strong>Through the app's state</strong><span>Schedule Everything</span></div>
      <div class="sr__right">
        <pre class="sr__cmd" data-sr-cmd aria-live="polite"></pre>
        <div class="sr__card" data-sr-card hidden>
          <span class="sr__by" data-sr-by>✦ suggested by Claude · from Gmail</span>
          <strong>Reply to reviewer 2</strong>
          <span class="sr__why" data-sr-why>Reviewer 2 asked for one more ablation.</span>
          <div class="sr__btns" data-sr-btns>
            <button type="button" class="sr__add" data-sr-add>✓ Add to my tasks</button>
            <button type="button" data-sr-rej>✕ Reject</button>
          </div>
          <button type="button" class="sr__undo" data-sr-undo hidden>undo</button>
        </div>
      </div>
      <div class="sr__meter"><span><b data-sr-cmds>0</b> command</span><span><b>0</b> screenshots</span><span>~<b data-sr-ctok>0</b> tokens</span></div>
      <p class="sr__you">To check its work, you click once.</p>
    </div>
  </div>
</div>
<script>
(function () {
  var root = document.querySelector('[data-sr]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var log = $('[data-sr-log]'), cmd = $('[data-sr-cmd]'), card = $('[data-sr-card]');
  var steps = [
    ['shot', 'Screenshot the screen (1280×720)'],
    ['look', 'A “What’s new” popup covers the board'],
    ['act', 'Click × at (912, 164)'],
    ['shot', 'Screenshot'],
    ['look', 'Find the “New task” button'],
    ['act', 'Click (1046, 132)'],
    ['shot', 'Screenshot'],
    ['look', 'Find the title field and the priority menu'],
    ['act', 'Type “Reply to reviewer 2”'],
    ['act', 'Priority menu → 8, then click Save'],
    ['shot', 'Screenshot to check the result'],
    ['look', 'The task is on the board. Done.']
  ];
  var command = '<span class="p">$</span> rmd suggest add "Reply to reviewer 2" 8 \\\n    --source Gmail --agent Claude \\\n    --reason "Reviewer 2 asked for one more ablation."';
  var timers = [];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function later(fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
  function setText(sel, v) { $(sel).textContent = v; }
  function resetCard() {
    card.className = 'sr__card';
    card.hidden = true;
    $('[data-sr-by]').textContent = '✦ suggested by Claude · from Gmail';
    $('[data-sr-btns]').hidden = false;
    $('[data-sr-undo]').hidden = true;
  }
  function run() {
    timers.forEach(clearTimeout); timers = [];
    log.innerHTML = ''; cmd.innerHTML = ''; resetCard();
    ['[data-sr-shots]', '[data-sr-calls]', '[data-sr-tok]', '[data-sr-cmds]', '[data-sr-ctok]'].forEach(function (s) { setText(s, '0'); });
    var shots = 0, calls = 0;
    steps.forEach(function (s, i) {
      later(function () {
        var li = document.createElement('li');
        li.innerHTML = '<span class="sr__tag sr__tag--' + s[0] + '">' + s[0] + '</span><span></span>';
        li.lastChild.textContent = s[1];
        log.appendChild(li);
        if (s[0] === 'shot') shots++;
        if (s[0] === 'look') calls++;
        setText('[data-sr-shots]', shots);
        setText('[data-sr-calls]', calls);
        setText('[data-sr-tok]', (shots * 1200).toLocaleString('en-US'));
      }, 300 + i * 520);
    });
    later(function () { cmd.innerHTML = command; setText('[data-sr-cmds]', '1'); setText('[data-sr-ctok]', '40'); }, 300);
    later(function () { cmd.innerHTML = command + '\n<span class="ok">Suggested. It waits on the task board.</span>'; }, 800);
    later(function () { card.hidden = false; }, 1000);
  }
  $('[data-sr-add]').addEventListener('click', function () {
    card.className = 'sr__card is-added';
    $('[data-sr-by]').textContent = '✓ on your task list · importance 8';
    $('[data-sr-btns]').hidden = true; $('[data-sr-undo]').hidden = false;
  });
  $('[data-sr-rej]').addEventListener('click', function () {
    card.className = 'sr__card is-rejected';
    $('[data-sr-by]').textContent = 'Rejected. Your agent won’t suggest it again.';
    $('[data-sr-btns]').hidden = true; $('[data-sr-undo]').hidden = false;
  });
  $('[data-sr-undo]').addEventListener('click', function () { resetCard(); card.hidden = false; });
  $('[data-sr-go]').addEventListener('click', function () { this.textContent = 'Run again'; run(); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); $('[data-sr-go]').textContent = 'Run again'; run(); }
    }, { threshold: 0.5 });
    io.observe(root);
  } else { run(); }
})();
</script>
{{< /demo >}}

The same idea works anywhere the *where* and the *what* are easier to show than to say. Here is a mock-up of a slide tool that takes its instructions from your cursor and a key:

{{< demo title="Point, press, accept" caption="A mock-up, not a product yet. Where you click says *where*. The key says *what*. <kbd>Tab</kbd> or <kbd>Esc</kbd> says *yes* or *no*. Words are left for the parts only words can say." >}}
<style>
  .sl { display: grid; gap: 12px; }
  .sl__task { margin: 0; font-size: 0.92rem; }
  .sl__task kbd, .sl__keys kbd { font: 600 0.78rem/1 var(--font-mono); padding: 2px 6px; border: 1px solid var(--border-strong); border-bottom-width: 2px; border-radius: 5px; background: var(--surface); color: var(--text); }
  .sl__stage { position: relative; border-radius: 10px; outline: none; }
  .sl__stage:focus-visible { box-shadow: 0 0 0 3px var(--accent-soft), 0 0 0 1px var(--accent); }
  .sl__slide { position: relative; aspect-ratio: 16 / 9; border: 1px solid var(--border-strong); border-radius: 10px; background: #ffffff; color: #1b1a18; overflow: hidden; cursor: text; container-type: inline-size; }
  .sl__title { position: absolute; left: 6%; top: 8%; margin: 0; font: 800 5.4cqw/1.1 var(--font-sans); color: #23508e; letter-spacing: -0.02em; }
  .sl__text { position: absolute; left: 6%; top: 30%; width: 40%; margin: 0; padding-left: 1.1em; font: 500 2.7cqw/1.6 var(--font-sans); }
  .sl__caret { position: absolute; width: 2px; height: 7%; margin-top: -3.5%; background: #6a45c0; animation: sl-blink 1s steps(1) infinite; pointer-events: none; }
  .sl__caret[hidden] { display: none; }
  .sl__item { position: absolute; box-sizing: border-box; padding: 1.2%; border-radius: 6px; }
  .sl__item svg { display: block; width: 100%; height: 100%; }
  .sl__item ul { margin: 0; padding-left: 1.1em; font: 500 2.3cqw/1.55 var(--font-sans); }
  .sl__ghost { border: 2px dashed #6a45c0; background: rgba(106, 69, 192, 0.07); }
  .sl__ghost::after { content: "Tab keeps · Esc discards"; position: absolute; left: 0; bottom: 100%; margin-bottom: 4px; font: 700 1.6cqw/1 var(--font-sans); color: #6a45c0; white-space: nowrap; }
  .sl__hint { position: absolute; inset: auto 0 4% 0; text-align: center; font: 500 2cqw/1 var(--font-sans); color: #99948a; pointer-events: none; }
  .sl__keys { display: flex; flex-wrap: wrap; gap: 6px; }
  .sl__keys button { display: inline-flex; align-items: center; gap: 6px; font: 600 0.8rem/1 var(--font-sans); padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); cursor: pointer; }
  .sl__keys button:disabled { opacity: 0.45; cursor: default; }
  .sl__cmp { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 12px; }
  .sl__box { display: grid; gap: 6px; align-content: start; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); font-size: 0.85rem; }
  .sl__box strong { font: 700 0.72rem/1.2 var(--font-sans); letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .sl__box b { font-variant-numeric: tabular-nums; }
  .sl__prompt { margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--code-bg); font: 0.78rem/1.5 var(--font-mono); white-space: pre-wrap; }
  .sl__muted { color: var(--muted); }
  @keyframes sl-blink { 50% { opacity: 0; } }
  @media (max-width: 640px) { .sl__cmp { grid-template-columns: minmax(0, 1fr); } }
  @media (prefers-reduced-motion: reduce) { .sl__caret { animation: none; } }
</style>
<div class="sl" data-sl>
  <p class="sl__task">Click anywhere on the slide, then press <kbd>C</kbd> for a chart, <kbd>B</kbd> for bullets or <kbd>D</kbd> for a diagram. <kbd>Tab</kbd> keeps the suggestion, <kbd>Esc</kbd> throws it away.</p>
  <div class="sl__stage" tabindex="0" data-sl-stage role="application" aria-label="Slide. Click to place the cursor, then press C, B or D. Tab keeps the suggestion and Escape discards it.">
    <div class="sl__slide" data-sl-slide>
      <div class="sl__title">Q3: what changed</div>
      <ul class="sl__text"><li>p95 latency down 38%</li><li>Two new regions live</li><li>Churn flat at 2.1%</li></ul>
      <span class="sl__caret" data-sl-caret hidden></span>
      <span class="sl__hint" data-sl-hint>click the empty space on the right</span>
    </div>
  </div>
  <div class="sl__keys" data-sl-keys>
    <button type="button" data-key="c"><kbd>C</kbd> chart</button>
    <button type="button" data-key="b"><kbd>B</kbd> bullets</button>
    <button type="button" data-key="d"><kbd>D</kbd> diagram</button>
    <button type="button" data-key="tab"><kbd>Tab</kbd> keep</button>
    <button type="button" data-key="esc"><kbd>Esc</kbd> discard</button>
  </div>
  <div class="sl__cmp">
    <div class="sl__box"><strong>What you did</strong><span><b data-sl-clicks>0</b> clicks and <b data-sl-presses>0</b> keys.</span></div>
    <div class="sl__box"><strong>The prompt you would write instead</strong><p class="sl__prompt" data-sl-prompt>Add a small bar chart of the quarterly latency numbers in the empty space on the right side of this slide, below the title, about as tall as the bullet list, in the same blue as the title. Don't move anything else.</p><span class="sl__muted"><b data-sl-chars>0</b> characters, and then you still check where it went.</span></div>
  </div>
</div>
<script>
(function () {
  var root = document.querySelector('[data-sl]');
  if (!root) return;
  var stage = root.querySelector('[data-sl-stage]');
  var slide = root.querySelector('[data-sl-slide]');
  var caret = root.querySelector('[data-sl-caret]');
  var hint = root.querySelector('[data-sl-hint]');
  var pos = null, ghost = null, clicks = 0, presses = 0;
  root.querySelector('[data-sl-chars]').textContent = root.querySelector('[data-sl-prompt]').textContent.length;
  var W = 38, H = 46;
  var make = {
    c: function () {
      var h = [62, 48, 38, 30], bars = '';
      ['Q4', 'Q1', 'Q2', 'Q3'].forEach(function (q, i) { var v = h[i]; bars += '<rect x="' + (10 + i * 24) + '" y="' + (86 - v) + '" width="16" height="' + v + '" rx="2" fill="#23508e" opacity="' + (0.45 + i * 0.18).toFixed(2) + '"/><text x="' + (18 + i * 24) + '" y="96" font-size="7" text-anchor="middle" fill="#6b675f">' + q + '</text>'; });
      return '<svg viewBox="0 0 110 100" preserveAspectRatio="xMidYMid meet" aria-label="Bar chart of p95 latency by quarter"><text x="4" y="10" font-size="7.5" font-weight="700" fill="#1b1a18">p95 latency (ms)</text><path d="M6 86 H106" stroke="#d3cec2"/>' + bars + '</svg>';
    },
    b: function () { return '<ul><li>Cache moved to the edge</li><li>EU and APAC regions</li><li>Next: cut cold starts</li></ul>'; },
    d: function () {
      var box = function (x, t) { return '<rect x="' + x + '" y="38" width="30" height="24" rx="4" fill="#f3effb" stroke="#6a45c0"/><text x="' + (x + 15) + '" y="53" font-size="7" text-anchor="middle" fill="#1b1a18">' + t + '</text>'; };
      var arrow = function (x) { return '<path d="M' + x + ' 50 h8" stroke="#99948a" stroke-width="1.5" marker-end="url(#sl-ah)"/>'; };
      return '<svg viewBox="0 0 110 100" preserveAspectRatio="xMidYMid meet" aria-label="Diagram: request, edge cache, region"><defs><marker id="sl-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#99948a"/></marker></defs>' + box(2, 'request') + arrow(33) + box(41, 'edge') + arrow(72) + box(80, 'region') + '</svg>';
    }
  };
  function count() {
    root.querySelector('[data-sl-clicks]').textContent = clicks;
    root.querySelector('[data-sl-presses]').textContent = presses;
  }
  function place(kind) {
    if (!pos) { pos = { x: 55, y: 32 }; showCaret(); }
    if (ghost) ghost.remove();
    ghost = document.createElement('div');
    ghost.className = 'sl__item sl__ghost';
    var x = Math.min(Math.max(pos.x, 2), 98 - W), y = Math.min(Math.max(pos.y, 10), 96 - H);
    ghost.style.left = x + '%'; ghost.style.top = y + '%';
    ghost.style.width = W + '%'; ghost.style.height = H + '%';
    ghost.innerHTML = make[kind]();
    slide.appendChild(ghost);
    caret.hidden = true;
  }
  function keep() { if (!ghost) return false; ghost.classList.remove('sl__ghost'); ghost = null; pos = null; return true; }
  function discard() { if (!ghost) return false; ghost.remove(); ghost = null; if (pos) caret.hidden = false; return true; }
  function showCaret() { caret.style.left = pos.x + '%'; caret.style.top = pos.y + '%'; caret.hidden = false; }
  function act(k) {
    if (k === 'tab') return keep();
    if (k === 'esc') return discard();
    if (make[k]) { place(k); return true; }
    return false;
  }
  slide.addEventListener('click', function (e) {
    var r = slide.getBoundingClientRect();
    pos = { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
    if (ghost) { ghost.remove(); ghost = null; }
    showCaret(); hint.hidden = true;
    clicks++; count(); stage.focus({ preventScroll: true });
  });
  stage.addEventListener('keydown', function (e) {
    var k = e.key === 'Tab' ? 'tab' : e.key === 'Escape' ? 'esc' : e.key.toLowerCase();
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (act(k)) { e.preventDefault(); presses++; count(); hint.hidden = true; }
  });
  root.querySelectorAll('[data-sl-keys] button').forEach(function (b) {
    b.addEventListener('click', function () { if (act(b.dataset.key)) { presses++; count(); hint.hidden = true; } });
  });
  count();
})();
</script>
{{< /demo >}}

There is an obvious limitation. In the slide example, how does the agent know what <kbd>C</kbd> or <kbd>B</kbd> means? Before you can work this way, the software has to be set up, and setting it up still takes natural language. But it is a lot like writing reusable skills for an agent: you describe a pattern once, and after that a key stands for it. The more of these we build, the fewer words we spend on the parts that never change.

## Where this leaves us

With agents improving this fast, the bottleneck is now how we communicate with them, at both ends. People love to click and press <kbd>Tab</kbd>, yet we write long prompts and read long answers. Agents love to write code and call tools, yet they take screenshots and go the visual way. Each side is stuck working in the other's format.

In Part 2, I will go through practical ways to cut the friction at both links: what existing work such as MCP, generative UI and CLI wrappers already fixes and what it leaves open, some new ideas, and the proof of concept I built around them. That is [LaunchX](https://github.com/AutoPhd-org/launchx), a launcher whose apps hand their state straight to your agents, together with [Schedule Everything](https://github.com/AutoPhd-org/schedule-everything), the app from the demo above.