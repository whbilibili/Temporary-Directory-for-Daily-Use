# Codex-Friendly Project Scaffold Spec

## Research Summary

- Codex discovers `AGENTS.md` from global and project scopes, then merges from root toward the current directory. Later, more local instructions override earlier guidance.
- Codex skips empty instruction files and stops once combined project guidance reaches `project_doc_max_bytes`, which defaults to 32 KiB. Keep `AGENTS.md` short and link to deeper files.
- Skills should be focused directories with `SKILL.md` plus optional `scripts`, `references`, `assets`, and `agents/openai.yaml`. Repo-scoped skills belong under `.agents/skills`.
- Project-local hooks live in `.codex/hooks.json` or `.codex/config.toml` and require trust review. Use example hook files by default.
- Project-local custom agents live under `.codex/agents/*.toml`; each file should include `name`, `description`, and `developer_instructions`.
- Rules live under `.codex/rules/*.rules` only when the project config layer is trusted. Keep rules examples conservative.
- AGENTS.md is evolving into an open standard format (driven by OpenAI Codex, Amp, Google Jules, Cursor, Factory).

Primary references:

- OpenAI Codex AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- OpenAI Codex hooks guide: https://developers.openai.com/codex/hooks
- OpenAI Codex subagents guide: https://developers.openai.com/codex/subagents
- OpenAI Codex rules guide: https://developers.openai.com/codex/rules

## Design Principles

### Five-Layer Composable Architecture (Daniel Vaughan)

| Layer | Name | Responsibility | Files |
| --- | --- | --- | --- |
| 1 | Constitution | Project-level persistent instructions | `AGENTS.md` |
| 2 | Skills | Reusable task templates | `.codex/skills/` |
| 3 | Tools | External service connections | `.codex/mcp.json` |
| 4 | Roles | Multi-agent collaboration | `.codex/agents/` |
| 5 | Plugins | Distributable capability packages | npm plugins |

### Context Engineering Strategy

| Layer | Strategy | Files |
| --- | --- | --- |
| Always-loaded | Short, auto-read every session | `AGENTS.md` (< 2KB) |
| On-demand | Progressive disclosure, agent searches | `docs/`, `prompts/`, `templates/` |
| Offloaded | Written to filesystem, frees context | `tasks/`, `.codex/memory/daily/` |

### Hard vs Soft Constraints

| Type | File | Nature | Example |
| --- | --- | --- | --- |
| Soft guidance | `AGENTS.md` | What AI should do | "Prefer pnpm" |
| Hard constraint | `.codex/rules/` | What AI can/cannot do | `deny: rm -rf *` |

### Knowledge Flywheel

```
Mistake → Identify pattern → Codify as rule → Write to lessons.md/rules → Never repeat
```

### AGENTS.md Merge Priority (low → high)

1. `~/.codex/AGENTS.md` — Global user preferences (lowest)
2. Git repo root `AGENTS.md` — Project-level norms
3. Subdirectory `AGENTS.md` (e.g. `frontend/AGENTS.md`) — Submodule override
4. `AGENTS.override.md` — Emergency override (e.g. release freeze)

Merge rule: additive, not replacement. Subdirectory only overrides conflicting rules.

## Generated Layout

```text
<project>/
  AGENTS.md
  CLAUDE.md
  README.md
  CHANGELOG.md
  LICENSE
  .gitignore
  .gitattributes
  .editorconfig
  .env.example
  docs/
    INDEX.md
    architecture.md
    context-engineering.md
    onboarding.md
    operations.md
    decisions/
      0001-record-architecture-decisions.md
  .codex/
    config.toml
    hooks.example.json
    mcp.json
    memory/
      README.md
      project.md
      decisions.md
      lessons.md
      daily/.gitkeep
    agents/
      explorer.toml
      implementer.toml
      reviewer.toml
      docs-researcher.toml
      test-writer.toml
    hooks/
      README.md
      session_start.py
      stop_summary.py
      pre_tool_use_policy.py
      post_tool_use_audit.py
    rules/
      README.md
      templates/default.rules.example
    skills/
      README.md
      add-test.yaml
      refactor.yaml
      fix-bug.yaml
  .agents/
    skills/
      project-context/
        SKILL.md
        references/project-map.md
  tasks/
    README.md
    active.md
    backlog.md
    done.md
    task-template.md
  prompts/
    README.md
    implementation-plan.md
    code-review.md
    research.md
    handoff.md
    debug.md
  templates/
    README.md
    adr.md
    feature-spec.md
    pr-description.md
    bugfix-template.md
    handoff.md
  snippets/
    README.md
    code-snippets.md
    command-snippets.md
  scripts/
    README.md
    bootstrap.sh
    check.sh
    new-task.sh
    sync.sh
  .github/
    pull_request_template.md
    copilot-instructions.md
    workflows/ci.yml
```

