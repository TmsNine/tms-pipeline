# Getting started

> Deep dive. The [README](../README.md) has the condensed tutorial; this page expands on prerequisites,
> installation, the first task and upgrading. Russian version — [01-getting-started.ru.md](01-getting-started.ru.md).

## What tms-pipeline is

tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to reviewed
code, keeping the agent's context clean at each step. You install it on top of an existing project, then
give the agent commands (skills) and it walks the task to finished code one stage at a time.

A few words you will meet below:

- **skill** — a command like `/tms-01-research` that you give the agent to run one step of the work.
- **context window** — the agent's working memory: everything it can see and hold at once. The more
  clutter in it, the worse the answer. The whole point of the pipeline is to hand the agent only what it
  needs at each step instead of dumping the entire task on it at once.
- **AGENTS.md** — your project's settings file: where tasks live, what language to write in, your test
  commands, your rules. Agents read it to learn the specifics of your repository.

Be clear up front about what tms-pipeline **is** and **is not**:

- It **is** a process that carries one task through eight stages to code that is ready to merge.
- It **is not** a project generator: it does not invent features, build an app from nothing, or replace
  your product decisions. What to build is up to you.

Most of the work happens on paper: every stage leaves one text document (`.md`) in the task folder — a
ticket, research, a design, a plan, a review, a report. Code is written in stage 04 (implementation);
stage 04b (code review) may add fixes for what the reviewers found. You are asked to stop and decide
twice: after the design (02) and at the gate (06). For the full tour of the stages, see
[the stages deep dive](04-stages-deep-dive.md).

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
in their places. It is a one-time run, not one of the pipeline stages.

> **Which skill to pick.** No project yet (no code, no tasks) → `/tms-new`. Project already exists (code
> and/or docs in place) → `/tms-init` (see below). If you run `/tms-init` on an empty repository, it will
> point you to `/tms-new` itself.

## Step 1. Install

Setup is split into two halves on purpose. First the **installer** runs — an ordinary terminal program
that just puts files in place. Then the **agent** takes over: `/tms-init` reads your repository and fills
in the settings.

### The installer

```bash
npx tms-pipeline
```

Until the npm package is published, run it straight from GitHub:

```bash
npx github:TmsNine/tms-pipeline
```

The installer asks only three things: the language, which tool you use (Claude Code, Codex or both), and
the path to your project. Then it:

- copies the skills, the agent roles and the `/tms-init` command into `~/.claude` and/or `~/.codex` (it
  asks first; for Claude Code you can decline and use the plugin route below instead);
- writes a starter `AGENTS.md` into your project, plus `.claude/CLAUDE.md` if you use Claude Code.

It never overwrites a file that already exists unless you pass `--force`. Useful flags:

| Flag | What it does |
|---|---|
| `--yes` | No questions, accept every default. |
| `--dry-run` | Show what would be written; change nothing. |
| `--force` | Overwrite existing project files and installed skills/agents. |
| `--answers <file>` | Read the answers from a JSON file (this is how `/tms-init` calls it). |
| `--version`, `--help` | Print the version or the help. |

### Or: the Claude Code plugin

For Claude Code there is a second way to get the skills and agents — the plugin marketplace, inside
Claude Code:

```text
/plugin marketplace add TmsNine/tms-pipeline
/plugin install tms-pipeline@tms-pipeline
/reload-plugins
```

