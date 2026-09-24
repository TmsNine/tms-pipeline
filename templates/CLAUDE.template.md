<!--
  CLAUDE.template.md — Claude Code-specific rules for tms-pipeline.
  Copy to .claude/CLAUDE.md and keep the AGENTS.md import below.
-->

# <Your Project> — Claude Code Context

@./AGENTS.md
<!-- Adjust the relative path if AGENTS.md is one level above .claude/. -->

---

Everything shared lives in `AGENTS.md`. This file contains only Claude Code-specific execution rules.

## Pipeline

The methodology lives in the skills, not in this file. Eight stages, `tms-00-ticket` → `tms-06-gate`,
orchestrated by `tms-run`. Invoke the stage you were asked for and only that one.

Stage 04 is carried by one executor — the stage agent itself — for the whole plan, with one
`tms-security` pass over the assembled diff when a security trigger fires (`AGENTS.md` → *Security
Triggers*). There are no per-phase escorts and no risk profiles; `tms-04-implement` defines this.
Stage 01 may fan out cheap read-only gatherers (`tms-explorer`) as that skill describes, and nothing
else. Stage 04b runs up to five fresh independent `tms-reviewer` passes with a stagnation rule.

## Models and effort — pinned per role, not chosen by hand

`tms-run` dispatches every stage by `subagent_type`, and each agent in `~/.claude/agents/` pins its own
model by full id and its effort:

| Agent | Tier | Effort | Used for |
|---|---|---|---|
| `tms-stage` | top | medium | 01, 04, 04b |
| `tms-stage-deep` | top | high | 02, then 03 (resumed) |
| `tms-stage-light` | cheaper | medium | 05, 06 |
| `tms-reviewer`, `tms-security`, `tms-architect` | top | high | review passes, security |
| `tms-developer` | top | medium | bounded fixes |
| `tms-explorer` | cheaper | medium | research fan-out |
| `tms-tester` | cheaper | low | named checks |

The exact model ids are in each agent's frontmatter; edit them there when your plan or a newer model
changes what "top" and "cheaper" mean. Never dispatch a stage as `general-purpose` (it inherits whatever
the chat runs on), and never pin by a short alias — an alias can resolve to different models over time.
For search use `tms-explorer`, not the built-in `Explore`. `permissionMode` in agent frontmatter applies
to agents copied into `~/.claude/agents/` but is ignored for plugin-shipped agents.

## Auto Mode Discipline — no speculative expansion

Auto mode removes the permission prompt; it does not widen scope.

**Forbidden:**

- Subagents beyond what the stage skill names. No "also run a security pass to be sure" — security runs
  only on the explicit triggers.
- Speculative `bash` / `grep` / `read` / file listing "just to be safe". Every call is tied to the
  current step's deliverable.
- Parallel side-investigations. One hypothesis at a time; a second one goes to the owner.
- "While I'm here" cleanup, refactor or doc edits found in passing. Capture and move on.
- Retrying a failed approach with a slightly reworded prompt. Surface the failure instead.

**Still required:**

- Parallel dispatch of independent work the stage skill names (research fan-out over an enumerable
  set).
- Parallel tool calls when independent and needed for the same step.
- Acting without confirmation on local, reversible work unambiguously inside the current scope.

**Heuristic before any call:** would I have run this without auto mode, with the owner watching? If the
honest answer is "probably not, I was being thorough" — do not run it.
