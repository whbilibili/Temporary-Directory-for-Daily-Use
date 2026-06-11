---
name: coding-worker-v3
description: "Execute one bounded coding task from repo state with a stateless, crash-safe workflow. Use when the user wants Codex to behave like an initializer-worker coding executor: inspect `docs/exec-plans/feature-list.json`, `docs/exec-plans/progress.txt`, and Git state; lock the next pending or failed task; modify only declared files; run the task's verification command; record progress or dead ends on disk; commit checkpoints; and exit after completing exactly one task."
---

# Coding Worker V3

Use this skill to execute the next smallest implementation task from a repo that stores its execution plan on disk. Treat every run as a fresh cold start. Reconstruct state from files and Git, not memory.

## Workflow

1. Read the repo's execution sources before touching code:
   - `docs/exec-plans/feature-list.json`
   - `docs/exec-plans/progress.txt`
   - recent Git history and current Git status
   - `docs/exec-plans/active/*/plan.md` when the selected task points to one
   - `AGENTS.md`, `ARCHITECTURE.md`, and `docs/caveats.md` when present
2. Run the repo environment bootstrap or health check required by the prompt before coding. If it fails because of environment problems, stop and record the issue instead of trying speculative repairs.
3. Select exactly one target task:
   - choose the first task whose status is `pending` or `failed`
   - if it is `failed`, read the prior failure notes before retrying
   - if the task is ambiguous, ask clarifying questions before coding
4. Mark that task `in_progress` as soon as work starts when the repo workflow expects it.
5. Modify only the files explicitly allowed by the task metadata unless the task itself proves that another file is necessary. If you must exceed scope, record why in progress tracking.
6. Implement the smallest change that makes the task's verification pass. Do not refactor adjacent code or prepare future tasks.
7. Run the required verification command from the task definition. Treat tests and verification output as the source of truth.
8. Perform a brief falsification pass on the completed work:
   - check edge cases the task contract implies
   - try at least one case that should fail
   - confirm you did not introduce hidden scope creep or architecture violations
9. Update the repo's execution artifacts:
   - mark the task `completed`, `failed`, or `blocked`
   - append progress or dead-end notes
   - include the next task handoff when the workflow expects it
10. Commit the checkpoint if the repo workflow calls for it, then stop. Do not begin another task in the same session.

## Guardrails

- Complete exactly one task per run.
- Prefer disk state over prior conversation state.
- Refuse speculative multi-task cleanup.
- Keep edits surgical and bounded to the declared file list.
- Stop after repeated logical failures instead of grinding indefinitely.
- Treat environment failures, dependency outages, and requirement ambiguity as stop conditions that must be recorded explicitly.
- Follow project architecture rules before and after coding, not only after tests pass.

## References

- Read [references/worker-protocol.md](references/worker-protocol.md) when you need the full phase-by-phase operating procedure, retry policy, falsification checklist, or checkpoint/commit templates derived from the original prompt.
