---
name: tms-01-research
description: "Run pipeline stage 01 (research) for a backlog task in a project that follows the 9-stage delivery pipeline. Research the implementation along vertical + horizontal paths, optionally using bounded cheap-tier Codex explorer subagents for evidence gathering, decide whether a non-technical product-owner interview is needed before design, and capture follow-ups. Use when the user asks to 'do 01', 'research', 'сделай ресёрч' for a pipeline task by ID. Also match the legacy command /tms-research."
---

# Stage 01 — Research

Read THIS project's `AGENTS.md` (Codex reads it natively) for specifics: task-folder path, product-doc locations, backlog location, output language. In Codex shell sessions do not assume JS tooling is on PATH (prefer `PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"`).

This stage may use a bounded read-only research fan-out. The lead owns judgement: it frames the search, verifies load-bearing evidence, reconciles contradictions, decides interview need, and writes `01_research.md`. Subagents gather evidence only; they do not design, decide product options, or write the final artifact.

If `multi_agent_v1.spawn_agent` is not visible, first use tool discovery for multi-agent tools. If unavailable, run the same four angles locally and record no subagent limitation only if it materially reduced coverage.

## Subagent Authorization (Codex)

A user invocation of this skill/stage is explicit authorization to use the subagents described by this skill. Do not treat the general multi-agent tool rule (spawn only on explicit user request) as a reason to skip a required reviewer, finder, skeptic, critic, worker, tester, architect, security specialist, or bounded explorer that this skill calls for. If this skill marks a subagent step as mandatory, run it; fall back to a local pass only when multi-agent tools are genuinely unavailable or the user explicitly opts out, and record the limitation in the stage artifact and final summary. If this skill marks a subagent step as optional, the invocation authorizes that option, but the skill's own use/skip criteria still decide whether it is worth running.

## Model Tiers

- Lead synthesis: use the current strong model. Use high/xhigh when the task touches auth, RLS, payments, PII, lifecycle state machines, migrations, queues, or cross-module contracts.
- Evidence gatherers: `agent_type: "explorer"`, `model: "gpt-5.3-codex-spark"`, `reasoning_effort: "high"` by default. If Spark is unavailable, use the cheapest available Codex 5.3-class explorer. Bump one gatherer to `gpt-5.4` / `"high"` only for complex code archaeology, heavily coupled surfaces, or evidence that must be interpreted rather than merely located.
- Never use cheap gatherer conclusions directly as design truth. Reopen and verify the cited evidence in the lead session.

## Phase 1 — Frame The Search

Read only `docs/TASK-ID/00_ticket.md` first.

1. Treat the ticket as a hypothesis, not ground truth. Extract:
   - concrete factual claims the design will rest on;
   - the full surface to sweep, wider than the ticket examples if needed.
2. Instantiate the four fixed research angles below for this project. No angle is optional unless plainly N/A; if dropped, say why in `01_research.md`.
3. Decide whether to use subagents. Use fan-out when the surface is broad, spans multiple modules/docs, or ticket claims are likely stale. Stay local for very small tasks where subagent overhead would exceed the work.

## Phase 2 — Four Fixed Angles

Research exactly these angles:

1. **Vertical path** — caller/UI → route/guard → handler/service → contract → persistence/external system. Return chain with `file:line`.
2. **Horizontal siblings** — sibling routes/components/services, schemas, serializers, tests, all UI states, producer + consumer sides of contracts.
3. **Product & lifecycle docs** — PRD, flows, state machines, architecture docs governing the surface; note code/doc contradictions.
4. **Prior art & history** — related backlog tickets, `git log --oneline -- <area>`, existing similar implementations, renamed/replaced concepts.

### Optional Bounded Fan-Out

Spawn up to four read-only explorer agents, one per angle, in parallel. Each prompt must be self-contained and ask only for evidence:

- exact `path:line` citations or doc path + heading;
- symbol/component/route name plus the relevant snippet or signature when searching code;
- one-line finding text;
- confidence: `confirmed` / `inferred`;
- "not checked / could not confirm";
- no design recommendations unless asked for "similar implementation worth reusing".

Use `fork_context: false`. Do not pass product decisions, suspected answers, or the lead's conclusions. For two extra targeted rounds maximum, spawn focused explorers only for unresolved contradictions or missing load-bearing claims.

Keep working notes in this shape:

- **Findings** — one-line claim + evidence `file:line` or doc section.
- **Confidence** — `confirmed` or `inferred`.
- **Not checked / could not confirm** — explicit list.

## Phase 3 — Synthesis + Verification

Do not trust notes blindly. In the lead session:

1. Reopen every load-bearing citation and confirm it supports the claim.
2. Reconcile contradictions across the four angles by reading code/docs directly.
3. Check coverage against every Phase-1 factual claim and every "not checked" item.
4. Reconcile ticket claims and label divergences:
   - **renamed/moved** — exists under another name/namespace;
   - **replaced-by-different-model** — concept exists via another mechanism;
   - **never-built / dropped** — genuinely absent after prior-art and code search.
5. Close gaps with at most two extra targeted rounds. After that, proceed with explicit residual unknowns.

## Phase 4 — Interview Decision + Doc

1. If research exposes real product/ops/rollout/risk/UX/scope choices, ask the product-owner interview in chat now, in non-technical Russian: scenario, why it matters, day-to-day consequence per option, 2-3 options with one recommendation and easy answer codes. Do not write unanswered questions into `01_research.md`.
2. When the user challenges a research claim, re-verify against code/backlog before defending it.
3. Write `docs/<TASK-ID>/01_research.md`: evidence-backed findings, ticket-claim reconciliation, residual unknowns, interview status, and any subagent fan-out used.

## Closing — Follow-Up Capture

Any deferred/future work or spec gap → consolidate into the project backlog per `AGENTS.md` rules before the turn ends. Follow-ups left only in `01_research.md` are lost.

Stop for confirmation before `02_design`.
