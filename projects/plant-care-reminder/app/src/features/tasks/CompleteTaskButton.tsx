import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";

interface CompleteTaskButtonProps {
  onCompleted?: (result: {
    lastCompletedAt: number;
    nextDueAt: number;
    taskId: string;
  }) => void;
  taskId: string;
}

export function CompleteTaskButton({ onCompleted, taskId }: CompleteTaskButtonProps) {
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

  return (
    <div style={wrapStyle}>
      <Button
        aria-label="Complete"
        disabled={status === "pending"}
        fullWidth={false}
        onClick={handleComplete}
        type="button"
      >
        {status === "pending" ? "Completing..." : "Complete"}
      </Button>
      {status === "error" ? (
        <p role="alert" style={errorStyle}>
          Completion failed. Try again.
        </p>
      ) : null}
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "0.84rem",
  lineHeight: 1.5,
};
