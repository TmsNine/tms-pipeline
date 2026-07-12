# Review Gate: [TASK_NAME]

Date: [DATE]

## Fingerprint closure
- Accepted 04b implementation fingerprint: ...
- Stage-05 implementation fingerprint: ...
- Current implementation fingerprint: ...
- Closing package fingerprint (normalized evidence fields): ...
- Fingerprint helper: `tms-task-fingerprint-v1`; worktree/index package match: yes/no
- Worktree observed task-owned paths / package manifest: exact match yes/no
- Staged paths / package manifest: exact match yes/no
- Match: yes/no

## Verify against the design contract (`02_design.md`)
- [ ] Acceptance criteria met
- [ ] No design drift (implementation matches the approved design)
- [ ] Change-surface triggers handled (contracts, auth, async, persistence, copy)
- [ ] Normalized 04b status is exactly `PASS`
- [ ] Implementation fingerprint matches accepted 04b and stage 05
- [ ] Validation evidence present (`05_test_report.md`)
- [ ] Follow-ups + pre-launch manual actions captured (per AGENTS.md)
- [ ] Documentation base updated — delivered behavior/decisions folded into the owning docs so the vault reflects reality

## Verdict
- [ ] **go** — ships as-is
- [ ] **conditional_go** — ships once named conditions are met (list them + route to launch playbook)
- [ ] **no-go** — blocker(s) remain (list them)

## Conditions / comments
- ...

## Backlog / status updated
- [ ] Task status reflects actually-delivered scope (not the original ticket wording)

## Closing commit
- [ ] Eligible for exactly one task-scoped commit after successful external sync and fingerprint checks
- Staged package fingerprint (normalized evidence fields): ...
- Commit blocker: none / ...
- The actual commit SHA is reported after success in chat or another external status surface; it is not stored in this repo-local artifact.

## Pipeline metrics
- Profile / waves / review-fix rounds / findings / remediation cycles / V-ID freshness / primary signal /
  manual gates / available time-subagent-token data / verdict
