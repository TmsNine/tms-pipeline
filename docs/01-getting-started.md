# Getting started

> Deep dive. The [README](../README.md) has the condensed tutorial; this page expands on prerequisites,
> the two on-ramps, and installation.

## Prerequisites — read this first

tms-pipeline configures a delivery methodology **on top of an existing project**. Before you start you
should have:

- a code repository with real source code;
- a documentation base (a docs tree, a wiki, an Obsidian vault — anywhere durable product/architecture
  knowledge lives);
- ideally a backlog of tasks.

It is **not** a project generator. It will not brainstorm features or scaffold an app from nothing. If
your project has no docs or backlog yet, the included blank skeletons (`templates/docs-vault/`) give you a
starting structure, but filling them with real product decisions is your work, done your way.

If you're starting completely from nothing, the **`/tms-new`** skill performs this one-time bootstrap for
you as a guided, one-question-at-a-time interview, and assembles a starter set of documents at the end.
The skill does not invent the product for you — you decide what to build; it just organizes your answers
into place. Details in the [README](../README.md).

## The two on-ramps

Both are free and use the same decoupled core.

### A. Turnkey — thin installer, then your agent

Onboarding has two halves on purpose: a **thin installer** that only places files, and an
**agent-driven `/tms-init`** that fills the config by reading your repo.

```bash
# 1. Thin installer — pick language + tool(s), install the skills, drop a starter AGENTS.md.
#    It does NOT ask about your project (test commands, ticket format, doc paths).
npx tms-pipeline
#    At the install step it can copy the skills into ~/.claude / ~/.codex. Alternatively, for
#    Claude Code use the plugin marketplace (use ONE method, not both, to avoid duplicate skills):
/plugin marketplace add TmsNine/tms-pipeline
/plugin install tms-pipeline@tms-pipeline
/reload-plugins
```

```text
# 2. Inside Claude Code / Codex — finish setup by reading the repo:
/tms-init
```

`/tms-init` scans your repository (test/build commands from `package.json`/CI, ticket-ID patterns from
git history, existing docs and backlog) and **fills `AGENTS.md` for you**, asking only about the gaps it
can't discover — chiefly where your documentation vault lives. For the few fields that need real
judgement (Profile-C triggers, tenancy, migration policy), it points you to the guided
[manual setup](05-manual-setup.md) with ready-to-paste prompts.

### B. Methodology — adopt it by hand

If you'd rather understand and wire it up yourself:

1. Read [the methodology](00-methodology.md).
2. Install the plugin (the two `/plugin` commands above), or copy the `skills/` and `agents/` folders into
   your `~/.claude/` (and `~/.codex/skills/` for Codex).
3. Copy `templates/AGENTS.template.md` to your repo as `AGENTS.md` and fill in the placeholders by hand
   (see [configuration](02-configuration.md)).

> Not sure what to put in the placeholders? Don't guess alone — ask your AI agent (Claude Code or Codex)
> to read your code and propose the values, then confirm or correct them.

## Verify the install

In Claude Code, run `/help` or open the skills list — you should see the `tms-*` skills. Then start a
task (see the tutorial in the README).

## Codex

Codex reads `AGENTS.md` natively, so the methodology applies the same way. The skill bodies are
tool-agnostic. Codex has no `/plugin install` equivalent, so its skills and agents must go where Codex
looks for them — under `~/.codex`:

- easiest: run `npx tms-pipeline`, select Codex, and accept the copy prompt — the wizard copies
  `skills/` → `~/.codex/skills/` and `agents/` → `~/.codex/agents/`;
- manually: `cp -R skills/* ~/.codex/skills/ && cp -R agents/* ~/.codex/agents/`.

See [configuration](02-configuration.md#codex) for the directory differences.

## See a worked example

[`templates/example-task/ACME-101/`](../templates/example-task/ACME-101/) is a complete synthetic run of
one task through all eight stages — from `00_ticket.md` to `06_review_gate.md`. Read the files in order to
see each stage's format before running the pipeline on your own task.

→ What each stage does under the hood (which agents, which models, where your check is) — in
[docs/04-stages-deep-dive.md](04-stages-deep-dive.md).
