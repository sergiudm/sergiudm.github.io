---
title: "The Bottleneck Is Now the Interface"
description: "Agents got smart, but we still talk to them through a chat box, and they still reach our software through its front door. I think the next three years belong to the interface: apps whose state an agent reads directly, and where you can answer with more than words."
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

Three years ago an LLM could only chat. Today an agent can plan, call tools and work for hours, and nearly all of that progress came from two places: better models, and better harnesses around them. The way we talk to agents has not moved. It is still a chat session. I think that is now the weakest part of the whole system, and that the next three years of software should go into fixing it. This post is the argument, with pictures, and a look at what we are building toward at [AutoPhD](https://github.com/AutoPhd-org).
{.lead}

## From chatbots to agents

First we had LLMs, and an LLM did one thing: you sent it text and it sent text back. Put a text box in front of it and you have a chatbot. A chatbot can explain how to rename a hundred files. It cannot rename them.

We wanted it to act. So we let the model call functions, gave it the results, and let it go round again until the job was done. The code that does this (the loop, the tools, the memory, the sandbox, the permission prompts) is the **harness**, and a model inside a harness is what we now call an agent.

From 2023 to 2026 the harness is where most of the invention happened: function calling, tool protocols such as MCP, computer use, coding agents that live in a terminal, skills, subagents, runs that go on for hours. The models improved underneath all of it.

In 2023, when an agent failed, it was nearly always the agent's own fault. It lost the plan, repeated an action that had already failed, or announced success too early. Everything around the agent was good enough, because the agent could not have used anything better.

{{< figure src="pipeline-then.svg" dark="pipeline-then-dark.svg" size="wide" alt="2023: you write a prompt and read an answer, the agent executes a tool call or two on software and explores what the tools return. The agent is marked as the bottleneck: it lost the plan, repeated itself and stopped too early." caption="**2023.** You write a prompt and read an answer; the agent makes a tool call or two. The narrowest part of the pipeline is the agent itself." >}}

## The bottleneck moved

That stopped being true. On [OSWorld](https://os-world.github.io/), a benchmark of real desktop tasks, several agents now finish more tasks than the human baseline of about 72%. An agent driving a desktop with a mouse and a keyboard does at least as well as a person there.

Now look at what stayed the same in the picture. I still write prompts and read answers. The agent still works on software from the outside. Those two pipes are as wide as they were in 2023, and far more is trying to get through them.

{{< figure src="pipeline-now.svg" dark="pipeline-now-dark.svg" size="wide" alt="2026: the agent, wrapped in a harness, plans, calls tools and works for hours. The two links are marked as bottlenecks. Between you and the agent, what you see has to become words and you read long answers. Between the agent and the software, screenshots, clicks and file reads burn tokens before the work starts." caption="**2026.** The agent grew and the pipes did not. More waits at each end than fits through, so the red has moved from the middle to the two links." >}}

So is a chat session good enough for talking to an agent? No, and the reason is different on each side.

### For the person, it is not easy

Much of what I want to tell an agent is something I am looking at. The third bar of a chart. The run whose loss curve jumps near the end. The task that should come before lunch, not after. In a chat box I have to turn what I see into a sentence, and then the agent has to turn the sentence back into the thing and hope it picked the right one. "No, the other one" is a message I have sent more than once.

Try it both ways:

{{< demo title="Say it, or point at it" caption="The six runs are the same in both cases. Only the way you answer changes." >}}
<style>
  .pt { display: grid; gap: 14px; }
  .pt__task { margin: 0; font-weight: 600; }
  .pt__runs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .pt__run { display: grid; gap: 4px; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); color: var(--text); font: inherit; text-align: left; cursor: pointer; }
  .pt__run:hover { border-color: var(--accent); }
  .pt__run[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
  .pt__run svg { display: block; width: 100%; height: 44px; }
  .pt__run path { fill: none; stroke: var(--series-1); stroke-width: 2; vector-effect: non-scaling-stroke; }
  .pt__name { font: 600 0.78rem/1.2 var(--font-mono); color: var(--muted); }
  .pt__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pt__col { display: grid; gap: 8px; align-content: start; padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
  .pt__col strong { font: 700 0.78rem/1.2 var(--font-sans); letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .pt__col textarea, .pt__msg { box-sizing: border-box; width: 100%; min-height: 84px; margin: 0; padding: 8px 10px; border-radius: 8px; font-size: 0.88rem; line-height: 1.5; }
  .pt__col textarea { resize: vertical; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); font-family: inherit; }
  .pt__msg { border: 1px solid var(--border); background: var(--code-bg); color: var(--text); font-family: var(--font-mono); font-size: 0.82rem; white-space: pre-wrap; overflow: hidden; }
  .pt__cost { font-size: 0.85rem; color: var(--muted); }
  .pt__cost b { color: var(--text); font-variant-numeric: tabular-nums; }
  @media (max-width: 640px) { .pt__cols { grid-template-columns: 1fr; } .pt__runs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
<div class="pt" data-pt>
  <p class="pt__task">Two of these six training runs diverged. Tell your agent to rerun them.</p>
  <div class="pt__runs" data-pt-runs></div>
  <div class="pt__cols">
    <div class="pt__col">
      <strong>Say it</strong>
      <textarea data-pt-text placeholder="Type what you would write in a chat box…" aria-label="Your instruction, in words"></textarea>
      <span class="pt__cost"><b data-pt-keys>0</b> characters, and the agent still has to work out which runs you mean.</span>
    </div>
    <div class="pt__col">
      <strong>Point at it</strong>
      <pre class="pt__msg" data-pt-msg aria-live="polite"></pre>
      <span class="pt__cost"><b data-pt-clicks>0</b> clicks, and the agent gets the runs themselves.</span>
    </div>
  </div>
</div>
<script>
(function () {
  var root = document.querySelector('[data-pt]');
  if (!root) return;
  var runs = root.querySelector('[data-pt-runs]');
  var msg = root.querySelector('[data-pt-msg]');
  var text = root.querySelector('[data-pt-text]');
  var diverged = { 1: true, 5: true };
  var clicks = 0;
  function curve(k) {
    var d = '';
    for (var i = 0; i <= 24; i++) {
      var v = 0.86 * Math.exp(-i / (5 + k % 3)) + 0.08 + 0.02 * Math.sin(i * 1.7 + k * 2.1);
      if (diverged[k] && i > 12) v += 0.78 * Math.pow((i - 12) / 12, 1.5) + 0.03 * Math.sin(i * 2.6);
      d += (i ? ' L' : 'M') + (i / 24 * 100).toFixed(1) + ',' + (42 - Math.min(v, 1) * 38).toFixed(1);
    }
    return d;
  }
  function update() {
    var picked = [];
    runs.querySelectorAll('[aria-pressed="true"]').forEach(function (b) { picked.push('  "' + b.dataset.run + '"'); });
    msg.textContent = picked.length ? 'rerun([\n' + picked.join(',\n') + '\n])' : '// click the runs above';
    root.querySelector('[data-pt-clicks]').textContent = clicks;
    root.querySelector('[data-pt-keys]').textContent = text.value.length;
  }
  for (var k = 0; k < 6; k++) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pt__run';
    b.dataset.run = 'run-0' + (k + 1);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="pt__name">run-0' + (k + 1) + '</span><svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><path d="' + curve(k) + '"/></svg>';
    b.addEventListener('click', function () {
      this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      clicks += 1;
      update();
    });
    runs.appendChild(b);
  }
  text.addEventListener('input', update);
  update();
})();
</script>
{{< /demo >}}

The other direction is no better. The agent works for twenty minutes and hands me eight hundred words about it. I needed three things: did it work, what changed, and is there anything I have to decide. They are in there somewhere, and reading is the slowest thing I do all day.

### For the agent, it is not efficient

Before an agent can do what I asked, it has to find out what state the app is in. If the app only has a GUI, that means a screenshot, a model call to read it, a click, and another screenshot. If the app is a folder of code and data, it means reading files until it understands where things live. All of those tokens go into learning something the app already knows. The app just has no way to say it.

Here is one real number. Everything my [Schedule Everything](https://github.com/AutoPhd-org/schedule-everything) workspace can show across its five pages (today's timeline, every task, every deadline, habits, history) comes out of one command as a JSON document of about 17 KB, roughly 5,000 tokens.{{< sidenote >}}Measured on my own data with `rmd state | wc -c`. The token count is an estimate at 3 to 4 bytes per token.{{< /sidenote >}} That is about the price of a few screenshots, each of which shows one screen of one page and still has to be read by a vision model that may misread it.

So I keep coming back to two questions.

> Who said people must convey information in words? And who said an agent must walk an app from its front to its back to read and change its state?
{.pull}

## Interface engineering

Each stage of this story got its own kind of engineering. When the model was all there was, we worked on what we said to it: prompt engineering. When the limit became what the model had in front of it, we worked on that: context engineering. When the limit became the loop around the model, we built harnesses. I think the limit is now the place where the person, the agent and the software meet, and I call working on it **interface engineering**.

It asks two things of any piece of software:

1. **How does the agent learn the app's state and change it?** The best answer is directly and in one step, without going through pixels.
2. **How does the person tell the agent what they mean, and find out what it did?** The best answer is whichever way is quickest: a word, a click, a stroke of a pen, a key.

## Work that already points this way

I am far from the first to notice. Several projects already repair one of the arrows in the picture.

| Work | Which arrow it repairs | What is left |
| --- | --- | --- |
| Computer-use agents | None, on purpose. The agent uses the GUI as it is, so no app has to change. | It is the most expensive route there is: every step costs a screenshot and a model call. |
| [CLI-Anything](https://github.com/HKUDS/CLI-Anything) | Agent to software. It reads an app's source code and generates a command-line harness with JSON output, so the agent runs commands and does not click. | It serves the agent only. Nothing changes for the person: there is no shared view, and no say over what the agent may see. |
| [MCP](https://modelcontextprotocol.io/) and [WebMCP](https://github.com/webmachinelearning/webmcp) | Agent to software. An app, or a web page, declares the tools an agent may call. | The person is not in the picture. What the agent did comes back as text in a chat. |
| [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) | Agent to person. A tool can return an interactive widget that renders inside the conversation. | The widget lives in the chat. The app's own page, where the work really is, is somewhere else. |
| [Intelligent UI](https://openai.com/index/gpt-6-for-everyone/) in ChatGPT, with GPT-6 | Agent to person, and a little of person to agent. The model composes its answer from charts, forms and tappable buttons as well as paragraphs. | The interface is made for one answer and stays in the chat. It is not the state of the apps you already use. |

OpenAI ends its announcement of Intelligent UI with a sentence I agree with: "Instead of people adapting to software, software will adapt to people." I would only aim it wider than the chat window, at the software itself.

Taken together, these tell me the direction is right, and they also show the gap. Each one repairs a single arrow. None of them treats the app as the place where the person and the agent meet.

## What I think software should look like

Two changes, and both are changes to the app, not to the model.

### 1. The agent works on the app's state, with your authorization

{{< figure src="direct-state.svg" dark="direct-state-dark.svg" size="wide" alt="An app has one state document and a page that is one view of it. You use the page. Your agent reads the state and runs commands directly, through access switches you set for each part of the state: whether it can see it, and whether it may act, must ask first, or may not act. The route agents take today, through screenshots and clicks on the page, is drawn as a long detour." caption="The page is one view of the state. The agent reads the same state through switches you set, and no longer has to go through the page." >}}

An app keeps its whole state in one document and offers one command per action. The page I look at is a view of that document and has no private channel, so nothing exists only on screen. The agent reads the same document in one call, and when it acts, the page in front of me changes at once.

I stay in charge of how far it reaches. For each part of the state I decide whether the agent can see it, and whether it may act, has to ask first, or may not touch it. It is the same kind of decision as camera and location permissions on a phone, and it should be just as easy to find.

The first half already exists. It is the contract behind [LaunchX](https://github.com/AutoPhd-org/launchx), the launcher I use for my local apps: an app serves its state at one address and ships a CLI that can do everything its page can, and LaunchX has a switch per app for whether my agents are told about it.

{{< terminal title="~ · zsh" >}}
$ lx agents
Apps that agents can discover:

ID   NAME                 STATUS   CLI  SKILLS
rmd  Schedule Everything  running  rmd  build-schedule, plan-day, suggest-tasks
vmc  Machine Console      running  vmc  —

Agents find them through the `launchx` skill in ~/.claude/skills and ~/.agents/skills.
$ rmd state | wc -c
17177
{{< /terminal >}}

> [!NOTE] What the switch does today
> The LaunchX switch is per app, and it decides what agents are *told about*, not what they can reach. Switches for each part of an app, with real enforcement behind them, are the next thing to build. The figure shows where this is heading.

### 2. You and the agent share one interface

{{< figure src="shared-interface.svg" dark="shared-interface-dark.svg" size="wide" alt="One app window that you and your agent both use. On a task board, a task the agent suggested has Add and Reject buttons, a task you circled with a pen carries your handwritten note, and a task the agent just added can be undone. A bar lists shortcut keys. A side panel has switches for what the agent can see and do in each part of the app, and the chat box is still there." caption="One page for both of you. Five ways to answer, and the chat box is only one of them." >}}

The second change is where the conversation happens. The agent no longer describes the app to me in a chat window. We both work on the app's own page: what it does shows up there, and what I do, it can see.

Once we share a surface, I can answer in whichever way is quickest:

- **Words.** The chat box stays. "Plan my afternoon" is best said as a sentence.
- **Yes / no buttons.** Most of my replies to an agent are yes or no, and a button beats typing "yes, go ahead".
- **A pen.** Circle the thing and write "split this in two" next to it. The stroke lands on an object in the app's state, so the agent knows which task I mean without my describing it.
- **Shortcut keys.** <kbd>A</kbd> to add, <kbd>R</kbd> to reject, <kbd>Z</kbd> to undo what the agent just did.
- **Switches.** The access panel from the first picture, on the page, where I can find it.

Part of this runs today too. In Schedule Everything, when my agent goes through my inbox and calendar for things I should do, it never adds a task itself. Its suggestions appear on my task board, dashed and labelled with who suggested them and why, each with two buttons: **Add to my tasks** and **Reject**. That is a yes/no button on a shared page, and it replaced a paragraph of chat. I wrote about the rest of that app in [the previous post](/p/time-management/). The pen and the shortcut keys are not built yet.

## What this is not

At [AutoPhD](https://github.com/AutoPhd-org) we do not make better models, and we do not make better harnesses. Both are improving quickly without us, and an app built this way should work with whichever harness you use next year.

All we try to do is build the best interface for each scene of daily life and work where a person and an agent meet: one where they understand each other easily, and the agent gets the job done for less. We start with the scenes I live in as a PhD student: planning a week, reading papers, keeping an eye on GPU servers.

## Three years

So what should software look like three years from now? These are my bets.

1. **Apps ship their state.** A state document and a list of commands become as ordinary as a mobile layout is today. An app without them will feel like a website that does not work on a phone.
2. **Agent access is a settings page.** What an agent can see and do in an app is a panel of switches you can find in ten seconds.
3. **The chat box is one control among several.** It sits beside buttons, pens and keys, on the app's own page.
4. **The GUI does not go away.** It becomes the place where you and your agent meet.

If I am right, what decides whether software does well in the next three years is how easily a person and an agent can use it together, more than how smart the model inside it is.

The code so far is at [AutoPhD](https://github.com/AutoPhd-org): [LaunchX](https://github.com/AutoPhd-org/launchx) with its [contract](https://github.com/AutoPhd-org/launchx/blob/main/SPEC.md), and [Schedule Everything](https://github.com/AutoPhd-org/schedule-everything). If you build an app this way, or think I have this wrong, open an issue there. I would like to hear it.
