# Backlog

> Write the CONTENT in your project's output language. This is the single source of truth for tasks.

**Each row is an INDEX, not storage** — one short Markdown line (~≤200 chars: *what* + a one-word driver). If a row needs more context, end it with `See <task-folder>/` and keep the detail in that task's `00_ticket`. Keep rows sorted low→high by ID within each table.

## Active

| Ticket ID | Area | Driver/Scope | Priority | Status |
|-----------|------|--------------|----------|--------|
| `<TICKET-ID>` | `<FEATURE_AREA>` | `<one-line what + driver>` | Must | Backlog |
| `<TICKET-ID>` | `<FEATURE_AREA>` | `<one-line what + driver>` `See <task-folder>/` | Should | Backlog |

- **Priority:** Must / Should / Could.
- **Status:** Backlog / In progress / In review / Done (adapt to your workflow).

## Bundled follow-ups

Follow-ups the owner approved at the gate (`06_review_gate` → *Proposed follow-ups*) are registered **here**, never in the Active table (they are polish, not a priority signal).

> **Bundle, don't shard.** Group related follow-ups into one bundle of 2-7 sub-items (split by another axis if >7). The bundle's ID = the lowest absorbed ticket ID. Don't mix priorities or unrelated areas in one bundle.

| Ticket ID | Area | Driver/Scope | Priority | Status |
|-----------|------|--------------|----------|--------|
| `<BUNDLE-ID>` | `<FEATURE_AREA>` | `<bundle summary>` `See <task-folder>/` | Could | Backlog |

## Trigger register

Findings that matter only when a **named event** happens — an event a person will actually notice, such as
"the first bulk import of real volume" or "a second API instance". They are not tasks and carry no
priority. Stage 04b adds rows here (route `trigger register`); when someone sees the trigger happen, the
row is brought to the owner as a candidate task. If no such event can be named, the finding belongs in
the backlog or is dropped — not here.

Point `TRIGGER_REGISTER_LOCATION` in your `AGENTS.md` at this section (or at a separate file).

| Trigger (the event) | Finding | Where | From task | Added |
|---------------------|---------|-------|-----------|-------|
| `<the event a person will notice>` | `<what becomes a problem then>` | `<file:line>` | `<TICKET-ID>` | `<YYYY-MM-DD>` |
