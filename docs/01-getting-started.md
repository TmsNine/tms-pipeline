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

## The two on-ramps

Both are free and use the same decoupled core.

### A. Turnkey — configure with the wizard

For getting running quickly on your project:

```bash
# 1. Onboard your project (renders AGENTS.md + .claude/CLAUDE.md, optionally lays down skeletons)
npx tms-pipeline

# 2. Install the skills/agents into Claude Code
/plugin marketplace add TmsNine/tms-pipeline
/plugin install tms-pipeline@tms-pipeline
/reload-plugins
```

The `npx` wizard asks a short list of questions (press Enter to accept each default) and writes a filled
`AGENTS.md` and `.claude/CLAUDE.md` into your project. You can also run the onboarding from inside Claude
Code with `/tms-init`.

### B. Methodology — adopt it by hand

If you'd rather understand and wire it up yourself:

1. Read [the methodology](00-methodology.md).
2. Install the plugin (the two `/plugin` commands above), or copy the `skills/` and `agents/` folders into
   your `~/.claude/` (and `~/.codex/skills/` for Codex).
3. Copy `templates/AGENTS.template.md` to your repo as `AGENTS.md` and fill in the placeholders by hand
   (see [configuration](02-configuration.md)).

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
