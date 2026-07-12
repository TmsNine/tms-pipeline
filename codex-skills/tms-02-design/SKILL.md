---
name: tms-02-design
description: "Run pipeline stage 02 (design) for a backlog task in a project that follows the 9-stage delivery pipeline. Author the single design contract as a minimal sufficient change at the owning layer, and capture follow-ups. Use when the user asks to 'do 02', '02_design', 'сделай дизайн' for a pipeline task by ID. Also match the legacy command /tms-design."
---

# Stage 02 — Design contract

Read THIS project's `AGENTS.md` (Codex reads it natively) for product rules, tenant/auth/persistence constraints, task-folder path, backlog location, output language.

> **Model tier.** Prefer Sol high for product/architecture judgement and Sol xhigh for auth/RLS/payments/PII/lifecycle/migrations/queues/cross-module contracts; fallback `gpt-5.5`. A read-only evidence gatherer should use Terra medium (fallback `gpt-5.4-mini` high), and the lead must verify citations before turning them into the design contract. Never use Fast mode; Max is reserved for an unresolved Profile-C decision after a normal strong pass.

## Method

1. **Read** `00_ticket.md` + `01_research.md` (+ interview answers if any).
2. **Design the minimal sufficient change at the owning layer.** Smallest surface/abstraction count, flat over layered, decoupling over DRY, local clarity over clever reuse. Fix the owner layer — no child-side fallbacks that hide an upstream mistake.
3. **Inspect change-surface triggers**: shared contracts/schemas (producer + consumer), routes/guards/layouts, queries/mutations (keys, invalidation, all states), schema/persistence (serializers, migrations, read + write paths), auth/permission, async (retries, idempotency, ordering, failure visibility), legal/billing/privacy copy.
4. Write `docs/<TASK-ID>/02_design.md` as the single design contract: what "done" means, 3–5 observable pass/fail criteria, primary + secondary signals. State rollout order if migrations/contracts/auth change.

If a genuinely open product/architecture tradeoff exists, present up to two options with one recommendation and ask before locking.

## Closing — follow-up capture (mandatory)

Deferred work / spec gaps / architecture deltas → project backlog or owning doc per `AGENTS.md` rules (bundle, don't shard) before the turn ends.

Stop for confirmation before `02b_gap_audit`.
