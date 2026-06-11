import { Button } from "../../components/ui/Button";
import { computePostponePreview } from "./scheduling";

const longDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
});

interface PostponeConfirmSheetProps {
  /** 任务当前的下次到期时间，用于本地推导逾期天数与预览日期。 */
  currentNextDueAt: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 推迟轻确认底部 sheet（PRD §8.2）。确认前透明告知「这次推迟意味着什么」，
 * 逾期/今日两种语境文案不同，语气温和不说教，告知文案用 --color-muted。
 */
export function PostponeConfirmSheet({
  currentNextDueAt,
  isSubmitting,
  onCancel,
  onConfirm,
}: PostponeConfirmSheetProps) {
  const preview = computePostponePreview(currentNextDueAt);
  const nextDateCopy = longDateFormatter.format(new Date(preview.nextDueAtPreview));
  const noticeCopy = preview.isOverdue
    ? `该任务已逾期 ${preview.overdueDays} 天，推迟后将从今天起顺延，下次提醒 ${nextDateCopy}`
    : `推迟后下次提醒将变为 ${nextDateCopy}`;

  return (
    <div
      aria-label="推迟确认"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      style={overlayStyle}
    >
      <div onClick={(event) => event.stopPropagation()} style={sheetStyle}>
        <p style={titleStyle}>推迟这项养护</p>
        <p style={noticeStyle}>{noticeCopy}</p>
        <div style={actionsStyle}>
          <Button
            disabled={isSubmitting}
            fullWidth={false}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            再想想
          </Button>
          <Button disabled={isSubmitting} fullWidth={false} onClick={onConfirm} type="button">
            {isSubmitting ? "推迟中..." : "推迟 1 天"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  // 高于底部导航 (50) 与撤销浮条 (60)，避免模态弹窗被遮挡。
  zIndex: 100,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  background: "rgba(31, 71, 61, 0.32)",
};

const sheetStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  background: "var(--color-surface)",
  borderTopLeftRadius: "var(--radius-card)",
  borderTopRightRadius: "var(--radius-card)",
  // 底部额外预留导航栏高度 + 安全区，避免按钮被底部导航压住。
  padding:
    "var(--space-lg) var(--space-lg) calc(var(--space-lg) + 72px + env(safe-area-inset-bottom, 0px))",
  display: "grid",
  gap: "var(--space-md)",
  boxShadow: "var(--shadow-card-emphasis)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--color-ink)",
};

const noticeStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-sm)",
};
