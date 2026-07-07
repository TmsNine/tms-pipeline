# Changelog

All notable changes to tms-pipeline are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `/tms-new` skill: a one-time guided bootstrap for a brand-new product (interview one question at a
  time, then lay down an MVP doc set + folder structure) — framed explicitly as setup, not a feature
  brainstorm.
- `codex-skills/`: a Codex-native skill tree with numbered stage names and Codex-specific execution
  guidance, kept separate from the Claude Code `skills/` tree.
- `/tms-loop-review`: stage `04b_loop_review`, the task-ID-based review/fix loop that resolves either
  worktree or committed task diffs before `05_test_report`.
- Public root `AGENTS.md` for this repository, adapted from battle-tested project rules but stripped of
  private/customer-specific context for public reuse.
- `docs/04-stages-deep-dive.md` (+ `.ru.md`): an under-the-hood walkthrough of the delivery stages — which agents
  run, on which model tiers, input/output, and where the human checkpoint is.
- Human-in-the-loop is now an explicit through-line in the README and methodology (you review each
  stage's artifact before the agent proceeds).
- Zero-dependency test suite for the onboarding engine (`node --test`), covering token rendering, the
  no-overwrite-without-`--force` rule, dry-run, Codex-asset gating, version-sync across the four manifest
  files, and skill-manifest/disk parity.
- GitHub Actions CI running the tests and a relative-markdown-link check on Node 18/20/22.
- `scripts/check-links.mjs` and an `npm run check:links` script.
- CLI flags: `--help`, `--version`, `--dry-run`, and `--answers <file.json>` for non-interactive runs.
- Wizard now installs Codex skills/agents into `~/.codex` from `codex-skills/` (only when Codex is
  selected).
- Wizard can also install the skills for **Claude Code via npx** (an alternative to `/plugin install`):
  a "Choose where" step (1 Claude / 2 Codex / 3 both / 0 skip) copies `skills/`, `agents/`, and
  `commands/` into `~/.claude` when you pick Claude. New engine option `copyClaudeAssets` (gated on
  `useClaude`), exposed via `--answers` and covered by a test.
- "In 30 seconds" summary and a prominent link to the worked example
  (`templates/example-task/ACME-101/`) in the README and getting-started docs.
- `CONTRIBUTING.md`, `CHANGELOG.md`, issue templates, and a pull-request template.
- `docs/05-manual-setup.md` (+ `.ru.md`): a "finish onboarding with your AI agent" tutorial with
  ready-to-paste prompts for the deep judgement fields (Profile-C triggers, tenancy, migration policy,
  doc-base hints) that `/tms-init` intentionally leaves as `<<TODO>>`.

### Changed
- Public docs and templates now explain the Codex-oriented stage `04`/`04b` split: focused
  main-agent implementation with explicit self-check roles, followed by mandatory independent review over
  the actual diff. Delivery plans now teach risk profiles `M/E/R/C` instead of the old A/B/C escort model.
- Codex pipeline skills now use `gpt-5.4-mini` for cheap evidence/model-tier slots, add structured
  risk-handoff seeds from `03` to `04`, require pre-04b risk-surface sweeps and author handoffs in `04`,
  make `04b` audit that handoff before trusting it, and create task-scoped commits by default at
  successful `04`, `04b`, and `06` boundaries.
- **Onboarding split into a thin installer + agent-driven setup** (matching the Superpowers/GSD
  convention). `npx tms-pipeline` is now a thin installer: pick language (EN/RU) and tool(s), install the
  skills, drop a starter `AGENTS.md` — it no longer interrogates you about test commands, ticket format,
  or doc paths. Those move to `/tms-init`, which reads the repo and fills `AGENTS.md`, asking only about
  gaps. Added an ANSI-Shadow "TMS" banner and colored, localized (EN/RU) terminal output.
- **Fixed:** the docs-vault skeleton now lands at `DOC_BASE_PATH` (e.g. an external Obsidian/Notion
  vault) instead of always being dumped into `repo/docs`. The terminal installer no longer copies the
  per-task pipeline forms into the repo (the stage skills generate those per task).
- `/tms-init` now calls the canonical engine via `--answers` instead of re-implementing template
  rendering, removing the duplicated question list and the drift risk between the two onboarding paths.
- Russian is now the canonical language for docs; English files follow it. Russian docs rewritten to
  read natively (notably the multi-agent implementation section), with the README tagline reworded away
  from jargon ("opinionated delivery pipeline" → benefit-first).
- Concrete Codex install instructions (exact `~/.codex` paths and copy commands) across README and docs.
- Newcomer reassurance callouts where placeholders are filled ("don't guess alone — ask your AI agent").

### Fixed
- `DESIGN_SYSTEM_HINT` was used in `AGENTS.template.md` but neither asked nor deferred; it is now a
  documented deferred token so it renders as a clear TODO and is covered by a test.

## [0.1.0]

### Added
- Initial release: the eight-stage delivery pipeline (ticket → research → design → gap-audit → plan →
  implement → test → review-gate), the four-stage codebase audit, refactoring and review-loop skills,
  five mob-role agents, the `npx tms-pipeline` onboarding wizard, templates, and bilingual docs.
