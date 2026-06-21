# Your documentation base

> The pipeline reads product/architecture/backlog knowledge from a "doc base". This page explains how it
> is structured and how to adapt the included blank skeletons.

## Why a doc base

tms-pipeline is a *delivery* methodology — it needs somewhere to read *what* the product is and *which*
task it is delivering. That source of truth is your documentation base. Its path is set as
`DOC_BASE_PATH` in `AGENTS.md`. It can be anything durable: a `docs/` tree in the repo, a wiki, an
Obsidian vault, a Notion export. The methodology never assumes a specific tool — only a path.

## The blank skeletons

`templates/docs-vault/PROJECT_NAME/` is a ready-to-fill structure you can copy into your doc base:

```
PROJECT_NAME/            ← rename this folder to your project's name
├── README.md
├── 00 Governance/
│   ├── Definition of Ready and Done.md
│   └── Documentation System and Handoff Guide.md
├── 02 Product/
│   ├── PRD - FEATURE_AREA.md
│   └── Flow - FLOW_NAME.md
├── 03 Architecture/
│   └── Architecture Delta.md
└── 04 Delivery/
    ├── Backlog.md
    └── Traceability Map.md
```

Every file is a generic skeleton with placeholders — no real product content.

## How to adapt them

1. Copy the folder into your doc base (the wizard can do this if you answer yes to "copy docs-vault").
2. **Rename the `PROJECT_NAME` folder** to your project's name.
3. Point `DOC_BASE_PATH` in `AGENTS.md` at it.
4. Replace placeholders (`<FEATURE_AREA>`, `<FLOW_NAME>`, `<TICKET-ID>`) and fill each skeleton with your
   real content. Claude or Codex can help — give it your existing notes and ask it to populate the PRD,
   flows, and backlog skeletons.

## What each file is for

- **Definition of Ready/Done** — the entry/exit bar for a task. The pipeline checks "Ready" before stage
  00 and "Done" at the review gate.
- **Documentation System and Handoff Guide** — your source-of-truth hierarchy and reading order, so a new
  contributor (human or agent) knows where authority lives.
- **PRD / Flow** — what the product does and how scenarios run; the Research and Design stages read these.
- **Architecture Delta** — the architectural shape of a change; decisions land here as ADR-style notes.
- **Backlog** — the single source of truth for tasks. Each row is an **index, not storage**: one short
  line, with longer context living in the task folder. Gap-audit Class C polish bundles are registered in
  the `### Bundled follow-ups` section, never in the active table.

## Keep it light

The backlog row is one line. Multi-paragraph descriptions, file paths, and composition live in the task
folder's `00_ticket.md`. Don't shard the backlog into dozens of tickets — bundle related follow-ups
(2–7 sub-items) by shared surface. See the [methodology](00-methodology.md#33-nothing-discovered-gets-lost-follow-up--launch-capture).