**Pick one route for Claude Code — the plugin or the installer's copy, not both** — or every skill will be
there twice. The plugin updates through `/plugin`; the copy you update yourself by re-running the
installer with `--force` (see [upgrading](#upgrading-from-01x) for the one catch). The plugin does not
write `AGENTS.md`; `/tms-init` does that in the next step.

### Codex

Codex reads `AGENTS.md` directly and has no plugin command, so its skills and agents must sit where Codex
looks for them, under `~/.codex`:

- easiest: run the installer, choose Codex, and accept the copy — it copies `codex-skills/` →
  `~/.codex/skills/` and `codex-agents/` → `~/.codex/agents/`;
- by hand: `cp -R codex-skills/* ~/.codex/skills/ && cp -R codex-agents/* ~/.codex/agents/`.

For the differences between the two tools, see [configuration](02-configuration.md#codex).

## Step 2. `/tms-init` — fill in the settings

Open your project in Claude Code or Codex and run:

```text
/tms-init
```

`/tms-init` reads your repository (test and build commands from the package manifest and CI config,
ticket-ID patterns from git history, existing docs and backlog) and **fills in `AGENTS.md` for you**. It
asks only about what it could not read for itself, chiefly where your documentation base is.

A few fields need your decision and can't be guessed from the code — for example, which changes need a
security check, how each customer's data is kept apart, how you change the database schema, where your
list of already-failing tests lives. `/tms-init` leaves those marked `<<TODO>>` and sends you to the
[manual setup](05-manual-setup.md) guide, which has a ready prompt for each.

### Or: fill in `AGENTS.md` by hand

If you'd rather understand everything first: read [the methodology](00-methodology.md), copy
`templates/AGENTS.template.md` into your repository as `AGENTS.md` (and `templates/CLAUDE.template.md` as
`.claude/CLAUDE.md` for Claude Code), and replace the placeholders yourself — the
[configuration](02-configuration.md) page explains each one.

> Not sure what to put in a placeholder? Don't guess — ask your agent to read your code and propose a
> value, then confirm or correct it.

## Step 3. Check the install

In Claude Code, run `/help` or open the skills list — you should see the `tms-*` skills: `tms-run`,
`tms-00-ticket` … `tms-06-gate`, `tms-new`, `tms-ui-screen` and the audit skills. Codex shows the same
names, except that the audit and refactoring skills are numbered (`tms-90-audit-scope` and so on).

## Step 4. Your first task

Pick one real task from your backlog and run:

```text
/tms-run <TICKET-ID>
```

`tms-run` carries the task through all eight stages, each in its own fresh context, and leaves one
document per stage in the task folder (`docs/<TICKET-ID>/` by default):

| # | Stage | Document | Your part |
|---|---|---|---|
| 00 | Ticket | `00_ticket.md` | you say what the task is |
| 01 | Research | `01_research.md` | — |
| 02 | Design | `02_design.md` | **you read and approve the design** |
| 03 | Plan | `03_plan.md` | the lead signs it |
| 04 | Implementation | `04_implementation.md` | — |
| 04b | Code review | `04b_review.md` | — |
| 05 | Test report | `05_test_report.md` | — |
| 06 | Gate | `06_review_gate.md` | **you decide** |

The pipeline waits for you after the design and at the gate; silence is never taken as approval, and only
a human writes `go`. If you prefer to go stage by stage, run the stage skills yourself in order, starting
with `/tms-00-ticket <TICKET-ID>`.

To see what the documents look like before running your own task, open the worked example in
[`templates/example-task/ACME-101/`](../templates/example-task/ACME-101/) — one synthetic task run end to
end.

## Upgrading from 0.1.x

Version 0.2.0 renamed and merged several skills. The installer adds the new ones but **never deletes old
skills**, so after upgrading remove the retired `tms-*` folders by hand from `~/.claude/skills/` and
`~/.codex/skills/` — the full list is in the [CHANGELOG](../CHANGELOG.md).

Then put the new version in place: update the plugin, or re-run the installer with `--force`. One catch:
`--force` also overwrites your project's `AGENTS.md` and `.claude/CLAUDE.md`. Back them up first, or give
the installer an empty folder as the project path so that only the skills and agents are replaced.
Finally run `/tms-init` again so your `AGENTS.md` gets the new sections described in
[configuration](02-configuration.md).

→ What each stage does under the hood — in [the stages deep dive](04-stages-deep-dive.md). Which model
runs each role — in [model routing](06-model-routing.md).
