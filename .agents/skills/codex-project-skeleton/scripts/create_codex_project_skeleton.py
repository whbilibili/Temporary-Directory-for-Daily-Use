#!/usr/bin/env python3
"""Create a Codex-friendly project scaffold."""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path


PROFILES = {"full", "code", "knowledge", "agent"}
COMPAT_OPTIONS = {"claude", "cursor", "copilot", "all"}
TECH_STACKS = {"node", "python", "go", "java"}


@dataclass(frozen=True)
class FileSpec:
    path: str
    content: str
    profiles: frozenset[str] = frozenset(PROFILES)
    executable: bool = False
    compat: str = ""  # empty = always; "claude", "cursor", "copilot" = only with that compat flag


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "codex-project"


def render(template: str, project_name: str, project_slug: str, role: str) -> str:
    return (
        template.replace("{{PROJECT_NAME}}", project_name)
        .replace("{{PROJECT_SLUG}}", project_slug)
        .replace("{{ROLE}}", role)
    )


def get_check_script_content(tech_stack: str, project_name: str) -> str:
    """Return check.sh content based on tech stack."""
    if tech_stack == "node":
        return f"""#!/usr/bin/env sh
set -eu

echo "Running checks for {project_name} (Node.js/TypeScript)..."

# Install dependencies
pnpm install --frozen-lockfile

# Lint
pnpm exec eslint .

# Type check
pnpm exec tsc --noEmit

# Test
pnpm exec vitest run

echo "All checks passed."
"""
    elif tech_stack == "python":
        return f"""#!/usr/bin/env sh
set -eu

echo "Running checks for {project_name} (Python)..."

# Install dependencies
pip install -e ".[dev]" -q

# Lint
ruff check .

# Type check
mypy .

# Test
pytest

echo "All checks passed."
"""
    elif tech_stack == "go":
        return f"""#!/usr/bin/env sh
set -eu

echo "Running checks for {project_name} (Go)..."

# Vet
go vet ./...

# Lint
golangci-lint run

# Test
go test ./...

echo "All checks passed."
"""
    elif tech_stack == "java":
        return f"""#!/usr/bin/env sh
set -eu

echo "Running checks for {project_name} (Java)..."

# Check and test
./gradlew check
./gradlew test

echo "All checks passed."
"""
    else:
        return f"""#!/usr/bin/env sh
set -eu

echo "No project-specific checks configured yet."
echo "Replace this with lint, test, typecheck, build, or documentation checks."
echo ""
echo "Hint: re-run the scaffold generator with --tech-stack node|python|go|java"
echo "to get pre-filled commands for your stack."
"""


