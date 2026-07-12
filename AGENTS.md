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
- `codex-skills/` — Codex skill tree. These use Codex-native numbered names such as `tms-00-ticket`.
- `agents/` — role-agent prompts shared by the methodology.
- `codex-agents/` — Codex-native TOML role configs installed into `~/.codex/agents`.
- `commands/` — onboarding command sources, currently `/tms-init`.
- `installer/` — zero-dependency Node installer and tests.
- `templates/` — generated project templates: `AGENTS`, `CLAUDE`, pipeline artifacts, doc-base skeletons,
  and worked examples.
- `docs/` — public methodology and setup documentation in English and Russian.
- `.claude-plugin/` and `.codex-plugin/` — plugin manifests.

Use `rg --files` for discovery instead of assuming this list is exhaustive.

## Public-Release Rules

- Never publish private project facts, private paths, customer/school names, real tickets from another
  repo, secrets, tokens, credentials, or local machine details.
- Examples must be synthetic or clearly generic. Use placeholder IDs like `ACME-101`, not real backlog IDs
  from customer work.
- If adapting rules from a real project, keep the process principle and remove the domain-specific facts.
- Do not add generated installer output to the public package unless it is intentionally a template or
  example under `templates/`.
- If a docs change affects public usage, update both Russian and English docs where the repo already has
  paired files.

## Skill Trees And Manifests

- Claude Code skills live in `skills/`; Codex skills live in `codex-skills/`. Keep behavior aligned, but
  do not force byte-for-byte identity. Preserve tool-native naming, frontmatter, and model/tool wording.
- `.claude-plugin/plugin.json` must list every directory under `skills/`.
- `.codex-plugin/plugin.json` must list every directory under `codex-skills/`.
- If adding, renaming, or removing a skill, update manifests and run the tests that enforce manifest/disk
  parity.
- Validate skill frontmatter after edits. The current package validator rejects unsupported keys such as
  `argument-hint`; keep descriptions and frontmatter free of schema-breaking syntax even if a local
  runtime copy contains extra UI metadata.
- Keep `agents/openai.yaml` metadata in each skill directory when present.

## Pipeline Methodology Canon

The public pipeline currently has 9 durable task artifacts:

`00_ticket` → `01_research` → `02_design` → `02b_gap_audit` → `03_delivery_plan` →
`04_implementation` → `04b_loop_review` → `05_test_report` → `06_review_gate`.

- `04b_loop_review` is the independent review/fix loop between implementation and the test report.
- Stage 04 may differ by tool. Codex defaults to mono/main-agent implementation with explicit self-checks;
  Claude Code may use the classic multi-agent mob wording. Stage 04b remains the independent quality
  backstop.
- Keep templates, examples, README, methodology docs, deep-dive docs, and skills consistent with this
  9-artifact chain.
- When changing process semantics, update the skill text first, then the docs/templates that teach it.

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
