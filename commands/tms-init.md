---
description: Agent-driven onboarding — read the repo and fill AGENTS.md by discovery, asking the user only about genuine gaps. The thin `npx tms-pipeline` installer placed the skills + a stub; this finishes the job.
---

# /tms-init — agent-driven onboarding

Turn the **starter `AGENTS.md`** (the thin `npx tms-pipeline` installer drops one that is mostly
`<<TODO>>`) into a real, filled config by **reading the repository** — asking the user only what you
genuinely cannot discover. The terminal installer only placed skills + a stub; you are the other half.

This onboards an **EXISTING** project. It does NOT create a product or invent features. If the repo
looks empty (no source, no docs), say so and offer `/tms-new` instead.

## Principles

- **Discover first, ask second.** Never ask for something you can read from the repo.
- **One compact batch** of questions for the true gaps, in the user's `OUTPUT_LANGUAGE`.
- **Don't guess deep judgment calls.** Leave them as `<<TODO>>` and point to the tutorial rather than
  inventing tenancy models, migration policies, or Profile-C triggers.

## 1. Locate & confirm

- Find the repo root. Confirm there is source code and ideally a documentation base / backlog.
- Read `AGENTS.md` if present (the stub you will fill). The canonical field list is
  `installer/core/questions.js` in this plugin — read it (`QUESTIONS` + `DEFERRED_TOKENS`) so you know
  every token `AGENTS.md` needs and which are meant to be deferred.

## 2. Scan the repo (discover — do NOT ask)

Read in parallel where you can, and map findings to tokens:

- **Validation commands** → `TEST_CMD` / `BUILD_CMD` / `LINT_CMD` / `TYPECHECK_CMD`. Read
  `package.json` scripts, or `Makefile` / `pyproject.toml` / `Cargo.toml` / `go.mod`, and
  `.github/workflows/*`. Prefer script names that actually exist; leave blank if there is none.
- **Project one-liner + stack** → `PROJECT_ONE_LINER`. Draft it from the README / package metadata.
- **Ticket-ID format** → `TICKET_ID_FORMAT`. Scan `git log` and existing docs/backlog for an ID pattern
  (e.g. `ABC-123`). It is a **format example**, not an auto-numbering prefix — say so if the user asks.
- **Backlog** → `BACKLOG_LOCATION`. Find the backlog file.
- **Task folder pattern** → `TASK_FOLDER_PATTERN`. Infer, else default `docs/<TICKET-ID>/`.
- **Doc base** → `DOC_BASE_PATH`. Detect an existing docs tree. Note: an **external vault**
  (Obsidian/Notion) usually cannot be discovered from the repo — plan to ask for it.

## 3. Confirm + fill gaps (one batch, user's language)

Show a compact table of what you discovered (token → proposed value → source). Ask the user only to
**confirm or correct**, plus the things you could not find — especially:

- **`DOC_BASE_PATH`** — where their knowledge base / vault lives (an Obsidian/Notion path, or a path in
  the repo). If they have none and want one, offer to create the skeleton (see step 4).
- **`AUDIENCE_PROFILE`** — who reads the output (sets the tone/altitude). One short answer.

Leave the deep judgment tokens — `PROFILE_C_TRIGGERS`, `PERSISTENCE_AND_TENANCY`, `MIGRATION_POLICY`,
`LAUNCH_STAGE_MAPPING`, `TRACEABILITY_LOCATION`, `CODE_LAYOUT_HINT`, `DOC_INDEX_HINT`,
`DESIGN_SYSTEM_HINT` — as `<<TODO>>` unless the user volunteers them. They are covered in step 5.

## 4. Render via the engine (do NOT hand-write AGENTS.md)

Write the assembled answers to a temp JSON and run the canonical engine so the output is byte-identical
to `npx tms-pipeline`:

```bash
node <plugin-dir>/installer/cli/index.js --answers /tmp/tms-init-answers.json
```

JSON shape (all keys optional; missing ones fall back to the `questions.js` defaults):

```json
{
  "targetDir": "<abs path to the project>",
  "answers": { "OUTPUT_LANGUAGE": "…", "TEST_CMD": "…", "DOC_BASE_PATH": "…", "TICKET_ID_FORMAT": "…" },
  "useClaude": true, "useCodex": true,
  "copyDocsVault": false
}
```

- Set `copyDocsVault: true` (together with `DOC_BASE_PATH`) **only** when the user has no doc base and
  wants the skeleton. The engine writes the vault to `DOC_BASE_PATH` — an absolute Obsidian/Notion path
  or a repo-relative path — **not** blindly into `repo/docs`.
- Run with `--dry-run` first to preview the file list, then again for real.
- Never pass `--force` without explicit consent that names the full scope: it may overwrite existing
  `AGENTS.md`, `.claude/CLAUDE.md`, copied pipeline/doc-base template files, and installed Claude/Codex
  skills, commands, and agent-role files. Without `--force`, all existing files are preserved.
- Do **not** copy the per-task pipeline forms into the repo. The stage skills generate those documents
  per task; a template copy in the user's repo is redundant.

## 5. Report + hand off

- List what was written and every remaining `<<TODO>>` the user must still resolve.
- Point them to **`docs/05-manual-setup.md`** — a guided walkthrough with ready-to-paste prompts for the
  deep judgment fields (Profile-C triggers, tenancy/identity, migration policy, doc structure). Offer to
  do it now, one field at a time, reading the code with them.
- Then the first real step: `/tms-ticket <their first ticket>`.

## Tone

Match `OUTPUT_LANGUAGE` and `AUDIENCE_PROFILE` as soon as you know them. Keep it short and practical —
this is setup, not a lecture.
