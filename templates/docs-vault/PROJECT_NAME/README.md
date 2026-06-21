# Documentation Base (Doc Vault)

> Write the CONTENT of these files in your project's output language. The headings here are English skeletons — adapt them.

This folder is your project's **documentation base** ("doc vault"). It holds the durable product, architecture, and backlog knowledge that the tms-pipeline methodology reads while working a task.

## Setup

1. Rename the parent folder `PROJECT_NAME` to your project's name.
2. Point `DOC_BASE_PATH` in your `AGENTS.md` at this folder.
3. Fill the skeletons below with your real content. Claude or Codex can help you adapt each template to your project.

The pipeline never invents product rules — it reads them from here. Keep this vault current; treat code as the source of truth for *implementation details*, and this vault for durable *context* (flows, decisions, scope, backlog).

## Subfolders

- `00 Governance/` — how the project is run: Definition of Ready/Done, the documentation system and handoff guide.
- `02 Product/` — what is being built and why: PRDs and user/operational flows.
- `03 Architecture/` — how it's built: architecture deltas and decisions.
- `04 Delivery/` — what's planned and tracked: the backlog (single source of truth for tasks) and the traceability map.

Per-task working files (the 8 pipeline stages) live next to your code under `<task-folder>/`, not here. This vault holds the cross-task durable knowledge those stages read from and write back to.
