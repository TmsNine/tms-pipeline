---
name: tms-research
description: "Pipeline stage 01 — research the implementation, decide on a product interview, capture follow-ups"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - WebSearch
  - WebFetch
---

Run pipeline stage **01_research** for `$1`.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for project specifics: task-folder path, product-doc locations, backlog location, output language.

This stage runs as a **search fan-out**: cheap sub-agents gather in parallel, a top-tier lead **verifies and synthesizes**. The two roles never blur — gatherers only collect and cite; the lead (this conversation) decides what is true. This read-only research fan-out is an explicit allowed exception to the "earlier stages must not trigger multi-agent dispatch" note in `CLAUDE.md` — it is gathering, not the code-writing mob of `04_implementation`.

> **Model tiers (read first).**
> - **Search agents** (Phase 2 gatherers) → dispatch via the `Agent` tool, `subagent_type: general-purpose`, `model: sonnet` (use `haiku` for pure file-location sweeps). They read and report only.
> - **Lead / synthesizer** (this session) → top tier (Opus). It frames the search, verifies findings against the code itself, and decides the interview. The Phase 3 verification is the whole point of this stage and degrades on a weak model — keep the lead on Opus.

## When to fan out vs. work inline

Fan out (Phases 1–4) for any normal feature / bugfix / audit / refactor task — anything whose surface spans more than ~2 files or touches code you have not just read this session. For a genuinely tiny single-file `Direct` task, skip the fan-out, research inline, and say you did. Do not fan out "to look thorough" on trivial work.

## Phase 1 — Lead frames the search (Opus; reads only `00_ticket.md` here)

1. **Read `00_ticket.md` as a hypothesis, not as ground truth.** It states the author's mental model of the system today; that model may be stale, partial, or wrong — especially for documentation / audit / "sync with code" / cleanup / refactor tasks, where the ticket describes "current state" and the whole task collapses if that picture is off. Do NOT verify claims yourself here — instead, **extract two things**:
   - the list of concrete factual claims the design will rest on ("X is missing", "Y is broken", "endpoint A maps to handler B", "logic L lives in service S") — these become verification targets for Phase 3;
   - the full surface to sweep. Do not trust ticket enumerations as exhaustive: if the ticket lists 3 examples, the real list is usually wider — the sweep covers the whole surface (full route inventory, full schema, full contract), not only the listed items.
2. **Write one brief per search angle** (the four below). Each brief states, in plain terms: exactly what to find, where to look (instantiate the angle with this project's concrete surfaces from `AGENTS.md`), and that the agent must return citations + an explicit "not checked" list. No angle is optional unless plainly N/A — if you drop one, say why. Dispatch all angle agents **in parallel in a single message**.

## Phase 2 — Parallel search agents (cheap tier, dispatched concurrently)

Dispatch **one sub-agent per angle, in parallel, on the cheap tier** (`model: sonnet`). The four fixed angles — never improvise the set:

1. **Vertical path** — trace the feature's execution path end-to-end: caller/UI → route/guard → handler/service → contract → persistence/external system. Return the full chain with `file:line` at each hop.
2. **Horizontal siblings** — adjacent surfaces that must stay consistent: sibling routes, similar components, shared services, schemas, serializers, tests, every UI state (loading/empty/error/success/disabled), and both producer + consumer of each contract.
3. **Product & lifecycle docs** — the product docs / flows / state machines / PRD that govern this surface (locations from `AGENTS.md`). Return the governing rules and every place the code appears to contradict them.
4. **Prior art & history** — recently closed/related backlog tickets (`grep` `TF*-XXX` rows by area/epic), `git log --oneline -- <area>`, and existing similar implementations worth reusing. This angle exists to kill false "never-built" verdicts and to verify ticket claims against what shipped under another name.

**Every search agent MUST return in exactly this shape** (state it in the brief):
- **Findings** — each a one-line claim + evidence `file:line` (or doc path + section). No claim without a citation.
- **Confidence** per finding — `confirmed` (read it directly) or `inferred` (pattern/indirect, not directly seen).
- **Not checked / could not confirm** — an explicit list of what the agent did NOT cover or could not verify. Silence is forbidden: "nothing else in scope" must be stated, never implied.

A search agent does not design, does not recommend, does not decide the interview, does not write the research doc. It gathers and cites. Full stop.

## Phase 3 — Synthesis + verification (Opus, lead) — DO NOT TRUST BLINDLY

The agents' reports are raw material, not conclusions. A single agent routinely sees one place correctly while missing the whole picture — your job is to catch exactly that. The lead MUST, in order:

1. **Spot-verify load-bearing claims.** For every claim the design will rest on, open the cited `file:line` yourself and confirm it says what was reported. Treat each claim as unverified until you have seen the evidence directly or a second angle independently corroborates it. `inferred`-confidence claims always require your own look.
2. **Reconcile across angles — hunt the local view.** A claim can be true in one file and false for the feature as a whole. Cross-check: does the vertical chain agree with the horizontal sweep? Does the code agree with the docs? **Every contradiction between two angles is a signal that someone saw a partial picture — resolve it by reading the code yourself, never by picking the convenient answer.**
3. **Coverage check.** Walk every angle and every "not checked" list. Is any required surface still unexamined? Was any Phase-1 verification target never actually verified? Those are gaps, not done.
4. **Reconcile each ticket claim** and label every divergence in `01_research.md`:
   - **renamed/moved** — exists under a different name/namespace, often the output of a closed ticket (cite it);
   - **replaced-by-different-model** — concept exists but via a different mechanism (cite the closed ticket that changed it);
   - **never-built / dropped** — genuinely absent under any name (be skeptical; only assert after the Prior-art angle + your own `git log` check).
5. **Re-dispatch on gap — bounded.** If coverage is incomplete, a load-bearing claim is unverified, or two angles contradict and you cannot resolve it from what is in hand → dispatch a focused follow-up search agent for exactly that gap. **Cap: at most 2 extra targeted rounds.** After that, proceed with what you have and flag any residual unknown explicitly in the doc. Do not loop forever; do not silently drop the gap.

Move on only when the picture is whole, spot-verified, and internally consistent across all four angles.

## Phase 4 — Interview decision + write the doc

1. **Decide whether a product/operational interview is useful before design.** If research exposes real product / ops / rollout / risk / UX / scope / implementation-strategy choices, ask the questions **in chat now** (before `02_design`), phrased for a non-technical product owner: real scenario, why it matters, day-to-day consequence per option, 2–3 plain-language options with one clear recommendation and easy answer codes (e.g. `1A, 2B`).
2. **Do NOT write unanswered interview questions into `01_research.md`.** While answers pend, the doc only states that an interview is required and that questions were asked in chat. After answers, fold the chosen decisions + their design implications into the doc.
3. **When the user pushes back on a research claim, re-verify against the code/backlog before defending it.** Treat "where did this come from — maybe you missed recent tickets" as a signal to widen the search (backlog grep, `git log`, other modules), not to re-explain the same finding. Correct the doc in place; do not paper over the original mistake.
4. **Write `<task-folder>/01_research.md`**: findings with citations + confidence, the ticket-claim reconciliation (with flavor labels), any residual unknowns, and the interview status.

## Closing — follow-up capture (mandatory)

Any deferred work, future improvement, postponed scope, or spec gap discovered during research → consolidate into the project backlog per its rules **before the turn ends**: bundle, don't shard; check existing open bundles for the same surface/source/domain before creating a new one; the backlog row is a one-line index (details go in the ticket). Follow-ups left only in `01_research.md` are lost.

Stop for confirmation before `02_design` (staged execution).
