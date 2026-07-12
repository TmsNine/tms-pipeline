---
name: tms-91-audit-sweep
description: "Codebase-audit stage 2 — sweep ONE zone for findings using an adversarial finder↔skeptic duel (independent subagents), record only the findings that survive refutation. Run once per zone, each in a fresh context window; no arg = next pending zone from the manifest. Second of the tms-audit-* pipeline. Use when the user invokes /tms-audit-sweep."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# Codebase Audit — Stage 2: Sweep (adversarial)

Audit exactly one zone and write its findings. The whole point of this stage is the **finder↔skeptic duel**: an automated audit's worst failure mode is false positives (problems that aren't real, or are already handled elsewhere). An independent skeptic that tries to refute every finding kills those before they reach the report.

Read THIS project's `AGENTS.md` / `CLAUDE.md` for: severity rubric (Class A/B/C/D), tenant-scoping/auth/PII rules (so the skeptic knows what "already handled" looks like), validation commands, output language.

## Subagent Authorization (Codex)

A user invocation of this skill/stage is explicit authorization to use the subagents described by this skill. Do not treat the general multi-agent tool rule (spawn only on explicit user request) as a reason to skip a required reviewer, finder, skeptic, critic, worker, tester, architect, security specialist, or bounded explorer that this skill calls for. If this skill marks a subagent step as mandatory, run it; fall back to a local pass only when multi-agent tools are genuinely unavailable or the user explicitly opts out, and record the limitation in the stage artifact and final summary. If this skill marks a subagent step as optional, the invocation authorizes that option, but the skill's own use/skip criteria still decide whether it is worth running.

## Subagent Independence And Model Tiers (Codex)

If `spawn_agent` is not visible, use tool discovery for multi-agent tools. Spawn finder and skeptic with the exposed clean-context mechanism (`fork_turns: "none"` in the current schema); the skeptic must NOT see the finder's reasoning as your endorsement, only bare claims to refute.

Model tiers:

- Code-map explorer: Terra medium (fallback `gpt-5.4-mini` high) for a broad zone; evidence only, no severity classification.
- Finder: Terra high (fallback `gpt-5.4`) for ordinary zones; Sol high (fallback `gpt-5.5`) for auth/RLS/payments/PII/migrations/queues/lifecycle.
- Skeptic: at least the finder's capability tier; Sol xhigh for proposed Class A/B or security/privacy/payment findings.
- Debate follow-ups: use the lowest sufficient tier, but never below Sol high / `gpt-5.5` high for Class A/B security or data-integrity disputes. Never use Fast mode or Ultra for a scoring verdict.

## Method

1. **Locate the audit.** Find the active `docs/AUDIT-*/` folder (latest, or the one named in context). Read `00_scope.md` (categories, finding format, severity rubric) and `manifest.md`.

2. **Pick the zone.** If `$1` names a zone, use it. If `$1` is empty or `next`, take the first `☐ pending` zone in the manifest. If none are pending → tell the user the sweep is complete and to run `tms-audit-triage`; stop.

3. **Ground with tools first.** Run the static-analysis tools `00_scope.md` recorded, scoped to this zone (dead-code/unused, dep/cycle, `tsc --noEmit`, linter). Their output is **grounded seed evidence** — pass it to the finder so "dead code / unused export / cycle" findings are tool-verified facts, not LLM guesses. Do NOT install tools; if none exist for this zone, note that and proceed.

4. **Finder pass.** If the zone is broad, first spawn a Terra/fallback evidence explorer to produce the compact code map above, then give that map plus tool seeds to the finder. Spawn a finder subagent scoped to the zone's path(s), with the tool seeds. Self-contained prompt: hunt the in-scope categories, return raw findings each with `file:line`, category, proposed severity + a "why this class, not the one below" line, and concrete evidence. **Empirical gate:** any finding the finder wants to mark Class A/B in the correctness/security category must come with a runnable repro/test or a concrete exploit path — an argument alone is not enough; without it, it cannot be A/B. For an oversized zone, split across 2–3 finders by sub-area. Collect raw findings — do not yet trust them.

5. **Skeptic pass — context asymmetry.** Spawn an INDEPENDENT skeptic subagent (fresh context) given ONLY the bare claim + `file:line` + the zone code — **NOT the finder's narrative/reasoning** (so it forms an orthogonal judgement instead of anchoring on the finder). Its job is to **refute each one**, defaulting to skepticism: actually reachable? already validated/handled upstream? intentional? false positive? dead-but-harmless vs truly dead? For A/B correctness/security it must independently check the empirical evidence reproduces. Returns per finding a verdict — `stands` / `refuted` / `needs-revision` — with its own reasoning, and a **confidence 0–100** that the finding is real.

6. **Debate loop (default max 2 rounds).** For `needs-revision` / disputed findings, re-spawn the finder with the skeptic's objections to defend or revise, then re-spawn the skeptic to re-check. Iterate until no disputed findings remain or the round budget is hit. Stop early if rounds stop changing verdicts. **Confidence gate:** a survivor with final confidence below the threshold (default 70) is either dropped or downgraded a class, not recorded as a confident finding.

7. **Write `areas/<zone>.md`:**
   - **Confirmed findings** — for each: id `<zone>-NN`, category, **Class A/B/C/D** + the "why not the lower class" rationale (no inflation — use the project rubric), `file:line`, what's wrong, why it matters, suggested action, **confidence 0–100**, and for A/B correctness/security the **empirical evidence** (repro/test/exploit path).
   - **False-positive ledger (required, not optional)** — what the skeptic killed and the one-line reason, AND patterns the finder considered but deliberately did not flag. This section must be non-empty: if it's empty, the sweep didn't look hard enough. Keeps the audit auditable and stops the same non-issue resurfacing in triage or the next run.

8. **Update `manifest.md`:** flip the zone to `☑ done`, link its findings file, note counts (e.g. `7 confirmed / 4 rejected`).

## Closing

Report (project's output language): zone done, X confirmed / Y rejected with the Class breakdown, and how many zones remain `☐ pending`. Tell the user to run `tms-audit-sweep` again for the next zone (fresh window), or `tms-audit-triage` once all zones are done. One zone per window — the manifest is the only cross-window memory; do not chain into the next zone here.
