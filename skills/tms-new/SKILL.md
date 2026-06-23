---
name: tms-new
description: "One-time bootstrap for a brand-new product — interview the user one question at a time, then lay down an initial MVP documentation set + folder structure so the delivery pipeline has a starting line. Not a feature brainstorm: the user decides, you only ask and organize."
argument-hint: "[product name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

Run the **one-time product bootstrap**. The user is starting from nothing (or close to it) and needs a
minimal documentation base + backlog so the tms-pipeline delivery stages have something to deliver against.

**What this is — and what it is NOT.** This is a *setup interview*, not a feature brainstorm and not a
product generator. You do **not** invent the product, choose features, or guess scope. The user decides
everything; your job is to ask good questions one at a time, mark a recommended option, and then **organize
the user's own answers** into the documentation-base structure. If the user expects you to "come up with
the product," say plainly that deciding *what* to build is their call — you structure it, you don't author
it.

Read THIS project's `AGENTS.md` if one already exists (the user may be adding a product area to an existing
repo). If there is no repo yet, that's fine — this stage creates the starting structure.

## Method

1. **Frame the goal in one line with the user.** Confirm: the product, its core idea, and the outcome it
   should achieve. If the user gave a product name as `$1`, use it.

2. **Interview — one question at a time.** Ask **one** question per turn, each with 2–3 concrete options
   and a clearly **marked recommended** option, phrased for the user's audience (plain language; describe
   the real consequence of each option). Let the user answer with short codes (`1B`) but always spell each
   option out. Cover at least:
   - **Where the code will live** (repo path / new repo) and the main stack.
   - **Where durable documentation will live** (the doc base / vault path — this becomes `DOC_BASE_PATH`).
   - **Ticket-ID format** (e.g. `PROJ-123`) and **where the backlog lives**.
   - The **MVP scope**: the few flows that matter first, and explicitly what is *out* of MVP.
   - Any **hard constraints** the user already knows (tenancy/identity model, compliance, platforms).
   Keep it minimal — ask only what's needed to seed a usable baseline. Don't drown the user in questions;
   stop interviewing once you have enough to lay down a real starting structure.

3. **Lay down the structure from the templates.** Copy `templates/docs-vault/PROJECT_NAME/` into the chosen
   doc base and **rename `PROJECT_NAME`** to the real product name. Then distribute the user's decisions
   into the matching folders — only what is actually decided, marked clearly as an MVP baseline to grow:
   - `00 Governance/` — Definition of Ready/Done, the source-of-truth/handoff note.
   - `02 Product/` — a first PRD and the key flow(s) the user described.
   - `03 Architecture/` — an Architecture Delta / first ADR-style notes for any decided constraints.
   - `04 Delivery/` — the **backlog** seeded with **at least one** real first task (so the pipeline can
     start), and a traceability stub if the user wants one.
   Leave anything undecided as a clearly-marked placeholder — never invent product content to fill a gap.

4. **Keep the vault the single source of truth.** State that this is a living baseline: it grows as
   development proceeds, and after each delivered task its real behavior is folded back in. Keep the code
   base and the docs in sync with this vault.

5. **Hand off.** Tell the user the concrete next steps in their language:
   - run `npx tms-pipeline` (or `/tms-init`) to generate `AGENTS.md` / `.claude/CLAUDE.md`, pointing
     `DOC_BASE_PATH` at the doc base you just created and resolving the `<<TODO>>` markers (offer to help
     fill them by reading the code);
   - then start delivering the first backlog item with `/tms-ticket <TICKET-ID>`.

## Tone
Match the user's output language and audience. This is setup and decision-capture, not a lecture — keep it
short, one question at a time, and never substitute your product judgement for theirs.
