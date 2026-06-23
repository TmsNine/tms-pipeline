# Gap Audit: [TASK_NAME]

Date: [DATE]
Designed by: [who] · Audited by: [who, using a DIFFERENT lens] · Lens: [security / concurrency / UX / ops / data integrity / privacy]

> Minimal-surface exception: for Direct / minimal TDD-first / simple bug fix, replace the body with the
> single line: "skipped per minimal-surface exception".

## Gaps by severity

### A — Blocker (fix inline in 02_design before 03)
- [gap] → folded into `02_design §X`

### B — Incident (fix in 02_design or pass to 03 with a handling note)
- [gap] → folded into `02_design §X` / passed to `03` item Y

### C — Polish (bundle into backlog ticket(s) — bundle, don't shard)
- [gap] → draft bundle ticket: ...

### D — Theoretical (backlog only if obvious+cheap, else drop with reason)
- [gap] → dropped: [one-line reason]

## Stopping decision
- [ ] Pass 1 complete; 0 Class A and 0 Class B → stop
- [ ] Pass 2 run (only because pass 1 found ≥1 Class A)
- [ ] Predominantly C/D → stop
