import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";

interface ArchivePlantActionProps {
  isArchived: boolean;
  onArchivedStateChange: (next: { archivedAt: number | null; isArchived: boolean }) => void;
  plantId: string;
  plantName: string;
}

export function ArchivePlantAction({
  isArchived,
  onArchivedStateChange,
  plantId,
  plantName,
}: ArchivePlantActionProps) {
  const setArchivedState = useMutation(api.plants.setPlantArchivedState);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intentLabel = isArchived ? "恢复植物" : "归档植物";
  const confirmTitle = isArchived ? "确认恢复这盆植物吗？" : "确认归档这盆植物吗？";
  const confirmCopy = isArchived
    ? `${plantName} 会重新回到家庭看板，养护任务和历史记录都会保留。`
    : `${plantName} 会从家庭看板隐藏，但养护任务和完成记录仍会保留在数据里。`;
  const confirmButtonLabel = isArchived ? "确认恢复" : "确认归档";

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await setArchivedState({
        plantId,
        isArchived: !isArchived,
      });

      onArchivedStateChange({
        isArchived: !isArchived,
        archivedAt: isArchived ? null : Date.now(),
      });
      setIsConfirming(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `暂时无法${isArchived ? "恢复" : "归档"}这盆植物，请稍后再试。`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div style={copyStyle}>
          <p style={eyebrowStyle}>植物状态</p>
          <h2 style={titleStyle}>{isArchived ? "已归档档案" : "使用中档案"}</h2>
          <p style={bodyStyle}>
            {isArchived
              ? "这盆植物已从家庭看板隐藏，恢复后才会重新出现。"
              : "归档会把植物从家庭看板移除，但养护历史会完整保留。"}
          </p>
        </div>
        <Button
          fullWidth={false}
          onClick={() => {
            setErrorMessage(null);
            setIsConfirming(true);
          }}
          style={isArchived ? undefined : archiveButtonStyle}
          type="button"
          variant={isArchived ? "secondary" : "ghost"}
        >
          {intentLabel}
        </Button>
      </div>

      {isConfirming ? (
        <div style={dialogStyle}>
          <div style={dialogCopyStyle}>
            <p style={dialogEyebrowStyle}>确认操作</p>
            <h3 style={dialogTitleStyle}>{confirmTitle}</h3>
            <p style={dialogBodyStyle}>{confirmCopy}</p>
          </div>
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
              onClick={() => void handleConfirm()}
              style={isArchived ? undefined : archiveButtonStyle}
              type="button"
              variant={isArchived ? "secondary" : "ghost"}
            >
              {isSubmitting ? "保存中…" : confirmButtonLabel}
            </Button>
          </div>
          <FormError message={errorMessage} />
        </div>
      ) : (
        <FormError message={errorMessage} />
      )}
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "20px 18px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "16px",
};

const headerStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const copyStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.75rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.25rem",
  lineHeight: 1.1,
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const dialogStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "linear-gradient(180deg, rgba(254,242,242,0.92), rgba(255,255,255,0.98))",
  border: "1px solid rgba(248,113,113,0.28)",
  display: "grid",
  gap: "14px",
};

const dialogCopyStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const dialogEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const dialogTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#7f1d1d",
  fontSize: "1.08rem",
  lineHeight: 1.2,
};

const dialogBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#7f1d1d",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};

const dialogActionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const archiveButtonStyle: React.CSSProperties = {
  color: "#b91c1c",
  borderColor: "#fca5a5",
  background: "rgba(254,242,242,0.92)",
};
