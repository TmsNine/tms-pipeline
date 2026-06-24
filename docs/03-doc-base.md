# Your documentation base

> tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
> reviewed code, keeping the agent's context clean at each step. To work on a task, the agent needs to
> read *what* product it is building and *what* exactly you want from it. That source of knowledge is the
> "documentation base". This page explains how it is structured and how to fill in the blank starter files
> that ship with the project. The Russian version is [03-doc-base.ru.md](03-doc-base.ru.md).

## Why a documentation base

tms-pipeline guesses nothing about your product. Before it does anything, the agent reads the
documentation base: the descriptions of the product, the architecture, and the list of tasks. These are
the main documents the agent checks everything else against, at every stage.

Where this base physically lives is up to you; the methodology does not dictate it. Anything durable
works: a `docs/` tree in the repo, a wiki, an Obsidian vault, or a Notion export. You point to the place
you chose once, in the `AGENTS.md` file, in the `DOC_BASE_PATH` field. (`AGENTS.md` is your project's
settings file: where tasks live, what language to write in, your rules.) Nothing ties you to a particular
tool; the methodology needs only a path to the folder.

## The blank starter files

The project ships with a `templates/docs-vault/PROJECT_NAME/` folder — a ready-made file structure you can
copy into your documentation base and fill with your own content:

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

Every file is a generic starter file with placeholders instead of real content: the frame you fill in
yourself. (There is no `01` folder in the set — the numbering jumps from `00` to `02`; that is on purpose.)

## How to fill them in

1. Copy the folder into your documentation base. The installer can do this for you — the terminal program
   `npx tms-pipeline`, which asks a few short questions and writes the files. If you answer yes to the
   `copy docs-vault` question, it copies the folder itself.
2. **Rename the `PROJECT_NAME` folder** to your project's name.
3. Set the path to it in the `DOC_BASE_PATH` field of `AGENTS.md`.
4. Replace the placeholders (`<FEATURE_AREA>`, `<FLOW_NAME>`, `<TICKET-ID>`) and fill each starter file
   with your real content. The agent can help here: hand it your notes and ask it to fill in the PRD, flow,
   and backlog starter files for you.

## What each file is for

- **Definition of Ready / Done** — the entry and exit bar for a task. These are checklist conditions:
  "Ready" means the task is described well enough to start; "Done" means the task is finished. The agent
  checks "Ready" before the first stage (00) and "Done" at the final review.
- **Documentation System and Handoff Guide** — the order in which the documents should be read, and which
  one counts as the main one when they disagree. It exists so a new contributor — human or agent —
  immediately knows where to look for an answer.
- **PRD** (Product Requirements Document — a description of what the product must do) **and Flow** (a
  description of a user scenario, a "flow") — what the product does and how a user moves through scenarios.
  The Research and Design stages read these documents.
- **Architecture Delta** — a description of *how* a change fits the architecture: which parts of the system
  it touches and why this particular solution was chosen. Decisions are recorded here as ADRs (a record of
  an architecture decision: what was decided and why).
- **Backlog** — the list of future tasks. Each row here is a pointer: the row itself is short, while the
  long context (description, file paths, scope of work) lives separately, in the task folder.
- Small follow-ups the agent finds during the gap audit (a separate pass where a different agent looks at
  the design with fresh, skeptical eyes and hunts for holes) do not go into the active backlog table. They
  are collected in a separate `### Bundled follow-ups` section, so the active list stays a list of what is
  being worked on right now.

## Keep the backlog short

A backlog row is always one line. Multi-paragraph descriptions, file paths, and the scope of work live in
the `00_ticket.md` file inside the task folder, not in the backlog itself.

Don't shard the backlog into dozens of separate tickets. Group related follow-ups (2–7 of them) that get
fixed in the same place in the code into one ticket. That keeps the list manageable. See the
[methodology](00-methodology.md#33-nothing-discovered-gets-lost-capturing-follow-ups-and-launch-steps) for more.