def files(tech_stack: str = "") -> list[FileSpec]:
    all_profiles = frozenset(PROFILES)
    code_agent = frozenset({"full", "code", "agent"})
    knowledge_agent = frozenset({"full", "knowledge", "agent"})
    code_only = frozenset({"full", "code"})
    knowledge_only = frozenset({"full", "knowledge"})
    agent_only = frozenset({"full", "agent"})

    return [
        # ─── Root files ───
        FileSpec(
            "AGENTS.md",
            """# {{PROJECT_NAME}} Agent Instructions

## Mission

This repository is a Codex-friendly workspace for: {{ROLE}}.

## Working Agreements

- Read `README.md`, `docs/INDEX.md`, and `.codex/memory/project.md` before substantial changes.
- Prefer small, reviewable edits with explicit verification.
- Preserve user changes. Do not revert unrelated work.
- Keep root instructions concise; put durable detail in `.codex/memory`, `docs`, `prompts`, and `templates`.
- Update `CHANGELOG.md` for user-visible changes.

## Project Map

- `docs/`: architecture, operations, onboarding, and decisions.
- `.codex/memory/`: durable project memory and continuity notes.
- `.codex/agents/`: optional custom subagent definitions.
- `.codex/hooks/`: hook script examples; inactive until wired from `.codex/hooks.json`.
- `.codex/rules/`: command policy examples.
- `.codex/skills/`: reusable Codex skill templates.
- `.agents/skills/project-context/`: repo-scoped project skill.
- `tasks/`: active work, backlog, completion notes, and task templates.
- `prompts/`: reusable prompts for planning, review, research, debug, and handoff.
- `templates/`: reusable project artifacts.
- `snippets/`: code and command fragments for quick reference.
- `scripts/`: deterministic local commands.

## Security

- Do not read `.env` or `credentials/` files.
- Do not execute `rm -rf` or `git reset --hard`.
- Do not commit secrets or API keys.

## Verification

- Run `scripts/check.sh` before delivery after implementation work.
- If a check is not implemented yet, explain that gap and update `scripts/check.sh` when the command becomes known.
""",
        ),
        FileSpec(
            "CLAUDE.md",
            """# {{PROJECT_NAME}} — Claude Code Instructions

Read and follow `AGENTS.md` for all project conventions, working agreements, and verification commands.

## Additional Claude-Specific Notes

- Use `.codex/memory/project.md` for durable project facts.
- Track tasks in `tasks/active.md`.
- Run `scripts/check.sh` before completing implementation work.
- Keep changes small and reviewable.
""",
            compat="claude",
        ),
        FileSpec(
            "README.md",
            """# {{PROJECT_NAME}}

{{PROJECT_NAME}} is a Codex-friendly project scaffold for {{ROLE}}.

## Start Here

1. Read `AGENTS.md` for agent-facing working agreements.
2. Read `docs/INDEX.md` for the project knowledge map.
3. Capture durable facts in `.codex/memory/project.md`.
4. Track work in `tasks/active.md` and `tasks/backlog.md`.

## Common Commands

```bash
scripts/bootstrap.sh
scripts/check.sh
```

## Structure

- `docs/` contains human-readable project knowledge.
- `.codex/` contains Codex configuration, memory, hooks examples, rules examples, skills, and custom agents.
- `.agents/skills/` contains repo-scoped skills.
- `prompts/`, `templates/`, `snippets/`, and `tasks/` keep repeatable work explicit.
""",
        ),
        FileSpec(
            "CHANGELOG.md",
            """# Changelog

All notable changes to this project should be documented here.

## Unreleased

- Initialized Codex-friendly project scaffold.
""",
        ),
        FileSpec(
            "LICENSE",
            """Copyright (c) {{PROJECT_NAME}}

All rights reserved unless a project owner replaces this placeholder with an explicit license.
""",
        ),
        FileSpec(
            ".gitignore",
            """.DS_Store
.env
.env.*
!.env.example
node_modules/
dist/
build/
coverage/
.pytest_cache/
.ruff_cache/
.mypy_cache/
__pycache__/
*.py[cod]
.venv/
venv/
.idea/
.vscode/
*.log
tmp/
temp/
""",
        ),
        FileSpec(
            ".gitattributes",
            """* text=auto
*.sh text eol=lf
*.py text eol=lf
*.md text eol=lf
""",
        ),
        FileSpec(
            ".editorconfig",
            """root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.py]
indent_size = 4
""",
        ),
        FileSpec(
            ".env.example",
            """# Copy to .env for local-only settings.
# Never commit secrets.
PROJECT_NAME={{PROJECT_SLUG}}
""",
        ),
        # ─── Compatibility files ───
        FileSpec(
            ".cursorrules",
            """# {{PROJECT_NAME}} — Cursor Rules
# This file references AGENTS.md as the single source of truth.
# Read AGENTS.md for all project conventions.

Read and follow the instructions in AGENTS.md at the project root.
Key points:
- Run scripts/check.sh before completing work.
- Keep changes small and reviewable.
- Do not modify files outside the task scope.
""",
            compat="cursor",
        ),
        FileSpec(
            ".github/copilot-instructions.md",
            """# {{PROJECT_NAME}} — GitHub Copilot Instructions

Read and follow `AGENTS.md` at the project root for all conventions.

Key points:
- Prefer small, reviewable edits.
- Run `scripts/check.sh` before delivery.
- Do not read `.env` or credentials files.
- Update `CHANGELOG.md` for user-visible changes.
""",
            compat="copilot",
        ),
        # ─── docs/ ───
        FileSpec(
            "docs/INDEX.md",
            """# Documentation Index

- `architecture.md`: system shape, constraints, and boundaries.
- `context-engineering.md`: how project context is stored and updated.
- `onboarding.md`: first-run setup for humans and agents.
- `operations.md`: routine commands, release steps, and troubleshooting.
- `decisions/`: architecture decision records.
""",
            knowledge_agent,
        ),
        FileSpec(
            "docs/architecture.md",
            """# Architecture

## Purpose

{{PROJECT_NAME}} supports {{ROLE}}.

## Boundaries

- In scope:
- Out of scope:

## Components

Describe the main project components here.

## Constraints

- Keep agent instructions concise and file-local.
- Prefer deterministic scripts for repeatable actions.
- Each file should stay under 4KB to avoid context pollution.
""",
            knowledge_agent,
        ),
        FileSpec(
            "docs/context-engineering.md",
            """# Context Engineering

## Context Layers

| Layer | Strategy | Files |
| --- | --- | --- |
| Always-loaded | Short, auto-read every session (< 2KB) | `AGENTS.md` |
| On-demand | Progressive disclosure, agent searches | `docs/`, `prompts/`, `templates/` |
| Offloaded | Written to filesystem, frees context | `tasks/`, `.codex/memory/daily/` |

## Update Policy

- Update memory when a fact should survive future sessions.
- Update docs when a human needs durable explanation.
- Update prompts or templates when a workflow repeats.
- Promote daily notes to `project.md` or `decisions.md` when they become stable facts.

## Size Limits

- `AGENTS.md`: < 2KB (Codex merges up to 32KB total, keep room for subdirectory overrides).
- Individual doc files: < 4KB recommended.
- `.codex/memory/project.md`: < 2KB of stable facts.
""",
            knowledge_agent,
        ),
        FileSpec(
            "docs/onboarding.md",
            """# Onboarding

## First Run

```bash
scripts/bootstrap.sh
scripts/check.sh
```

## For Codex

1. Read `AGENTS.md`.
2. Read `.codex/memory/project.md`.
3. Inspect `tasks/active.md`.
4. Run targeted checks before delivery.
""",
            knowledge_agent,
        ),
        FileSpec(
            "docs/operations.md",
            """# Operations

## Routine Checks

Use `scripts/check.sh`.

## Release Notes

Record user-visible changes in `CHANGELOG.md`.

## Troubleshooting

Capture repeated failures and fixes in `.codex/memory/lessons.md`.
""",
            knowledge_agent,
        ),
        FileSpec(
            "docs/decisions/0001-record-architecture-decisions.md",
            """# ADR 0001: Record Architecture Decisions

## Status

Accepted

## Context

Agentic projects need durable rationale so future sessions do not rediscover the same decisions.

## Decision

Store architecture decisions under `docs/decisions/` and summarize durable facts in `.codex/memory/decisions.md`.

## Consequences

- Important decisions remain reviewable.
- Agents can quickly recover project intent in later sessions.
""",
            knowledge_agent,
        ),
        # ─── .codex/ ───
        FileSpec(
            ".codex/config.toml",
            """# Project-local Codex configuration.
# Keep this conservative. Project-local hooks and rules require trust.

[agents]
max_threads = 6
max_depth = 2

[sandbox]
mode = "network-off"  # Options: network-off, read-only, full

[model]
default = "o4-mini"
reasoning = "high"

# Uncomment only after reviewing hook commands.
# [features]
# hooks = true
""",
            agent_only,
        ),
        FileSpec(
            ".codex/hooks.example.json",
            """{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \\"$(git rev-parse --show-toplevel)/.codex/hooks/session_start.py\\"",
            "timeout": 10,
            "statusMessage": "Loading project context"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \\"$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_audit.py\\"",
            "timeout": 5,
            "statusMessage": "Auditing tool use"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \\"$(git rev-parse --show-toplevel)/.codex/hooks/stop_summary.py\\"",
            "timeout": 10,
            "statusMessage": "Checking session handoff"
          }
        ]
      }
    ]
  }
}
""",
            agent_only,
        ),
        FileSpec(
            ".codex/mcp.json",
            """{
  "mcpServers": {
    "example-server": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}
""",
            agent_only,
        ),
        # ─── .codex/memory/ ───
        FileSpec(
            ".codex/memory/README.md",
            """# Project Memory

Use this folder for durable project continuity.

- `project.md`: stable facts and constraints (< 2KB).
- `decisions.md`: decision summaries.
- `lessons.md`: recurring pitfalls and fixes (knowledge flywheel).
- `daily/`: date-based notes when useful.

Do not store secrets here.
""",
            knowledge_agent,
        ),
        FileSpec(
            ".codex/memory/project.md",
            """# Project Memory: {{PROJECT_NAME}}

## Role

{{ROLE}}

## Stable Facts

- Project slug: `{{PROJECT_SLUG}}`

## Preferences

- Keep generated instructions concise (< 2KB per file).
- Prefer reusable scripts for repeatable checks.

## Open Questions

- What validation commands should `scripts/check.sh` run?
- Which custom agents should be enabled for this project?
""",
            knowledge_agent,
        ),
        FileSpec(
            ".codex/memory/decisions.md",
            """# Decisions

Record decisions that should survive future sessions.

| Date | Decision | Rationale |
| --- | --- | --- |
| TBD | Use Codex-friendly scaffold | Keep context, tasks, prompts, and automation explicit. |
""",
            knowledge_agent,
        ),
        FileSpec(
            ".codex/memory/lessons.md",
            """# Lessons

Record recurring mistakes, fixes, and workflow improvements.
This is the knowledge flywheel: Mistake → Pattern → Rule → Never repeat.

| Date | Lesson | Action Taken |
| --- | --- | --- |
""",
            knowledge_agent,
        ),
        FileSpec(".codex/memory/daily/.gitkeep", "", knowledge_agent),
        # ─── .codex/agents/ ───
        FileSpec(
            ".codex/agents/explorer.toml",
            '''name = "project_explorer"
description = "Read-only explorer that maps project structure, evidence, and relevant files before implementation."
sandbox_mode = "read-only"
developer_instructions = """
Stay in exploration mode.
Use fast search and targeted file reads.
Return concise findings with file paths, symbols, and uncertainty.
Do not modify files.
"""
''',
            agent_only,
        ),
        FileSpec(
            ".codex/agents/implementer.toml",
            '''name = "project_implementer"
description = "Implementation-focused worker for scoped changes after requirements and affected files are clear."
developer_instructions = """
Make focused, minimal changes.
Follow AGENTS.md and file-local conventions.
Run or recommend targeted checks.
Report changed files and verification results.
"""
''',
            agent_only,
        ),
        FileSpec(
            ".codex/agents/reviewer.toml",
            '''name = "project_reviewer"
description = "Reviewer focused on correctness, security, regressions, and missing tests."
sandbox_mode = "read-only"
developer_instructions = """
Review like an owner.
Lead with concrete findings ordered by severity (P0 > P1 > P2 > P3).
Cite file paths and line numbers.
Avoid style-only comments unless they hide real risk.
Do not modify files.
"""
''',
            agent_only,
        ),
        FileSpec(
            ".codex/agents/docs-researcher.toml",
            '''name = "docs_researcher"
description = "Documentation and source-verification specialist for APIs, frameworks, and project docs."
sandbox_mode = "read-only"
developer_instructions = """
Verify claims against primary sources or project documentation.
Return concise answers with links, file references, or exact source locations.
State clearly when a claim is an inference.
Do not modify files.
"""
''',
            agent_only,
        ),
        FileSpec(
            ".codex/agents/test-writer.toml",
            '''name = "test_writer"
description = "Test specialist that writes unit tests, integration tests, and edge-case coverage."
developer_instructions = """
Write tests that verify behavior, not implementation details.
Cover happy path, edge cases, and error conditions.
Follow existing test patterns and conventions in the project.
Use descriptive test names that explain the scenario.
Run tests after writing to confirm they pass.
"""
''',
            agent_only,
        ),
        # ─── .codex/hooks/ ───
        FileSpec(
            ".codex/hooks/README.md",
            """# Hook Examples

These scripts are examples. They are inactive until you copy `.codex/hooks.example.json` to `.codex/hooks.json`, review every command, and trust the hooks through Codex.

Hooks receive JSON on stdin and should emit JSON on stdout when they need to influence Codex.

## Available Hooks

- `session_start.py`: Loads project memory on session start.
- `stop_summary.py`: Generates handoff summary on session stop.
- `pre_tool_use_policy.py`: Blocks dangerous commands before execution.
- `post_tool_use_audit.py`: Logs tool usage for observability.
""",
            agent_only,
        ),
        FileSpec(
            ".codex/hooks/session_start.py",
            """#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    payload = json.load(sys.stdin)
    cwd = Path(payload.get("cwd") or ".")
    memory = cwd / ".codex" / "memory" / "project.md"
    if memory.exists():
        print(json.dumps({"systemMessage": f"Project memory is available at {memory}."}))
    else:
        print(json.dumps({"continue": True, "suppressOutput": True}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
""",
            agent_only,
            executable=True,
        ),
        FileSpec(
            ".codex/hooks/stop_summary.py",
            """#!/usr/bin/env python3
import json
import sys


def main() -> int:
    json.load(sys.stdin)
    print(json.dumps({"continue": True, "suppressOutput": True}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
""",
            agent_only,
            executable=True,
        ),
        FileSpec(
            ".codex/hooks/pre_tool_use_policy.py",
            """#!/usr/bin/env python3
import json
import sys


BLOCKED_FRAGMENTS = ("rm -rf /", "git reset --hard", "git push --force")


def main() -> int:
    payload = json.load(sys.stdin)
    command = str(payload.get("tool_input", {}).get("cmd", ""))
    if any(fragment in command for fragment in BLOCKED_FRAGMENTS):
        print(json.dumps({"continue": False, "stopReason": "Blocked dangerous command pattern."}))
        return 0
    print(json.dumps({"continue": True, "suppressOutput": True}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
""",
            agent_only,
            executable=True,
        ),
        FileSpec(
            ".codex/hooks/post_tool_use_audit.py",
            """#!/usr/bin/env python3
\"\"\"Audit hook: logs tool usage for observability.\"\"\"
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    payload = json.load(sys.stdin)
    cwd = Path(payload.get("cwd") or ".")
    log_dir = cwd / ".codex" / "memory" / "daily"
    log_dir.mkdir(parents=True, exist_ok=True)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    log_file = log_dir / f"{today}-audit.log"

    tool_name = payload.get("tool_name", "unknown")
    timestamp = datetime.now(timezone.utc).isoformat()

    with log_file.open("a", encoding="utf-8") as f:
        f.write(f"{timestamp} | tool={tool_name}\\n")

    print(json.dumps({"continue": True, "suppressOutput": True}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
""",
            agent_only,
            executable=True,
        ),
        # ─── .codex/rules/ ───
        FileSpec(
            ".codex/rules/README.md",
            """# Rules

Rules control which commands Codex can run outside the sandbox.
They are hard constraints (can/cannot do), unlike AGENTS.md which is soft guidance (should do).

The files in `templates/` are examples. Copy one to `.codex/rules/default.rules` only after reviewing every prefix.
""",
            agent_only,
        ),
        FileSpec(
            ".codex/rules/templates/default.rules.example",
            '''# Example only. Rename to .codex/rules/default.rules after review.

prefix_rule(
    pattern = ["git", "status"],
    decision = "allow",
    justification = "Inspecting Git status is safe and useful.",
    match = ["git status", "git status --short"],
)

prefix_rule(
    pattern = ["git", "diff"],
    decision = "allow",
    justification = "Viewing diffs is read-only and safe.",
    match = ["git diff", "git diff --cached"],
)

prefix_rule(
    pattern = ["rm"],
    decision = "prompt",
    justification = "Deletion should be reviewed before running outside the sandbox.",
    match = ["rm file.txt"],
)

prefix_rule(
    pattern = ["rm", "-rf"],
    decision = "deny",
    justification = "Recursive forced deletion is too dangerous.",
    match = ["rm -rf /"],
)
''',
            agent_only,
        ),
        # ─── .codex/skills/ ───
        FileSpec(
            ".codex/skills/README.md",
            """# Codex Skills

Reusable skill templates in YAML format. These are Codex-native skills that can be invoked during sessions.

Each skill defines a repeatable workflow with clear inputs, steps, and expected outputs.
""",
            agent_only,
        ),
        FileSpec(
            ".codex/skills/add-test.yaml",
            """name: add-test
description: Generate unit tests for a given file or function.
inputs:
  - name: target_file
    description: The file to generate tests for.
  - name: focus
    description: Optional specific function or class to focus on.
steps:
  - Read the target file and understand its public API.
  - Identify existing test patterns in the project.
  - Write tests covering happy path, edge cases, and error conditions.
  - Run tests to confirm they pass.
output: Test file created and passing.
""",
            agent_only,
        ),
        FileSpec(
            ".codex/skills/refactor.yaml",
            """name: refactor
description: Refactor code for clarity, performance, or maintainability.
inputs:
  - name: target_file
    description: The file or module to refactor.
  - name: goal
    description: What the refactoring should achieve.
steps:
  - Read the target code and understand current behavior.
  - Identify the refactoring opportunity.
  - Make minimal, behavior-preserving changes.
  - Run existing tests to confirm no regressions.
  - Update documentation if public API changed.
output: Refactored code with passing tests.
""",
            agent_only,
        ),
        FileSpec(
            ".codex/skills/fix-bug.yaml",
            """name: fix-bug
description: Diagnose and fix a reported bug.
inputs:
  - name: description
    description: Bug description or error message.
  - name: reproduction
    description: Steps to reproduce (if known).
steps:
  - Reproduce the bug or locate the failing code path.
  - Identify root cause.
  - Implement minimal fix.
  - Add or update test to prevent regression.
  - Run full check suite.
output: Bug fixed with regression test added.
""",
            agent_only,
        ),
        # ─── .agents/skills/ ───
        FileSpec(
            ".agents/skills/project-context/SKILL.md",
            """---
name: project-context
description: Use for work inside {{PROJECT_NAME}} when Codex needs project-specific context, role boundaries, memory conventions, task workflow, or repository navigation guidance.
---

# Project Context

Read these files before substantial work:

1. `AGENTS.md`
2. `.codex/memory/project.md`
3. `docs/INDEX.md`
4. `tasks/active.md`

Follow the project role: {{ROLE}}.

Keep durable findings in `.codex/memory` or `docs`, and keep task progress in `tasks`.
""",
            agent_only,
        ),
        FileSpec(
            ".agents/skills/project-context/references/project-map.md",
            """# Project Map

See root `AGENTS.md` and `docs/INDEX.md` for the current map. Update this file when the repo develops domain-specific structure that the local skill should remember.
""",
            agent_only,
        ),
        # ─── tasks/ ───
        FileSpec(
            "tasks/README.md",
            """# Tasks

- `active.md`: current work.
- `backlog.md`: candidate work.
- `done.md`: completed work.
- `task-template.md`: reusable task shape.
""",
            all_profiles,
        ),
        FileSpec(
            "tasks/active.md",
            """# Active Tasks

No active tasks yet.
""",
            all_profiles,
        ),
        FileSpec(
            "tasks/backlog.md",
            """# Backlog

- Customize `AGENTS.md`.
- Fill in `.codex/memory/project.md`.
- Replace placeholder checks in `scripts/check.sh`.
- Configure `.codex/mcp.json` with actual MCP servers.
""",
            all_profiles,
        ),
        FileSpec(
            "tasks/done.md",
            """# Done

- Initialized project scaffold.
""",
            all_profiles,
        ),
        FileSpec(
            "tasks/task-template.md",
            """# Task: <title>

## Goal

## Context

## Constraints

## Plan

## Verification

## Handoff
""",
            all_profiles,
        ),
        # ─── prompts/ ───
        FileSpec(
            "prompts/README.md",
            """# Prompts

Reusable prompts for Codex or related agents. Keep prompts concrete, scoped, and easy to adapt.
""",
            knowledge_agent,
        ),
        FileSpec(
            "prompts/implementation-plan.md",
            """# Implementation Plan Prompt

Read `AGENTS.md`, `.codex/memory/project.md`, and the relevant files. Produce a scoped implementation plan with affected files, risks, and verification commands. Do not edit files until the plan is clear.
""",
            knowledge_agent,
        ),
        FileSpec(
            "prompts/code-review.md",
            """# Code Review Prompt

Review this branch for correctness, security, regressions, and missing tests. Lead with findings ordered by severity and cite file paths and line numbers.
""",
            code_agent,
        ),
        FileSpec(
            "prompts/research.md",
            """# Research Prompt

Research the question using primary sources where possible. Distinguish sourced facts from inferences. Summarize recommendations and cite links or project files.
""",
            knowledge_agent,
        ),
        FileSpec(
            "prompts/handoff.md",
            """# Handoff Prompt

Summarize what changed, what was verified, what remains uncertain, and the next concrete step. Update `tasks/active.md` or `.codex/memory` if the information should persist.
""",
            knowledge_agent,
        ),
        FileSpec(
            "prompts/debug.md",
            """# Debug Prompt

Diagnose the issue systematically:
1. Reproduce the problem or identify the failing code path.
2. Form a hypothesis about root cause.
3. Verify the hypothesis with targeted reads or tests.
4. Implement minimal fix.
5. Confirm fix resolves the issue without regressions.

Report: root cause, fix applied, verification result, and any remaining risk.
""",
            code_agent,
        ),
        # ─── templates/ ───
        FileSpec(
            "templates/README.md",
            """# Templates

Reusable structures for documents, PRs, handoffs, ADRs, bug reports, and feature specs.
""",
            knowledge_agent,
        ),
        FileSpec(
            "templates/adr.md",
            """# ADR NNNN: <decision>

## Status

Proposed

## Context

## Decision

## Consequences
""",
            knowledge_agent,
        ),
        FileSpec(
            "templates/feature-spec.md",
            """# Feature Spec: <name>

## Problem

## Goals

## Non-Goals

## Proposed Solution

## User Flows

## Technical Notes

## Risks

## Verification
""",
            knowledge_agent,
        ),
        FileSpec(
            "templates/pr-description.md",
            """## Summary

## Verification

## Risks

## Notes
""",
            code_agent,
        ),
        FileSpec(
            "templates/bugfix-template.md",
            """# Bug Fix: <title>

## Symptom

## Root Cause

## Fix

## Verification

## Regression Prevention
""",
            code_agent,
        ),
        FileSpec(
            "templates/handoff.md",
            """# Handoff

## Current State

## Completed

## Verification

## Open Issues

## Next Step
""",
            knowledge_agent,
        ),
        # ─── snippets/ ───
        FileSpec(
            "snippets/README.md",
            """# Snippets

Reusable code and command fragments for quick reference.

- `code-snippets.md`: common code patterns used in this project.
- `command-snippets.md`: frequently used shell commands.
""",
            code_agent,
        ),
        FileSpec(
            "snippets/code-snippets.md",
            """# Code Snippets

Add frequently used code patterns here for quick reference.

## Example

```typescript
// TODO: Add project-specific code snippets
```
""",
            code_agent,
        ),
        FileSpec(
            "snippets/command-snippets.md",
            """# Command Snippets

Frequently used shell commands for this project.

## Development

```bash
# Start development server
# TODO: Add project-specific commands

# Run tests
scripts/check.sh
```

## Git

```bash
# Create feature branch
git checkout -b feature/<name>

# Sync with main
git fetch origin && git rebase origin/main
```
""",
            code_agent,
        ),
        # ─── scripts/ ───
        FileSpec(
            "scripts/README.md",
            """# Scripts

Scripts should be deterministic and safe to run locally.

- `bootstrap.sh`: install or prepare local prerequisites.
- `check.sh`: run project verification (lint, test, typecheck).
- `new-task.sh`: create a task file from the template.
- `sync.sh`: sync or update project state.
""",
            code_agent,
        ),
        FileSpec(
            "scripts/bootstrap.sh",
            """#!/usr/bin/env sh
set -eu

echo "Bootstrap placeholder for {{PROJECT_NAME}}."
echo "Add dependency installation or environment checks here."
""",
            code_agent,
            executable=True,
        ),
        FileSpec(
            "scripts/check.sh",
            get_check_script_content(tech_stack, "{{PROJECT_NAME}}"),
            code_agent,
            executable=True,
        ),
        FileSpec(
            "scripts/new-task.sh",
            """#!/usr/bin/env sh
set -eu

title="${1:-new-task}"
slug=$(printf "%s" "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/^-//; s/-$//')
file="tasks/${slug:-new-task}.md"

if [ -e "$file" ]; then
  echo "Task already exists: $file" >&2
  exit 1
fi

cp tasks/task-template.md "$file"
echo "Created $file"
""",
            code_agent,
            executable=True,
        ),
        FileSpec(
            "scripts/sync.sh",
            """#!/usr/bin/env sh
set -eu

echo "Sync placeholder for {{PROJECT_NAME}}."
echo "Add commands to sync state, pull updates, or refresh dependencies here."
""",
            code_agent,
            executable=True,
        ),
        # ─── .github/ ───
        FileSpec(
            ".github/pull_request_template.md",
            """## Summary

## Verification

## Risk

## Checklist

- [ ] Updated docs or memory when behavior/context changed.
- [ ] Updated `CHANGELOG.md` for user-visible changes.
- [ ] Ran `scripts/check.sh` successfully.
""",
            code_only,
        ),
        FileSpec(
            ".github/workflows/ci.yml",
            """name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run checks
        run: scripts/check.sh
""",
            code_only,
        ),
    ]


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target_dir", help="Directory to create or update.")
    parser.add_argument("--project-name", help="Human-readable project name.")
    parser.add_argument("--role", default="general-purpose Codex-friendly engineering workspace")
    parser.add_argument("--profile", choices=sorted(PROFILES), default="full")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files.")
    parser.add_argument("--dry-run", action="store_true", help="Preview writes without changing files.")
    parser.add_argument("--init-git", action="store_true", help="Run git init in the target directory.")
    parser.add_argument(
        "--compat",
        action="append",
        choices=sorted(COMPAT_OPTIONS),
        default=[],
        help="Generate compatibility files for other AI tools (claude, cursor, copilot, all).",
    )
    parser.add_argument(
        "--tech-stack",
        choices=sorted(TECH_STACKS),
        default="",
        help="Pre-fill scripts/check.sh with commands for this tech stack.",
    )
    parser.add_argument(
        "--monorepo",
        action="store_true",
        help="Generate monorepo structure with apps/ directory and per-app AGENTS.md templates.",
    )
    return parser.parse_args(argv)


