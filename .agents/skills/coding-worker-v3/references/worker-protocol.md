# Coding Worker V3 Protocol

Use this reference when the task needs the full execution contract rather than the condensed workflow in `SKILL.md`.

## Operating Model

- Treat every session as stateless and reentrant.
- Reconstruct state from:
  - `docs/exec-plans/feature-list.json`
  - `docs/exec-plans/progress.txt`
  - Git history and working tree state
- Finish one minimal unit of work, checkpoint it physically, then exit cleanly.

## Core Rules

1. Advance exactly one task from `pending` or `failed` to a terminal state in one session.
2. Write only the code required to complete the current task.
3. Stay inside `metadata.files_affected` unless the repo state proves another file is required.
4. Ask clarifying questions before coding when the task contract is ambiguous.
5. Trust verification commands and tests over intuition.
6. Stop after three logic retries on the same issue.

## Phase 1: Stateless Start

### 1. Restore state

Read:

```bash
cat docs/exec-plans/feature-list.json
cat docs/exec-plans/progress.txt
git log --oneline -5
git status
ls docs/exec-plans/active/
```

Also read the selected task's `plan_path` when present.

### 2. Self-check environment

- Run the repo bootstrap or health check command required by the project prompt.
- If environment setup fails, stop and record the issue. Do not attempt speculative repair.

### 3. Lock the only target

- Choose the first task with status `pending` or `failed`.
- If it is `failed`, read its prior dead-end notes first.
- Print the chosen task ID and the full task payload before coding.

### 4. Read known traps

- Inspect task-specific notes in `docs/exec-plans/progress.txt`.
- Inspect `docs/caveats.md` when present.

### 5. Gate on ambiguity

Pause and ask the user when any of these are unclear:

- API or schema contract
- acceptance criteria
- verification command
- allowed file scope

### 6. Load applicable standards

- If the task declares explicit coding-standard references, read those exact files first.
- Otherwise infer the standards from task type:
  - backend: coding style + stability/security rules
  - frontend: TypeScript + framework rules
  - full-stack: both sets
- If a standards file is missing, state that you are falling back to the repo's local rules.

### 7. Load context in order

Stop loading once you have enough information:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `docs/caveats.md`
4. current task contract
5. task `plan.md`
6. only then the source files listed in `metadata.files_affected`

## Phase 2: Atomic Execution

### 1. Mark progress

- Set the chosen task to `in_progress` immediately when the repo workflow expects it.
- Commit that state first if the workflow requires crash-safe checkpoints.

### 2. Check architecture constraints before coding

Reject work that introduces:

- cross-layer calls that violate project boundaries
- module-to-module direct calls that should go through an API or event boundary
- identifier misuse across layers
- deprecated architecture patterns
- any other project-specific red lines from `ARCHITECTURE.md`

### 3. Declare scope

Before editing, state:

- files you will modify
- files you will not touch
- the verification command that defines done

### 4. Prefer TDD when the task includes tests

- Start from a failing test when practical.

### 5. Implement the minimal fix

During implementation, self-check for common violations:

- empty `catch` blocks
- hardcoded credentials, URLs, or IPs
- oversized functions
- `any` in TypeScript tasks
- broken React hook dependencies
- incorrect method naming
- invalid transaction boundaries

### 6. Run verification

- Execute the task's required verification command.
- Preserve the actual result, not just a summary.

## Phase 3: Falsification Gate

Only move on when verification passes and the work survives active attempts to break it.

### 1. Probe edge cases

Check the relevant subset of:

- null, empty, or zero inputs
- out-of-range requests
- concurrent writes
- missing external dependencies

For each case, record either `validated` with the outcome or `not applicable` with a reason.

### 2. Run a reverse assertion

Execute at least one case that should fail but could accidentally pass.

Record:

- counterexample scenario
- expected result
- actual result
- conclusion

### 3. Reconfirm scope and architecture

Ensure you did not quietly introduce:

- cross-layer violations
- undeclared file changes
- new hardcoded configuration
- new `any` usage in frontend work

If any appear, fix them and rerun verification.

## Phase 4: Dead-End Handling

### Logic error

- Allow at most three retries.
- Before each retry, state the failure reason and the next change direction.

### Environment or dependency error

- Stop immediately.
- Record the issue in `progress.txt`.
- Ask for human repair instead of masking the problem.

### Requirement ambiguity

- Stop immediately.
- Mark the task `blocked` instead of `failed`.
- Record the ambiguity in the dead-end log.

### Retry exhaustion

After three logic retries:

1. mark the task `failed`
2. write a short postmortem in `progress.txt`
3. commit the failure checkpoint if the workflow expects it
4. end the session

## Phase 5: Checkpoint and Exit

When the task passes verification and falsification:

1. mark it `completed`
2. fill `completed_at` if the task schema expects it
3. update session log and dead-end notes
4. update `AGENTS.md` only if the task introduced a real new module, rule, or trap
5. create the final checkpoint commit if the repo workflow requires it
6. stop without starting the next task

## Initialization Prompt

When this skill is invoked as the active worker, begin directly with Phase 1 and report:

- what files were inspected
- which task ID was selected
- what ambiguity or blockers were found before coding
