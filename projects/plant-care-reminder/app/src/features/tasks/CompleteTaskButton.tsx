import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/Button";
import { buildUndoPayload, type CompletionUndoPayload } from "./undoComplete";

interface CompleteTaskButtonProps {
  appearance?: "default" | "circle";
  onCompleted?: (result: {
    lastCompletedAt: number;
    nextDueAt: number;
    taskId: string;
    undo: CompletionUndoPayload;
  }) => void;
  taskId: string;
}

export function CompleteTaskButton({
  appearance = "default",
  onCompleted,
  taskId,
}: CompleteTaskButtonProps) {
  const completeTask = useMutation(api.tasks.completePlantTask);
  const [status, setStatus] = useState<"idle" | "pending" | "error" | "done">("idle");

  async function handleComplete() {
    setStatus("pending");

    try {
      const result = await completeTask({ taskId: taskId as Id<"plantTasks"> });
      setStatus("done");
      onCompleted?.({
        lastCompletedAt: result.lastCompletedAt,
        nextDueAt: result.nextDueAt,
        taskId: result.taskId,
        undo: buildUndoPayload(result),
      });
    } catch {
      setStatus("error");
    }
  }

  const isCircle = appearance === "circle";

  const isDone = status === "done";
  const isPending = status === "pending";

  return (
    <div style={isCircle ? circleWrapStyle : wrapStyle}>
      <Button
        aria-label="完成"
        disabled={isPending || isDone}
        fullWidth={false}
        onClick={handleComplete}
        style={isCircle ? (isDone ? circleButtonDoneStyle : circleButtonStyle) : (isDone ? doneButtonStyle : undefined)}
        type="button"
      >
        {isCircle ? (
          <span aria-hidden="true">{isPending ? "…" : "✓"}</span>
        ) : isDone ? (
          "已完成 ✓"
        ) : isPending ? (
          "完成中..."
        ) : (
          "完成"
        )}
      </Button>
      {status === "error" ? (
        <p role="alert" style={errorStyle}>
          完成失败，请重试。
        </p>
      ) : null}
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const circleWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
  justifyItems: "center",
};

const circleButtonStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  minHeight: "36px",
  padding: 0,
  borderRadius: "var(--radius-pill)",
  fontSize: "20px",
  lineHeight: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const circleButtonDoneStyle: React.CSSProperties = {
  ...circleButtonStyle,
  background: "var(--color-success)",
  color: "var(--color-surface)",
  borderColor: "var(--color-success)",
};

const doneButtonStyle: React.CSSProperties = {
  background: "var(--color-success)",
  color: "var(--color-surface)",
  borderColor: "var(--color-success)",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "0.84rem",
  lineHeight: 1.5,
};
