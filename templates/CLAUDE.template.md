<!--
  CLAUDE.template.md — Claude Code-specific rules for tms-pipeline.
  Copy to .claude/CLAUDE.md and keep the AGENTS.md import below.
-->

# <Your Project> — Claude Code Context

@./AGENTS.md
<!-- Adjust the relative path if AGENTS.md is one level above .claude/. -->

---

Everything shared lives in `AGENTS.md`. This file contains only Claude Code-specific execution rules.

## Stage 04 — Profile-Aware Execution

Use the approved M/E/R/C profile to choose execution depth. Bounded work stays with the lead; risk-heavy work receives real proving-role separation. Do not run a full mob merely for ceremony, and do not silently downgrade R/C to save context.

Stage 01 may still use the bounded read-only evidence fan-out defined by `tms-research`; design and final judgement remain with the lead.

### Roles

1. **Developer** — implements one approved R/C wave at the owning layer.
2. **Tester/Builder** — runs the smallest meaningful validation and reports exact results.
3. **Architect** — checks design/plan fit, owner layer, contracts, and coupled paths.
4. **Security / Privacy / Money** — checks auth, tenant scope, trust boundaries, PII, external effects, and money semantics.
5. **Reviewer** — checks the wave against acceptance criteria without editing.

The lead remains the single integration owner, writes self-contained briefs, verifies findings, and decides each local gate.

### M/E/R/C profiles

Use the profile already approved in `03_delivery_plan.md`; do not replace it with an agent-count label.

- **M — Mechanical/bounded:** lead implements inline and performs local Developer/Tester/Reviewer self-checks; no coding mob; narrow 04b.
- **E — Evidence-heavy:** lead implements inline; one bounded read-only Architect/evidence pass and Tester isolate search/log volume; standard 04b.
- **R — Risk review required:** Developer + Tester plus every triggered Architect/Security role and a stage-04 Reviewer; risk-focused 04b.
- **C — Classic maximum-risk:** full role set, strongest judgement models, a mandatory strongest-available per-invocation Reviewer override, broad author risk sweep, and broad first-pass plus fresh final 04b reviewer.

Choose by the most dangerous touched risk, not average diff size. Escalate when the implementation exposes a stronger trigger; record an append-only X-ID instead of silently relabelling history.

### Wave gate

For every wave:

1. Resolve profile, scope, acceptance, R-IDs and validation before editing.
2. Keep the lead as integration owner; use the lead as code owner for M/E and Developer as code owner for R/C.
3. Give every subagent a compact brief: task/wave, profile, `base_sha`, exact paths/diff, current fingerprint, R-IDs, neutral acceptance/invariants, allowed actions, evidence required, and not-in-scope items.
4. Use Sonnet defaults for Developer/Tester/Reviewer and Opus for Architect/Security; Profile C must override Reviewer per invocation to the strongest available judgement model. Record preferred/configured/actual model and permission evidence; use `runtime-selected/unknown` when runtime does not expose the result. `permissionMode` frontmatter applies to copied project/user agents but is ignored for plugin-shipped agents, which must record parent/runtime permission evidence instead.
5. Verify and batch genuine findings at the owning layer; rerun affected validation after fixes.
6. Pass only after acceptance, applicable proving roles, and changed-surface validation are green. Never use Fast mode.

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
