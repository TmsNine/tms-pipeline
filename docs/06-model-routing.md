# Model routing for tms-pipeline

> Which model and reasoning effort run each part of the pipeline, and how to change them. The Russian
> version is [06-model-routing.ru.md](06-model-routing.ru.md).

## The rule: model and effort belong to the role

You start one chat and never switch the model or the effort by hand between stages. Every agent role
ships with its model and effort written into its own definition file, and `tms-run` dispatches each
stage to the agent that owns it. The right setting follows the role automatically.

How the settings were chosen:

- **Cheaper tier** for work that collects and reports: search, inventories, running checks, assembling
  the test report and the gate page.
- **Top tier** for everything that decides: what the task actually is, the design, the plan and its
  seams, writing the code of one chain, any judgement about what a person using the product will see,
  and every review pass.
- **Effort is the first lever, not a weaker model:** medium for routine stages, high where judgement is
  the product (design, plan, review, security).
- **One dependent chain, one executor.** Stage 04 is written by one strong agent at medium effort rather
  than by a coordinator plus workers: a coordinator re-reads the plan and every report on every step, and
  a defect between two individually correct phases is invisible inside either of them.

## Claude Code: agents and their pinned models

The agent files live in `agents/` in this repository and are installed into `~/.claude/agents/` (or
loaded from the plugin).

| Agent | Model | Effort | Runs |
|---|---|---|---|
| `tms-stage` | `claude-opus-5-5` | medium | stages 01, 04, 04b |
| `tms-stage-deep` | `claude-opus-5-5` | high | stage 02, then 03 (the same agent, resumed) |
| `tms-stage-light` | `claude-sonnet-5` | medium | stages 05, 06 |
| `tms-reviewer`, `tms-security`, `tms-architect` | `claude-opus-5-5` | high | review passes, the security pass |
| `tms-developer` | `claude-opus-5-5` | medium | bounded fixes |
| `tms-explorer` | `claude-sonnet-5` | medium | research fan-out |
| `tms-tester` | `claude-sonnet-5` | low | named checks |

Stage 00 (the ticket) runs in your own chat, without a separate agent: it needs your exact words, and
they live in that chat.

Three rules keep this working:

- **Pin by full model id, never by a short alias.** An alias can resolve to different models over time,
  so the same pipeline would silently run on different models from one week to the next.
- **Never dispatch a stage as `general-purpose`.** A general-purpose agent inherits whatever model the
  chat happens to run on, so most of the work would run on whatever the chat was started with. Always
  dispatch by the named agent type.
- **For search use `tms-explorer`,** not the built-in `Explore` agent, so research fan-out stays on the
  model and effort chosen for it.

### Changing the models

The ids above are what this release ships with. If your plan does not include one of these models, or a
newer model changes what "top tier" and "cheaper tier" mean for you, edit the `model:` (full id) and
`effort:` lines in the frontmatter of each agent file in `~/.claude/agents/`. Keep the split between the
two tiers; change the ids, not the roles.

Editing is easiest when the agents were copied by the installer. Agents loaded from the plugin live inside
the plugin's own folder and are replaced on the next plugin update, so if you want your own ids, install
by copying instead of using the plugin.

### `permissionMode`

Some agent files also declare `permissionMode` (for example, read-only planning mode for reviewers).
Claude Code applies it to agents copied into `~/.claude/agents/` or a project's `.claude/agents/`, but
**ignores it for agents shipped inside a plugin**; there the agent runs with the permissions of the chat
that started it. The same is true of any frontmatter value: a declared setting is not proof that it was
applied. Source: [Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents).

## Codex: helper roles and their settings

Codex has no stage agents. A stage runs on your Codex session's own model and effort; give stages 02 and
03 (design and plan) the deeper setting, as the table in `tms-run` says. What Codex does have are helper
roles, as TOML files in `codex-agents/`, installed into `~/.codex/agents/`. Each file sets three fields:

- `model` — the model id;
- `model_reasoning_effort` — the effort (`low`, `medium`, `high`, `xhigh`);
- `sandbox_mode` — `read-only` for roles that only look, `workspace-write` for roles that may write.

As shipped:

| Role | `model` | `model_reasoning_effort` | `sandbox_mode` |
|---|---|---|---|
| `tms_explorer` | `gpt-5.6-terra` | medium | read-only |
| `tms_developer` | `gpt-5.6-terra` | high | workspace-write |
| `tms_architect` | `gpt-5.6-terra` | high | read-only |
| `tms_reviewer` | `gpt-5.6-terra` | high | read-only |
| `tms_security` | `gpt-5.6-sol` | xhigh | read-only |
| `tms_validator` | `gpt-5.6-luna` | medium | workspace-write |

To change a model, edit the `model` and `model_reasoning_effort` lines in the matching file in
`~/.codex/agents/`. Model names and availability vary by Codex host and account; check the
[OpenAI model catalog](https://developers.openai.com/api/docs/models) for the ids your account offers.

## What matters more than the model name

1. A clean stage input: each stage gets the previous artifact and the ticket, never the previous
   conversation.
2. Fresh, independent context for every review pass in 04b.
3. Strong models where a decision is made, cheap ones where evidence is collected.
4. Honest evidence: a check counts only with its exit code and output, not because a setting says it
   should have run.
