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

2. **Collect the answers.** `installer/core/questions.js` in this plugin is the SINGLE source of truth
   for the question list — **read that file** and ask exactly its `QUESTIONS` (with their defaults) and
   its `CONFIRMS` (the y/n choices: **Do you use Claude Code?**, **Do you use Codex?**, copy the pipeline
   template?, copy the docs-vault skeletons?). Ask them in one compact batch (group them; don't drip one
   at a time). Do not hardcode or invent questions — if the file changes, your questions change with it.
   Also ask one more y/n when the user uses Codex: **copy the tms-\* skills + agents into ~/.codex now?**
   (Codex has no `/plugin install` equivalent.)

3. **Generate the config by calling the shared engine — do NOT re-implement rendering.** Write the
   collected answers to a temp JSON file and run the canonical CLI so the output is byte-identical to
   `npx tms-pipeline`:

   ```bash
   node <plugin-dir>/installer/cli/index.js --answers /tmp/tms-init-answers.json
   ```

   The JSON shape (all keys optional; missing ones fall back to the questions.js defaults):

   ```json
   {
     "targetDir": "<abs path to the project>",
     "answers": { "OUTPUT_LANGUAGE": "…", "PROJECT_ONE_LINER": "…", "…": "…" },
     "useClaude": true, "useCodex": true,
     "copyPipeline": true, "copyDocsVault": false, "copyCodexAssets": true
   }
   ```

   Run with `--dry-run` first if you want to preview the file list, then again without it. The engine
   always writes `AGENTS.md`, writes `.claude/CLAUDE.md` only when `useClaude`, copies Codex assets only
   when `useCodex` **and** `copyCodexAssets`, and never overwrites an existing AGENTS.md/CLAUDE.md unless
   you pass `--force` (ask the user before forcing). Leaving rendering to the engine is mandatory — it is
   the only thing that guarantees `/tms-init` and the CLI never drift.

4. **Lay down skeletons (if chosen).** Copy `templates/pipeline/` to the task-folder root and/or
   `templates/docs-vault/` into the doc base. Remind the user to rename the `PROJECT_NAME` folder.

5. **Report and hand off.** List what was written, name every remaining `<<TODO>>` the user must resolve
   (especially `PROFILE_C_TRIGGERS`, `MIGRATION_POLICY`, and tenancy/identity details — these need human
   judgement), and point them at the first real step: `/tms-ticket <their first ticket>`.

## Tone
Match the user's `OUTPUT_LANGUAGE` and `AUDIENCE_PROFILE` as soon as you know them. Keep it short and
practical — this is setup, not a lecture.
