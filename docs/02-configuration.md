# Configuration

> How to tailor tms-pipeline to your project. The wizard (`npx tms-pipeline` / `/tms-init`) fills most of
> this for you; this page is the reference for doing it by hand and for the values the wizard leaves as
> `<<TODO>>`.

## The canon: AGENTS.md + CLAUDE.md

The methodology reads your project specifics at runtime from two files:

- **`AGENTS.md`** (repo root) — the shared canon, read by Codex natively and imported by Claude Code.
- **`.claude/CLAUDE.md`** — Claude-Code-specific rules (the multi-agent implementation mob); it imports
  `AGENTS.md` via `@./AGENTS.md`.

Start from `templates/AGENTS.template.md` and `templates/CLAUDE.template.md`. Replace every
`{{PLACEHOLDER}}` and delete the `<!-- -->` / `« »` guidance notes (the wizard does this automatically).

## Values the wizard asks for

| Placeholder | Meaning |
|---|---|
| `OUTPUT_LANGUAGE` | Language for everything the user reads. |
| `AUDIENCE_PROFILE` | Who reads the output (e.g. non-technical owner vs senior engineer). |
| `PROJECT_ONE_LINER` | What the project is + stack. |
| `TASK_FOLDER_PATTERN` | Where per-task pipeline folders live (e.g. `docs/<TICKET-ID>/`). |
| `DOC_BASE_PATH` | Path to your documentation base. |
| `BACKLOG_LOCATION` | The backlog file (single source of truth for tasks). |
| `TICKET_ID_FORMAT` | e.g. `PROJ-123`. |
| `TEST_CMD` / `TYPECHECK_CMD` / `LINT_CMD` / `BUILD_CMD` | Your validation commands. |
| `LAUNCH_PLAYBOOK_LOCATION` | Where pre-launch manual actions are tracked. |

## Values you fill in by hand (the wizard leaves these as `<<TODO>>`)

These need human judgement — they are the most important to get right:

- **`PROFILE_C_TRIGGERS`** — the list of surfaces that force full (Security) escort during
  implementation: your auth/authz model, tenant-scoping/identity resolution, trust-boundary input
  validation, secrets/signing, payment surfaces, PII paths, and the exact module paths that house them.
  This is what makes the cost model fit *your* risk profile.
- **`PERSISTENCE_AND_TENANCY`** — how data is stored and how tenant/user identity is resolved and scoped.
- **`MIGRATION_POLICY`** — how schema changes are made and registered (delete if you have no database).
- **`LAUNCH_STAGE_MAPPING`** — which kind of manual action goes into which section of your launch playbook.
- **`TRACEABILITY_LOCATION`**, **`CODE_LAYOUT_HINT`**, **`DOC_INDEX_HINT`** — optional pointers; delete
  if not applicable.

Claude or Codex can help you draft these by reading your codebase — just ask after onboarding.

## Severity rubric

The gap-audit severity rubric (Class A/B/C/D) ships with sensible defaults in `AGENTS.md`. Adjust the
Class A examples to your risk model (e.g. a private internal tool may drop compliance language; a
multi-tenant SaaS should keep cross-tenant data exposure as Class A).

<a name="codex"></a>
## Codex parity

- Codex reads `AGENTS.md` natively — no separate import needed. The `.claude/CLAUDE.md` multi-agent rules
  apply conceptually, but the `Agent`-tool dispatch wording is Claude-Code-specific.
- The plugin manifest for Codex lives in `.codex-plugin/plugin.json`; for Claude Code it is
  `.claude-plugin/plugin.json`.
- Skills use the same `SKILL.md` format across both tools. Skill bodies are written tool-agnostically
  (they describe the task, not a specific tool like Read/Write), because the tool names differ between
  Claude Code and Codex.
- Custom subagents: Claude Code reads agent definitions from `agents/` (and `~/.claude/agents/`); Codex
  uses its own agents directory. The five mob roles in `agents/` are portable in content; place them
  where each tool expects them.
