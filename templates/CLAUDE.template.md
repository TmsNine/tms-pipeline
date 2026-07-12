<!--
  CLAUDE.template.md — Claude Code-specific rules for tms-pipeline.
  Copy to .claude/CLAUDE.md and keep the AGENTS.md import below.
-->

# <Your Project> — Claude Code Context

@./AGENTS.md
<!-- Adjust the relative path if AGENTS.md is one level above .claude/. -->

---

Everything shared lives in `AGENTS.md`. This file contains only Claude Code-specific execution rules.

## Stage 04 — Mandatory Multi-Agent Execution

When running `04_implementation`, use Claude Code's `Agent` tool as a coding mob. The lead orchestrates and does not write production code directly. Skip this only when the user explicitly requests inline implementation or no subagents.

This rule applies to stage 04 only. Stage 01 may use the bounded read-only evidence fan-out defined by `tms-research`; design and final judgement remain with the lead.

### Roles

1. **Developer** — implements one approved wave at the owning layer.
2. **Tester/Builder** — runs the smallest meaningful validation and reports exact results.
3. **Architect** — checks design/plan fit, owner layer, contracts, and coupled paths.
4. **Security / Privacy / Money** — checks auth, tenant scope, trust boundaries, PII, external effects, and money semantics.
5. **Reviewer** — checks the wave against acceptance criteria without editing.

The lead writes self-contained briefs, dispatches Agents, verifies findings, and decides each gate.

### M/E/R/C profiles

Use the profile already approved in `03_delivery_plan.md`; do not replace it with an agent-count label.

- **M — Mechanical/bounded:** Developer + Tester + Reviewer; narrow 04b.
- **E — Evidence-heavy:** add bounded Explorer/Architect evidence where completeness matters; standard 04b.
- **R — Risk review required:** add Architect and Security/Privacy/Money; risk-focused 04b.
- **C — Classic maximum-risk:** full role set, strongest judgement models, broad author risk sweep, and broad first-pass plus fresh final 04b reviewer.

Choose by the most dangerous touched risk, not average diff size. Escalate when the implementation exposes a stronger trigger; record an append-only X-ID instead of silently relabelling history.

### Wave gate

For every wave:

1. Give Developer the approved scope, files, acceptance, profile, R-IDs, and required validation.
2. Dispatch the profile's proving roles in parallel where independent.
3. Use cheap tiers only for mechanical command execution and evidence maps. Keep architecture, security, privacy, money, lifecycle, and final review on the strongest appropriate tier. Never use Fast mode.
4. Give proving roles a compact path/line/change brief; they independently reread only the evidence they must verify.
5. Verify and batch genuine findings at the owning layer.
6. Pass only after acceptance, applicable proving roles, and changed-surface validation are green.

Record R/X/V ledgers, task-owned paths, implementation/package fingerprints, and the 04b author handoff in `04_implementation.md`.

### Automatic remediation from 04b

An active `tms-loop-review` invocation may call stage 04 back automatically. In that case:

- append `Remediation cycle N`;
- use the bounded remediation brief;
- fix and validate owned defects;
- refresh fingerprints and the handoff;
- do not stop for confirmation, stage, or commit;
- return directly to the same 04b invocation for a fresh reviewer.

### Stage-04 close

Capture follow-ups and pre-launch manual actions per `AGENTS.md`. Stage 04 never stages or commits. The single task-scoped commit is created only after a successful stage 06.

## Stage 04b — Independent and atomic

Every scoring pass uses a fresh read-only Agent with a self-contained prompt. Do not reveal parent reasoning, prior findings/scores/fixes, round number, remaining budget, or the acceptance target.

The per-attempt checkpoint limits orchestration, not quality. If implementation work remains, 04b persists `NEEDS_REMEDIATION`, automatically runs repeat 04, and starts a fresh attempt. It does not ask the user to restart 04.

`PASS` is atomic: validation and a fresh independent review must cover the exact same final implementation fingerprint, and no implementation change may follow that reviewer. Any later code/test/SQL/contract/config edit immediately returns the artifact to `NOT_ACCEPTED`.

Only a normalized `PASS` may proceed to 05. The first user-facing line must include `04b status: <STATUS>` and explicitly say whether 05 is allowed.

## Auto Mode Discipline

Auto mode removes permission prompts; it does not widen scope.

- No speculative side investigations, unrelated cleanup, or hidden scope expansion.
- Parallel proving roles and independent tool calls are allowed when tied to the current wave.
- Prefer one hypothesis at a time.
- Capture adjacent work as follow-up instead of implementing it opportunistically.
- Never use Fast mode for pipeline stages or scoring review.
