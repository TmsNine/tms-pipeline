# Getting started

> Deep dive. The [README](../README.md) has the condensed tutorial; this page expands on prerequisites,
> the two on-ramps, and installation. Russian version — [01-getting-started.ru.md](01-getting-started.ru.md).

## What tms-pipeline is

tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to reviewed
code, keeping the agent's context clean at each step. You install it on top of an existing project, then
give the agent commands (skills) and it walks the task to finished code one step at a time.

A few words you will meet below:

- **skill** — a command like `/tms-research` that you give the agent to run one step of the work.
- **context window** — the agent's working memory: everything it can see and hold at once. The more
  clutter in it, the worse the answer. The whole point of the pipeline is to hand the agent only what it
  needs at each step instead of dumping the entire task on it at once.
- **AGENTS.md** — your project's settings file: where tasks live, what language to write in, your test
  commands, your rules. Agents read it to learn the specifics of your repository.

Be clear up front about what tms-pipeline **is** and **is not**:

- It **is** a process that carries one task through staged checks to code that is ready to merge.
- It **is not** a project generator: it does not invent features, build an app from nothing, or replace
  your product decisions. What to build is up to you.

Most of the work happens on paper: every stage except 04 produces a text document (`.md`) — a plan, a
design, a review loop, a report. Code appears in only one stage — 04 (implementation). For the full tour of
the stages, see [the stages deep dive](04-stages-deep-dive.md); it also shows which agents and models run
at each one.

## Prerequisites — read this first

Because tms-pipeline installs **on top of an existing project**, before you start you should have:

- a repository with real source code;
- a documentation base — the place where lasting product and architecture knowledge lives: a `docs` tree,
  a wiki, an Obsidian vault, anywhere;
- ideally a backlog (a list of tasks waiting to be done).

If your project has no docs or backlog yet, the bundled blank templates (`templates/docs-vault/`) give you
a starting structure, but filling them with real product decisions is your work, done the way you already
work.

### If you don't have a project yet

Everything above assumes a project already exists. If you are starting completely from scratch, there is a
separate skill, **`/tms-new`** — a one-time setup for a brand-new product. It walks you through an
interview, one question at a time, and at the end sorts your answers into a starter document set and a
backlog.

`/tms-new` does not invent the product for you: what to build is your call, and it only puts your answers
in their places. It is a one-time run, not one of the pipeline stages. Details in the
[README](../README.md).

> **Which skill to pick.** No project yet (no code, no tasks) → `/tms-new`. Project already exists (code
> and/or docs in place) → `/tms-init` (see below). If you run `/tms-init` on an empty repository, it will
> point you to `/tms-new` itself.

## The two on-ramps

Both are free and use the same core, which works the same in either tool (Claude Code or Codex).

### A. Turnkey — installer, then your agent

Onboarding is split into two halves on purpose. First the **installer** runs — an ordinary terminal
program that just puts files in place. Then the **agent** takes over: the `/tms-init` skill reads through
your repository and fills in the settings.

```bash
# 1. Installer — pick language + tool(s), install the skills, create a starter AGENTS.md.
#    It does NOT ask about your project (test commands, ticket format, doc paths).
npx tms-pipeline
#    At the install step there are two ways to place the skills. Use ONE of them, or the skills will be
#    duplicated:
#      - either the installer copies the skills into ~/.claude / ~/.codex (it offers to do this);
#      - or, for Claude Code only, through the plugin marketplace (commands below).
#    Pick the marketplace if you want updates through /plugin; pick copying if you'd rather keep the
#    files yourself and update them by hand.
/plugin marketplace add TmsNine/tms-pipeline
/plugin install tms-pipeline@tms-pipeline
/reload-plugins
```

```text
# 2. Inside Claude Code / Codex — finish setup by reading the repo:
/tms-init
```

`/tms-init` scans your repository (test and build commands from `package.json` / CI config, ticket-ID
patterns from git history, existing docs and backlog) and **fills in `AGENTS.md` for you** — that same
project settings file. It asks only about what it could not read for itself, chiefly where your
documentation base is.

A few fields need your decision and can't be guessed from the code (for example: which parts of the code
need extra scrutiny, whether the system keeps each customer's data separate, how you change the database
schema). For those, `/tms-init` sends you to the [manual setup](05-manual-setup.md) guide with
ready-to-paste prompts.

### B. By hand — wire it all up yourself

If you'd rather understand the methodology first and connect everything by hand:

1. Read [the methodology](00-methodology.md).
2. Install the plugin (the two `/plugin` commands above), or copy the `skills/` and `agents/` folders into
   your `~/.claude/` (and `~/.codex/skills/` for Codex).
3. Copy `templates/AGENTS.template.md` into your repository as `AGENTS.md` and fill in the placeholders by
   hand (see [configuration](02-configuration.md)).

> Not sure what to put in the placeholders? Don't guess on your own — ask your AI agent (Claude Code or
> Codex) to read your code and propose the values, then confirm or correct them.

## Verify the install

In Claude Code, run `/help` or open the skills list — you should see the `tms-*` skills. Then start a task
(see the tutorial in the README).

## Codex

Claude Code and Codex are the two AI tools the pipeline can run in; you need only one of them. Codex reads
`AGENTS.md` natively, so the methodology works exactly the same way, and the skills themselves don't
care which tool they run in. Codex has no `/plugin install` equivalent, so its skills and agents have to go where Codex
looks for them — under `~/.codex`:

- easiest: run `npx tms-pipeline`, choose Codex, and accept the copy prompt — the installer copies
  `codex-skills/` → `~/.codex/skills/` and `agents/` → `~/.codex/agents/`;
- by hand: `cp -R codex-skills/* ~/.codex/skills/ && cp -R agents/* ~/.codex/agents/`.

For the directory differences, see [configuration](02-configuration.md#codex).

## See a worked example

[`templates/example-task/ACME-101/`](../templates/example-task/ACME-101/) holds a complete synthetic run
of one task through the staged pipeline, including the 04b loop review:

- `00_ticket.md` — the ticket (the task statement);
- `01_research.md` — research;
- `02_design.md` — design;
- `02b_gap_audit.md` — gap audit;
- `03_delivery_plan.md` — delivery plan;
- `04_implementation.md` — implementation (the only stage where code appears);
- `04b_loop_review.md` — independent review/fix loop;
- `05_test_report.md` — test report;
- `06_review_gate.md` — final review.

Read the files in order to see the format of each stage before you run the pipeline on your own task.

→ What each stage does under the hood (which agents, on which models, exactly where your check is) — in
[docs/04-stages-deep-dive.md](04-stages-deep-dive.md).
