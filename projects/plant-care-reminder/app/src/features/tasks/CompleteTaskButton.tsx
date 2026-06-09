import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";

interface CompleteTaskButtonProps {
  appearance?: "default" | "circle";
  onCompleted?: (result: {
    lastCompletedAt: number;
    nextDueAt: number;
    taskId: string;
  }) => void;
  taskId: string;
}

export function CompleteTaskButton({
  appearance = "default",
  onCompleted,
  taskId,
}: CompleteTaskButtonProps) {
  const completeTask = useMutation(api.tasks.completePlantTask);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  async function handleComplete() {
    setStatus("pending");

    try {
      const result = await completeTask({ taskId });
      setStatus("idle");
      onCompleted?.(result);
    } catch {
      setStatus("error");
    }
  }

  const isCircle = appearance === "circle";

  return (
    <div style={isCircle ? circleWrapStyle : wrapStyle}>
      <Button
        aria-label="完成"
        disabled={status === "pending"}
        fullWidth={false}
        onClick={handleComplete}
        style={isCircle ? circleButtonStyle : undefined}
        type="button"
      >
        {isCircle ? (
          <span aria-hidden="true">{status === "pending" ? "…" : "✓"}</span>
        ) : status === "pending" ? (
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

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "0.84rem",
  lineHeight: 1.5,
};
