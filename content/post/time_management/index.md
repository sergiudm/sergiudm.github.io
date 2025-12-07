---
title: "Time Management: A CS Student's Trial"
date: 2025-12-03 09:00:00+0000
categories: 
    - "thoughts"
tags:
    - "thoughts"
---

There are two kinds of people: those who love planning every detail of their daily lives, and those who prefer to go with the flow, doing whatever feels right in the moment.

However, if you look closely, you may find that even the "spontaneous" types usually have a mental outline of a plan. The reality is that almost everyone working or studying needs a plan; the only difference is that some use tools to help them remember it, while others rely solely on their brains.

For those juggling various projects simultaneously, keeping everything in your head is a recipe for disaster. A tool, even just a scratchpad, is necessary to assist you in remembering *what* you need to do and *when* you need to do it.

But for those not used to rigorous planning, it's a tough work to start, or even to keep it going. The key is to make it **simple and frictionless**. Unfortunately, simplicity often conflicts with the complexity of real life. But wait, what if you are a CS student? Can we leverage the power of code to automate the boring parts while maintaining the capability to handle complex schedules?

The answer is yes. After trying numerous ways to manage my time, I finally built a solution that works for me.

# Problems

Before introducing my solution, let me summarize the specific problems I faced:

1.  Too many deadlines and small tasks to remember.
2.  Wasting time deciding what to do next instead of doing it.
3.  Hard to keep track of actual progress versus planned progress.
4.  Hard to handle unexpected tasks without ruining the whole schedule.
5.  When tasks aren't finished on time, they pile up, leading to anxiety and the **eventual abandonment of the entire plan**.

In addition, I want some simple yet useful features:

1.  **Habit Tracking:** Integrated directly into my daily schedule.
2.  **Review System:** Automated weekly/monthly reviews (e.g., working statistics, goal achievement).
3.  **Persistent Reminders:** Notifications that actually force me to take action, rather than ones I just swipe away.

# The Solution: [Schedule Everything](https://github.com/sergiudm/schedule-everything)

I tried tools like Notion (too manual/heavy), Google Calendar (good for events, bad for routine flows), and Todoist (great list, but lacks the "rhythm" of a day). None of them fully satisfied my need for a programmable, local, and persistent system.

So, I built **Schedule Everything**. It is a Python-based background service designed for macOS (and Linux) that manages our daily rhythm through configuration files.

It consists of three core components:

1.  **The Daemon:** A lightweight background process (managed by `launchd`) that monitors system time.
2.  **TOML Configuration:** Human-readable files where you define your schedule (when it happens) and your settings (what a task is, how long it lasts, how to remind, etc.).
3.  **The CLI:** A command-line tool (`reminder`) to manage ad-hoc tasks, view deadlines, and control the service.


## How to Use

Getting started is designed to be developer-friendly.

**1. Installation**
I wrote an install script that sets up the Python environment and the background service:

```bash
git clone https://github.com/sergiudm/schedule-everything.git
./install.sh
```

**2. Configuration**
You define your life in `~/schedule_management/config/`.
There are two types time elements:
- **Time Blocks:** Reusable chunks of time (e.g., "pomodoro" = 25 minutes of focused work).
- **Time Points:** Specific actions or reminders (e.g., "bedtime" = "Go to sleep! 😴").

You can define them in `settings.toml`:

```toml
[time_blocks]
pomodoro = 25
deep_work = 50
break = 10

[time_points]
bedtime = "Go to sleep! 😴"
```

Then, create your weekly schedule in `odd_weeks.toml` and `even_weeks.toml`:
```toml
[monday]
"09:00" = "deep_work"      # Starts at 09:00, ends at 09:50
"09:50" = "break"
"10:00" = "deep_work"
...

[tuesday]
"10:00" = "pomodoro"       # Starts at 10:00, ends at 10:25
"10:25" = "break"
...
...

[common]
"23:00" = "bedtime"        # Applies to every day
```

After setting up your configuration files, the daemon will read them and start the automatic reminders. You'll get notifications at the right times, helping you stay on track.

**3. The Command Line**
I use the CLI to manage tasks that don't fit into the fixed grid:

```bash
# Add a task with urgency 9 (1-10 scale)
reminder add "Finish OS assignment" 9

# Check task list ranked by urgency
reminder ls
# Optionally, some urgent tasks will pop up as notifications based on their deadlines

# Mark a task as done
reminder rm 1 # where 1 is the task ID from `reminder ls`
```
```bash
# Deadlines management
reminder ddl add "Project report" 12.10 # Add a deadline on 12th October
reminder ddl # List upcoming deadlines
reminder ddl rm 2 # Remove deadline with ID 2
```

>[!NOTE]
> For more details, check the [documentation](https://sergiudm.github.io/schedule-everything).

**4. Review System**
The system automatically generates daily, weekly and monthly reports based on your completed tasks and habits. You can specify where to save these reports in the configuration file.

## The Principles

Based on my experience, I summarized the following principles for making plans with this system:
- Make each task as small and specific as possible (e.g., "Refine the introduction of the report" instead of "Work on the report").
- Make it easy to see and adjust the plan.
- Let an external partner to remind and nudge you.
- Motivate yourself with visible progress.
- Distinguish between tasks that must be done at a specific time and those that can be done anytime. For the former, the system should send notifications at the right time.
- For tasks with `urgency > 7`, **kill it within before the next day**.

# Conclusion

This system might not be for everyone—if you love drag-and-drop interfaces, stick to Calendar. But if you are a developer who loves the terminal and configuration files, wants full control over their data, and believes that **your schedule is code**, Schedule Everything might be the tool that perfectly works for you.