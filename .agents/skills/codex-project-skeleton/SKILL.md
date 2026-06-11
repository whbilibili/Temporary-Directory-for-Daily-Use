---
name: codex-project-skeleton
description: Generate an engineering-grade Codex-friendly project scaffold. Use when the user asks to create, initialize, bootstrap, or design a project skeleton with AGENTS.md, README, changelog, docs, memory, tasks, prompts, templates, scripts, rules, hooks, repo-scoped skills, or subagent configuration for Codex or agentic software development.
---

# Codex Project Skeleton

Use this skill to create a complete, editable project scaffold optimized for Codex sessions and agentic development workflows. Supports cross-tool compatibility (Claude Code, Cursor, Copilot), multiple tech stacks, and monorepo layouts.

## Workflow

1. Determine the target directory, project name, and intended role or use case from the user's request.
2. If the request is underspecified, choose:
   - `project-name`: directory basename
   - `role`: "general-purpose Codex-friendly engineering workspace"
   - `profile`: `full`
3. Read `references/scaffold-spec.md` only when you need the detailed generated layout, rationale, or customization guidance.
4. Run `scripts/create_codex_project_skeleton.py` from this skill to generate the scaffold.
5. Inspect the result and report created files, skipped files, and any follow-up customization points.

## Generator

Use the script instead of rewriting the scaffold manually:

```bash
python3 /Users/wanghong/Projects/日常临时目录/.agents/skills/codex-project-skeleton/scripts/create_codex_project_skeleton.py <target-dir> \
  --project-name "<name>" \
  --role "<role or scenario>" \
  --profile full
```

Useful flags:

- `--dry-run`: preview file writes without changing disk.
- `--force`: overwrite existing generated files.
- `--init-git`: run `git init` after creating files.
- `--profile full`: generate the complete scaffold.
- `--profile code`: emphasize implementation, tests, review, and release notes.
- `--profile knowledge`: emphasize docs, memory, prompts, and research.
- `--profile agent`: emphasize Codex config, hooks examples, repo skills, and custom agents.
- `--compat claude`: also generate `CLAUDE.md` (references AGENTS.md).
- `--compat cursor`: also generate `.cursorrules`.
- `--compat copilot`: also generate `.github/copilot-instructions.md`.
- `--compat all`: generate all compatibility files.
- `--tech-stack node|python|go|java`: fill `scripts/check.sh` with real commands for the stack.
- `--monorepo`: generate sub-directory AGENTS.md templates under `apps/`.

## Generation Rules

- Keep root `AGENTS.md` concise (< 2KB). Put long-lived details in `.codex/memory`, `docs`, `prompts`, and `templates`.
- Prefer example hook and rule files over active automation unless the user explicitly asks for enforcement.
- Never overwrite existing files unless the user asked for replacement or `--force` is used.
- Initialize Git only when the user asks for it or `--init-git` is explicitly appropriate.
- Preserve user edits in an existing project. Treat skipped files as intentional conflicts to report.

## After Generation

Recommend that the user customize these first:

- `AGENTS.md`: project-specific working agreements and validation commands.
- `.codex/memory/project.md`: durable project facts.
- `.codex/agents/*.toml`: custom subagent roles.
- `.agents/skills/project-context/SKILL.md`: repo-specific skill trigger language.
- `scripts/check.sh`: actual test, lint, typecheck, and documentation checks.

## Design Principles

- **Five-Layer Architecture**: Constitution (AGENTS.md) → Skills → MCP Tools → Subagents → Plugins.
- **Context Engineering**: Always-loaded (AGENTS.md < 2KB) → On-demand (docs/) → Offloaded (tasks/, daily/).
- **Hard/Soft Separation**: AGENTS.md = soft guidance (should do); .codex/rules/ = hard constraints (can/cannot do).
- **Knowledge Flywheel**: Mistake → Pattern → Rule → lessons.md/rules → Never repeat.
- **Cross-Tool Compatibility**: AGENTS.md as the single source of truth; other tool configs reference it.
