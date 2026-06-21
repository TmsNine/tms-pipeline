# Gap Audit: Export reports list to CSV

Date: 2026-01-15
Designed by: agent (design lens) · Audited by: agent (security + data-integrity lens) · Lens: security / data integrity

## Gaps by severity

### A — Blocker (fix inline in 02_design before 03)
- **CSV injection:** a cell starting with `=`, `+`, `-`, or `@` can execute as a formula when the file is
  opened in a spreadsheet. The `toCsv()` helper must prefix such cells with a `'`.
  → folded into `02_design` §"CSV serialization" (toCsv must neutralize formula-leading cells).

### B — Incident (fix in design or pass to 03 with a note)
- The 10k cap could silently truncate without the user knowing. → passed to `03`: when the cap is hit,
  include a final note row and surface a toast on the page.

### C — Polish (bundle into backlog — bundle, don't shard)
- No loading/disabled state styling guidance for the button during large exports.
  → draft bundle ticket "Reports export polish" (with the toast copy and i18n keys).

### D — Theoretical (backlog only if obvious+cheap, else drop)
- Streaming for >10k rows. → dropped: capped at 10k by design, so streaming is unnecessary now.

## Stopping decision
- [x] Pass 1 found 1 Class A → Class A folded into design; one Class B passed to plan; remainder C/D.
- [x] Stop (pass-1 Class A fixed; no need for a second pass — remaining gaps are C/D).
