# TMS Independent Review Canon

Use this shared canon for pipeline 04b and standalone iterative review. A stage adapter may impose stricter scope or round limits.

## Safety and scope

- Read the repository `AGENTS.md` and resolve the exact active change set before review.
- Preserve unrelated user work. Never reset, restore, stash, switch branches, stage, commit, push, run migrations, deploy, or modify external systems.
- Review and fix only issues introduced, exposed, or directly depended on by the active change.
- Record `git status --short` before and after every reviewer. Unexpected reviewer mutations invalidate that pass.

## Independent reviewer

- Every scoring pass uses a fresh read-only subagent with no parent conversation, reasoning, suspected bugs, prior findings, prior scores, fix explanations, round number, remaining budget, or acceptance target.
- Inspect the actual spawn schema. Use a custom role/model only when the schema supports it. Otherwise use the clean-context control exposed by the runtime (`fork_turns: "none"` in the current schema), embed the full role in the prompt, and report `custom_role_enforced = false`, `actual_model = runtime-selected/unknown`.
- Prefer Terra high for ordinary review and Sol xhigh for auth/RLS/payments/PII/migrations/queues/lifecycle/data-integrity or reviewer disagreement; fallbacks are `gpt-5.4` and `gpt-5.5`.
- Never use Fast mode or Ultra for a scoring reviewer.

## Reviewer prompt

Give only:

- repository path and exact diff/file scope;
- original task and observable acceptance criteria;
- relevant repository constraints;
- read-only prohibition;
- validation expectations;
- the finding format below.

For pipeline 04b, the orchestrator may read the full author handoff and remediation artifacts to resolve
scope, but must build a **sanitized reviewer brief** from the design, plan, current diff, and current
fingerprint. Include only neutral contract/acceptance criteria, exact current scope, invariant labels,
surfaces to inspect, repository constraints, and validation expectations. Never paste or attach
`04_implementation.md`, `04b_loop_review.md`, the full author handoff, or any field containing defects
found/fixed, author search results, prior findings, scores, fix explanations, attempt/remediation history,
or acceptance state. Rebuild this neutral brief after every implementation change.

Do not tell the reviewer the current round, remaining review/fix budget, previous findings/fixes/scores, the numeric acceptance threshold, or ask it to produce `PASS`. The reviewer reports the current state objectively; the orchestrator applies the gate.

Ask the reviewer to inspect correctness, regressions, security/privacy/auth, tenant scope, data integrity/concurrency, lifecycle, error handling, contracts, tests, over-engineering and under-engineering. Risk-heavy first passes must cover every relevant class before stopping.

## Findings

Format each finding as:

`[Class] [Confidence] path:line - title`

Then provide evidence, concrete impact, why the active change owns the issue, and the minimal correction direction.

- A — data loss, security/privacy breach, cross-tenant exposure, major money error, or launch blocker.
- B — recoverable production incident, unsafe lifecycle/concurrency behavior, material contract break, or false success.
- C — bounded correctness/UX/operability/test gap that should be fixed or bundled.
- D — theoretical, cosmetic, or optional improvement.

Do not accept speculative findings without repository evidence. If there are none, require the exact sentence `No actionable findings or comments.` and a fitness score.

## Triage and fixes

- The main agent verifies every finding against code, contracts, tests and runtime evidence before acting.
- Reject false positives with evidence. Fix genuine in-scope issues at the owning layer; batch related fixes instead of one patch per bullet.
- Do not add complexity to chase a score. A 9.5 result means correct, complete, right-sized and clear.
- After any implementation/test fix, rerun affected validation and use a new fresh reviewer for the latest state. Clarification from an old reviewer is not a final scoring pass.

## Validation and acceptance

Accept only when all conditions hold on the same final implementation fingerprint:

- required changed-surface validation was rerun after the last implementation change, passes, and did not unexpectedly mutate reviewed files;
- a fresh independent reviewer inspected that exact fingerprint after the last implementation change;
- no unresolved Class A/B remains;
- all other actionable findings are fixed, rejected with evidence, or explicitly deferred to the owning backlog/launch location;
- the latest fresh reviewer scores at least 9.5/10 or explicitly reports no actionable findings;
- the implementation fingerprint did not change after that reviewer.

A high score never overrides an unresolved correctness, security, privacy, money or data-integrity issue. A lower score with no concrete findings may be clarified once; if still vague, use a new reviewer rather than inventing work.
Any implementation/test/SQL/contract/config change after the final reviewer invalidates acceptance immediately. Report a non-accepted state until validation and a fresh review are repeated.

## Per-attempt orchestration checkpoint

- Default checkpoint: 3 fresh review rounds and 2 meaningful fix rounds per attempt.
- This checkpoint is never shown to a scoring reviewer and never lowers the quality bar. It ends one review attempt so the orchestrator can choose the correct next action instead of patching an under-hardened shape inside review.
- For pipeline 04b, checkpoint exhaustion with remaining implementation work routes automatically to a separately recorded repeat 04 and then a fresh 04b attempt in the same invocation. Missing review/validation evidence routes directly to a fresh evidence attempt. Do not ask the user to restart 04 and do not impose a fixed cap across remediation cycles.
- For standalone review, or for a genuine blocker such as irreconcilable architecture, unavailable validation/isolation, destructive/external authority, or an unresolved owner decision, stop without claiming acceptance and report the current state, unresolved findings, validation and exact reason.
