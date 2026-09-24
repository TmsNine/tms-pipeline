# AGENTS.md

This file applies to the whole repository unless a deeper `AGENTS.md` overrides it.

## Purpose

This repository is the public source package for `tms-pipeline`: the delivery-methodology skills,
installer, templates, documentation, and examples used to set up the process in other projects.

Do not treat this repository as an installed customer project. The generated `AGENTS.md`, `.claude/`,
and task pipeline folders are outputs of the installer when it runs in a user's repo; here we maintain
the source templates and packaged skills.

## Operating Standard

- Match the user's language. If the user writes in Russian, answer in Russian. Public docs in this repo
  are bilingual: Russian is the primary authoring language, English follows it.
- Keep public-facing explanations understandable to a product owner, not only to a developer. Explain
  operational consequences plainly: what changes, why it matters, what remains.
- Avoid optimistic filler. Report concrete status: what changed, what was validated, what is still risky.
- Product/pipeline interview questions must be self-contained: describe the real scenario, why the
  decision matters, day-to-day consequences, 2-3 plain-language options, and one recommendation.
- Keep global collaboration rules in global files (`AGENTS.md`, templates, skills, docs). Do not bury
  project-wide process changes inside one task artifact.
- Preserve unrelated user changes. Do not revert, overwrite, reformat, delete, stage, commit, or push
  work you did not create unless explicitly asked.
- Verify uncertain claims against repository evidence: code, tests, docs, manifests, scripts, or command
  output. Do not present guesses as current fact.

## Repository Layout

- `skills/` — Claude Code skill tree. These names are the Claude-facing `/tms-*` commands.
- `codex-skills/` — Codex skill tree. Stage skills, `tms-run`, `tms-new` and `tms-ui-screen` share the
  Claude names; the audit and refactoring skills use Codex-native numbered names (`tms-90-audit-scope` …
  `tms-96-ui-refactoring`).
- `agents/` — Claude Code role agents; each pins its model by full id and its effort.
- `codex-agents/` — Codex-native TOML role configs installed into `~/.codex/agents`.
- `commands/` — onboarding command sources, currently `/tms-init`.
- `installer/` — zero-dependency Node installer and tests.
- `templates/` — generated project templates: `AGENTS`, `CLAUDE`, pipeline artifacts, doc-base skeletons,
  and worked examples.
- `docs/` — public methodology and setup documentation in English and Russian.
- `.claude-plugin/` and `.codex-plugin/` — plugin manifests.

Use `rg --files` for discovery instead of assuming this list is exhaustive.

## Public-Release Rules

- Never publish private project facts, private paths, customer names, real tickets from another
  repo, secrets, tokens, credentials, or local machine details.
- Examples must be synthetic or clearly generic. Use placeholder IDs like `ACME-101`, not real backlog IDs
  from customer work.
- If adapting rules from a real project, keep the process principle and remove the domain-specific facts.
- Do not add generated installer output to the public package unless it is intentionally a template or
  example under `templates/`.
- If a docs change affects public usage, update both Russian and English docs where the repo already has
  paired files.

## Skill Trees And Manifests

- Claude Code skills live in `skills/`; Codex skills live in `codex-skills/`. The eight stage skills,
  `tms-run` and `tms-ui-screen` are byte-identical in both trees (a test enforces it). The audit and
  refactoring skills keep tool-native naming and runtime-specific sections.
- `.claude-plugin/plugin.json` must list every directory under `skills/`.
- `.codex-plugin/plugin.json` must list every directory under `codex-skills/`.
- If adding, renaming, or removing a skill, update manifests and run the tests that enforce manifest/disk
  parity.
- Validate skill frontmatter after edits. The current package validator rejects unsupported keys such as
  `argument-hint`; keep descriptions and frontmatter free of schema-breaking syntax even if a local
  runtime copy contains extra UI metadata.
- Keep `agents/openai.yaml` metadata in each skill directory when present.

## Pipeline Methodology Canon

The public pipeline has eight stages, each run in a fresh context and each leaving one artifact in
`docs/<TASK-ID>/`:

`00_ticket` → `01_research` → `02_design` → `03_plan` → `04_implementation` → `04b_review` →
`05_test_report` → `06_review_gate`, orchestrated by `tms-run`.

- Two owner stops: after design (02) and at the gate (06). The lead signs the plan (03). Only a human
  writes `go`; the lead may sign `conditional_go` when only execution remains.
- Stage 04 has one executor for the whole plan and one security pass over the assembled diff when a
  security trigger fires. No risk profiles, no per-phase escorts, no fingerprints.
- Stage 04b runs up to five fresh independent read-only review passes with a stagnation rule, routes
  every finding (fixed / backlog proposal / trigger register / dropped) and holds no score or verdict.
- File Ownership in the plan is a hard boundary for implementation.
- Model and effort are pinned per agent role (`agents/*.md`, `codex-agents/*.toml`).
- Keep templates, the worked example, README, methodology docs, deep-dive docs, and skills consistent
  with this chain. When changing process semantics, update the skill text first, then the docs and
  templates that teach it.

## Installer Rules

- The installer is intentionally thin. It selects language/tooling, installs skills/agents, and writes
  starter project files. Deep project-specific discovery belongs to `/tms-init`, not the terminal wizard.
- Claude asset copy uses `skills/` plus `agents/` and `commands/`.
- Codex asset copy uses `codex-skills/` plus `codex-agents/`.
- Do not make the installer overwrite existing user files unless `--force` is explicitly used.
- Preserve dry-run behavior: `--dry-run` reports actions without writing.
- Keep the installer zero-dependency unless there is a strong public maintenance reason to change that.

## Documentation Rules

- Russian docs are canonical where a Russian pair exists; English docs should be kept aligned.
- Avoid maintaining fake file inventories in docs. Prefer explaining stable entry points and discovery
  commands.
- Public docs should explain the methodology, setup, and operational consequences without assuming the
  reader knows Claude Code, Codex, or agent workflows.
- If a user-visible behavior changes, update `CHANGELOG.md` under `## [Unreleased]`.
- Keep README quick-start commands accurate for both tools. Manual Codex install commands must copy
  `codex-skills/*`, not `skills/*`.

## Testing And Validation

Run the smallest meaningful checks for the changed surface:

- Installer/tests/templates/manifests: `node --test`.
- Markdown docs and relative links: `npm run check:links`.
- Skill changes: run the local skill validator over touched skill directories; for broad skill-tree edits,
  validate both `skills/tms-*` and `codex-skills/tms-*`.
- If package contents change, check `package.json` `files` includes the public source directories needed
  by `npx tms-pipeline`.

Treat non-zero exits as failed validation. If a check cannot run, state why and name the best substitute
signal.

## Editing Discipline

- Keep diffs focused. Do not fold unrelated cleanup into a skill/docs/installer change.
- Prefer the repo's existing style and zero-dependency Node patterns.
- Do not add production/package dependencies without explicit approval.
- Use `apply_patch` for manual source edits.
- Avoid broad generated churn. If a mechanical rewrite is necessary, explain it and validate afterward.
- Do not add AI attribution to commit messages or generated public artifacts.

## Completion Protocol

When finishing work in this repo, report:

- what changed and why;
- which public surfaces were affected (`skills/`, `codex-skills/`, installer, templates, docs, manifests);
- validation commands and results;
- any follow-up or release note still needed.

If the change is meant for public release, explicitly mention whether private/project-specific references
were checked and removed.
