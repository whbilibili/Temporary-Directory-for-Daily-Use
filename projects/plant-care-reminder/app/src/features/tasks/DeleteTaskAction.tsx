import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";

interface DeleteTaskActionProps {
  onDeleted: () => void;
  taskId: string;
  taskLabel: string;
}

export function DeleteTaskAction({ onDeleted, taskId, taskLabel }: DeleteTaskActionProps) {
  const deletePlantTask = useMutation(api.tasks.deletePlantTask);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await deletePlantTask({ taskId });
      onDeleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "当前无法删除这条养护提醒，请稍后再试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <div style={copyStyle}>
        <p style={eyebrowStyle}>删除任务</p>
        <h2 style={titleStyle}>移除这条提醒</h2>
        <p style={bodyStyle}>
          删除后，这条 {taskLabel} 提醒会从当前植物上彻底移除。如果你只是想暂时隐藏它，建议改为停用。
        </p>
      </div>
      <Button
        fullWidth={false}
        onClick={() => {
          setErrorMessage(null);
          setIsConfirming(true);
        }}
        style={dangerButtonStyle}
        type="button"
        variant="ghost"
      >
        删除任务
      </Button>
      {isConfirming ? (
        <div style={dialogStyle}>
          <p style={dialogTitleStyle}>确认删除“{taskLabel}”吗？</p>
          <p style={dialogCopyStyle}>删除后，这条提醒会从这盆植物上彻底消失。</p>
          <div style={dialogActionsStyle}>
            <Button
              disabled={isSubmitting}
              fullWidth={false}
              onClick={() => setIsConfirming(false)}
              type="button"
              variant="ghost"
            >
              取消
            </Button>
            <Button
              disabled={isSubmitting}
              fullWidth={false}
              onClick={() => void handleDelete()}
              style={dangerButtonStyle}
              type="button"
              variant="ghost"
            >
              {isSubmitting ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </div>
      ) : null}
      <FormError message={errorMessage} />
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  borderRadius: "20px",
  padding: "18px",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
  display: "grid",
  gap: "14px",
};

const copyStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "1.08rem",
  lineHeight: 1.2,
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};

const dialogStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px",
  background: "var(--color-mist)",
  border: "1px solid var(--color-error)",
  display: "grid",
  gap: "12px",
};

const dialogTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "1rem",
  fontWeight: 700,
};

const dialogCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-error)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const dialogActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const dangerButtonStyle: React.CSSProperties = {
  color: "var(--color-error)",
  border: "1px solid var(--color-error)",
  background: "var(--color-mist)",
};