## Cross-Tool Compatibility

| Tool | Entry File | Config Dir | Compatibility |
| --- | --- | --- | --- |
| OpenAI Codex | `AGENTS.md` | `.codex/` | Native |
| Claude Code | `CLAUDE.md` | `.claude/` | References AGENTS.md |
| Cursor | `.cursorrules` | `.cursor/` | References AGENTS.md |
| GitHub Copilot | `copilot-instructions.md` | `.github/` | Content sync |
| Windsurf | `.windsurfrules` | — | Content sync |

Strategy: AGENTS.md is the single source of truth. Other tool configs reference it.

## Common Directory Semantics

| Directory | Default Meaning |
| --- | --- |
| `app/` | Main service or tool code |
| `apps/` | Multiple application repos (monorepo) |
| `services/` | Service code units in multi-service repos |
| `jobs/` | Batch, scheduled, offline task code |
| `common/` / `shared/` | Stable shared layer |
| `deploy/` | Deployment scripts, service templates |
| `docs/` | Source documentation |
| `delivery/` | Packages for handoff or deployment |
| `dist/` | Build output, not necessarily kept long-term |
| `artifacts/` | Evaluation, experiment, report outputs |
| `logs/` | Logs, failure samples, run output |
| `data/` | Not deployed by default |
| `datasets/` | Training, evaluation, build data |
| `samples/` | Debug or validation examples |

## Design Rationale

- `AGENTS.md` is the fast entry point for Codex. It should contain the operating contract, validation command, and where to look next. Keep it under 2KB.
- `CLAUDE.md` provides Claude Code compatibility by referencing AGENTS.md as the primary instruction source.
- `.codex/memory` stores durable facts, decisions, lessons, and daily continuity notes. It is project-owned, not chat-owned.
- `.codex/mcp.json` declares external tool connections (MCP servers) available to the agent.
- `.codex/skills` contains Codex-native reusable skill templates (YAML format).
- `.agents/skills/project-context` gives the repo a local skill that can be invoked explicitly or implicitly for project-specific work.
- `.codex/agents` defines specialized subagents without forcing parallel work; Codex still spawns subagents only when asked.
- `.codex/hooks` and `.codex/rules` ship as examples first because active hooks and rules affect local trust and approvals.
- `tasks`, `prompts`, and `templates` make repeatable work visible and editable by humans and agents.
- `snippets` provides reusable code and command fragments for quick reference.

## Customization Guidance

- For a software repo, fill `scripts/check.sh` with real `test`, `lint`, `typecheck`, and build commands.
- For a role-playing or research repo, rewrite `AGENTS.md` and `.agents/skills/project-context/SKILL.md` around role boundaries, source policy, output style, and memory rules.
- For multi-package repos, add nested `AGENTS.md` files near packages with different build commands or review rules.
- For enforced automation, copy `.codex/hooks.example.json` to `.codex/hooks.json`, review every command, then trust hooks through `/hooks`.
- For enforced command policy, copy `.codex/rules/templates/default.rules.example` to `.codex/rules/default.rules` and keep prefix rules narrow.
- For monorepo with multiple apps, use `apps/` directory and add per-app `AGENTS.md` with app-specific build/test commands.
- For cross-tool compatibility, use `--compat all` to generate CLAUDE.md, .cursorrules, and copilot-instructions.md.

## Tech Stack Templates for scripts/check.sh

### Node.js / TypeScript
```bash
pnpm install
pnpm exec eslint .
pnpm exec tsc --noEmit
pnpm exec vitest run
```

### Python
```bash
pip install -e ".[dev]"
ruff check .
mypy .
pytest
```

### Go
```bash
go vet ./...
golangci-lint run
go test ./...
```

### Java
```bash
./gradlew check
./gradlew test
```
