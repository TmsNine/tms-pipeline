---
description: Onboard the tms-pipeline methodology onto an EXISTING project — generate AGENTS.md + CLAUDE.md and optionally lay down the pipeline / docs-vault skeletons.
---

# /tms-init — onboard tms-pipeline onto this project

You are configuring the tms-pipeline delivery methodology **on top of the user's existing project**.
This does NOT create a project, invent features, or brainstorm scope — it assumes the user already has a
repo, a documentation base, and ideally a backlog. Say this plainly if the project looks empty.

## What to do

1. **Confirm prerequisites.** Briefly check the repo has source code and some documentation base. If there
   is no backlog or doc base, tell the user this methodology expects one and offer to help create a
   minimal backlog from the `templates/docs-vault` skeletons — but don't pretend to generate a product.

2. **Collect the answers.** Ask the user the canonical onboarding questions. The single source of truth
   for the list is `installer/core/questions.js` in this plugin — ask exactly those, with the same
   defaults, one compact batch (group them; don't drip one at a time). Keep it minimal; do not invent
   extra questions. The tokens you need values for:
   - `OUTPUT_LANGUAGE`, `AUDIENCE_PROFILE`, `PROJECT_ONE_LINER`
   - `TASK_FOLDER_PATTERN` (default `docs/<TICKET-ID>/`), `DOC_BASE_PATH`, `BACKLOG_LOCATION`,
     `TICKET_ID_FORMAT`
   - `TEST_CMD`, `TYPECHECK_CMD`, `LINT_CMD`, `BUILD_CMD`
   - `LAUNCH_PLAYBOOK_LOCATION`
   And these yes/no choices: **Do you use Claude Code?**, **Do you use Codex?** (so we don't write
   anything unneeded — e.g. skip `.claude/CLAUDE.md` if they only use Codex), copy the pipeline
   template?, copy the docs-vault skeletons?

3. **Generate the config.** Prefer running the shared engine so output matches the CLI exactly:
   `node installer/core/engine.js` is a library — the simplest path is to run the CLI non-interactively,
   or replicate its behavior: render `templates/AGENTS.template.md` and `templates/CLAUDE.template.md`,
   stripping the `<!-- -->` comments and `« »` guidance notes, replacing `{{TOKENS}}` with the answers,
   and leaving any unanswered token as a visible `<<TODO: TOKEN>>`. Always write `AGENTS.md` (both tools
   read it). Write `.claude/CLAUDE.md` **only if the user uses Claude Code** (Codex reads `AGENTS.md`
   natively, so a Codex-only user needs no CLAUDE.md). Never overwrite an existing AGENTS.md/CLAUDE.md
   without asking.

4. **Lay down skeletons (if chosen).** Copy `templates/pipeline/` to the task-folder root and/or
   `templates/docs-vault/` into the doc base. Remind the user to rename the `PROJECT_NAME` folder.

5. **Report and hand off.** List what was written, name every remaining `<<TODO>>` the user must resolve
   (especially `PROFILE_C_TRIGGERS`, `MIGRATION_POLICY`, and tenancy/identity details — these need human
   judgement), and point them at the first real step: `/tms-ticket <their first ticket>`.

## Tone
Match the user's `OUTPUT_LANGUAGE` and `AUDIENCE_PROFILE` as soon as you know them. Keep it short and
practical — this is setup, not a lecture.
