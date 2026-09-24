# Changelog

All notable changes to tms-pipeline are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-24

The method is rebuilt around a simpler rule: every stage runs in its own fresh context, the owner stops
the pipeline twice, and one executor writes the code.

### Added
- `tms-run`: an orchestrator that carries one task through all eight stages, dispatching each stage as
  its own subagent, briefing it with addresses rather than opinions, and stopping for the owner after
  design and at the gate.
- Eight stage skills, identical in both tool trees: `tms-00-ticket`, `tms-01-research`,
  `tms-02-design`, `tms-03-plan`, `tms-04-implement`, `tms-04b-review`, `tms-05-test`, `tms-06-gate`.
  Artifacts: `00_ticket.md`, `01_research.md`, `02_design.md`, `03_plan.md`, `04_implementation.md`,
  `04b_review.md`, `05_test_report.md`, `06_review_gate.md`.
- `tms-ui-screen`: one screen or frontend section through a managed cycle (product meaning, backend
  map, interactive QA, independent review, the owner's visual approval, production handoff). A task that
  changes a screen runs stage 04 through this skill.
- Stage agents with pinned model and effort: `tms-stage` (top tier, medium), `tms-stage-deep` (top tier,
  high), `tms-stage-light` (cheaper tier, medium), plus `tms-explorer` for research fan-out. Every
  Claude agent now pins its model by full id instead of an alias.
- New `AGENTS.md` template sections and tokens: *Gate: who signs what*, *Stage 04 and 04b*, *Security
  Triggers* (`SECURITY_TRIGGERS`), a task-check command (`TASK_CHECK_CMD`, asked by the installer), the
  known-test-debt register (`KNOWN_TEST_DEBT_LOCATION`), the trigger register
  (`TRIGGER_REGISTER_LOCATION`) and the accepted-screen register (`ACCEPTED_SCREENS_LOCATION`).
- `/tms-new`: a one-time guided bootstrap for a brand-new product (setup interview, not a feature
  brainstorm).
- Thin installer: `npx tms-pipeline` picks language and tool(s), installs skills/agents/commands into
  `~/.claude` and/or `~/.codex`, and drops a starter `AGENTS.md`; `/tms-init` then fills it by reading
  the repository. CLI flags `--help`, `--version`, `--dry-run`, `--answers <file.json>`, `--yes`,
  `--force`. Until the npm package is published, `npx github:TmsNine/tms-pipeline` runs the same
  installer.
- Zero-dependency test suite (`node --test`), GitHub Actions CI, `scripts/check-links.mjs`,
  `CONTRIBUTING.md`, issue and pull-request templates, the worked example
  `templates/example-task/ACME-101/`, and the docs pages `04-stages-deep-dive`, `05-manual-setup` and
  `06-model-routing` (EN + RU).

### Changed
- **Two owner stops.** The owner reads and approves the design (02) and decides at the gate (06). The
  lead reads and signs the plan (03). Only a human writes `go`; the lead may sign `conditional_go` when
  only execution remains, naming the launch-playbook step that closes it.
- **Stage 04 has one executor.** The stage agent writes the whole plan itself, phase by phase, TDD-first,
  walks every seam at the end and runs the project's task check. One `tms-security` pass runs over the
  assembled diff only when a security trigger fires.
- **Stage 04b is a bounded independent loop.** Up to five fresh read-only reviewer passes with a
  stagnation rule; one pass always proves the end-to-end path; a screen gets a visual pass. A finding
  blocks only if it is reachable on current code and a user would observe it; every other finding is
  routed (fixed now, backlog proposal at the gate, trigger register, dropped with a reason). No score and
  no verdict.
- **The plan is executable.** `03_plan.md` carries normative contracts verbatim, File Ownership as a hard
  boundary, a seam table, a runnable validation table (with a task-check row and a seam-crossing row), a
  RED-test specification per phase and a cold fresh-reader check.
- **Research separates facts from search misses** ("absent — checked" vs "not found by search") and
  enumerates countable subjects one row per item.
- **The test report counts rows.** Every validation row of the plan gets an exit code and a marker
  check; the known-test-debt register excuses a red suite's colour, not its run.
- Skills are fully project-agnostic and written in English; each artifact is written in the project's
  output language.
- Codex agents: `tms_security` now runs once over the assembled diff, matching the Claude agent.
- The docs-vault skeleton lands at `DOC_BASE_PATH` instead of always inside `repo/docs`; the terminal
  installer no longer copies per-task pipeline forms into the repository.

### Removed
- Retired skills (delete them from `~/.claude/skills` and `~/.codex/skills` when upgrading — the
  installer never deletes files): `tms-ticket`, `tms-research`, `tms-design`, `tms-gap-audit`,
  `tms-plan`, `tms-implement`, `tms-loop-review`, `tms-loop-code-review`, `tms-review`, `tms-test`, and
  in the Codex tree `tms-02b-gap-audit`, `tms-04b-loop-review`, `tms-06-review`,
  `tms-94-loop-code-review`.
- The `02b_gap_audit` stage, the A/B/C escort profiles and the M/E/R/C risk profiles, per-phase escorts,
  numeric reviewer scores, task/package fingerprints and the fingerprint helper.
- Codex agents `tms_gap_auditor`, `tms_risk_reviewer`, `tms_wave_reviewer`.
- Template token `PROFILE_C_TRIGGERS` (replaced by `SECURITY_TRIGGERS`).

## [0.1.0]

### Added
- Initial release: the staged delivery pipeline (ticket → research → design → gap-audit → plan →
  implement → test → review-gate), the four-stage codebase audit, refactoring and review-loop skills,
  five role agents, the `npx tms-pipeline` onboarding wizard, templates, and bilingual docs.