def resolve_compat(compat_list: list[str]) -> set[str]:
    """Resolve compat flags, expanding 'all' to all options."""
    if "all" in compat_list:
        return {"claude", "cursor", "copilot"}
    return set(compat_list)


def write_file(path: Path, content: str, executable: bool, force: bool, dry_run: bool) -> str:
    existed = path.exists()
    if path.exists() and not force:
        return "skipped"
    if dry_run:
        return "would-create" if not existed else "would-overwrite"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    if executable:
        path.chmod(path.stat().st_mode | 0o111)
    return "written" if existed else "created"


def init_git(target: Path, dry_run: bool) -> str:
    if (target / ".git").exists():
        return "git already initialized"
    if dry_run:
        return "would run git init"
    if shutil.which("git") is None:
        return "git not found; skipped git init"
    subprocess.run(["git", "init"], cwd=target, check=True)
    return "git initialized"


def generate_monorepo_files(target: Path, project_name: str, force: bool, dry_run: bool) -> dict[str, int]:
    """Generate monorepo-specific files."""
    counts: dict[str, int] = {}

    apps_readme = target / "apps" / "README.md"
    content = f"""# Apps

This directory contains application repositories for {project_name}.

Each subdirectory is an independent application with its own `AGENTS.md` for app-specific instructions.

## Adding a New App

```bash
cd apps/
git clone <repo-url> <app-name>
```

Then create an `apps/<app-name>/AGENTS.md` with app-specific build commands and conventions.
"""
    status = write_file(apps_readme, content, False, force, dry_run)
    counts[status] = counts.get(status, 0) + 1
    print(f"{status}: apps/README.md")

    app_agents_template = target / "apps" / "AGENTS.md.template"
    template_content = """# <App Name> Agent Instructions

## Build Commands

```bash
# Install dependencies
# TODO: fill in

# Run development server
# TODO: fill in

# Run tests
# TODO: fill in
```

## Coding Standards

Follow root `AGENTS.md` plus these app-specific conventions:
- TODO: Add app-specific standards

## Notes

This file overrides root AGENTS.md for work within this app directory.
"""
    status = write_file(app_agents_template, template_content, False, force, dry_run)
    counts[status] = counts.get(status, 0) + 1
    print(f"{status}: apps/AGENTS.md.template")

    return counts


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    target = Path(args.target_dir).expanduser().resolve()
    project_name = args.project_name or target.name
    project_slug = slugify(project_name)
    compat_set = resolve_compat(args.compat)

    if not args.dry_run:
        target.mkdir(parents=True, exist_ok=True)

    counts: dict[str, int] = {}
    for spec in files(tech_stack=args.tech_stack):
        if args.profile not in spec.profiles:
            continue
        # Skip compat files unless the corresponding flag is set
        if spec.compat and spec.compat not in compat_set:
            continue
        rendered = render(spec.content, project_name, project_slug, args.role)
        status = write_file(target / spec.path, rendered, spec.executable, args.force, args.dry_run)
        counts[status] = counts.get(status, 0) + 1
        print(f"{status}: {spec.path}")

    # Generate monorepo files if requested
    if args.monorepo:
        mono_counts = generate_monorepo_files(target, project_name, args.force, args.dry_run)
        for key, value in mono_counts.items():
            counts[key] = counts.get(key, 0) + value

    if args.init_git:
        print(init_git(target, args.dry_run))

    print("summary:", ", ".join(f"{key}={value}" for key, value in sorted(counts.items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
