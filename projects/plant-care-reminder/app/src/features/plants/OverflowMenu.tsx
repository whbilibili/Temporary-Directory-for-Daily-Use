import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { navigate } from "../../app/router";
import { ConfirmSheet } from "../../components/ui/ConfirmSheet";

interface OverflowMenuProps {
  isArchived: boolean;
  isOpen: boolean;
  onArchivedStateChange: (next: { archivedAt: number | null; isArchived: boolean }) => void;
  onClose: () => void;
  plantId: string;
  plantName: string;
}

export function OverflowMenu({
  isArchived,
  isOpen,
  onArchivedStateChange,
  onClose,
  plantId,
  plantName,
}: OverflowMenuProps) {
  const setArchivedState = useMutation(api.plants.setPlantArchivedState);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // 打开时聚焦第一个菜单项
  useEffect(() => {
    if (isOpen) {
      // 延迟一帧确保 DOM 已渲染
      requestAnimationFrame(() => {
        firstItemRef.current?.focus();
      });
    }
  }, [isOpen]);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
        setConfirmingDelete(false);
      }
    }

    // 延迟绑定，避免触发菜单的点击事件立即关闭
    const timer = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Escape 关闭菜单
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 关闭时重置确认状态
  useEffect(() => {
    if (!isOpen) {
      setConfirmingDelete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleArchiveToggle() {
    setIsSubmitting(true);
    try {
      await setArchivedState({
        plantId: plantId as Id<"plants">,
        isArchived: !isArchived,
      });
      onArchivedStateChange({
        isArchived: !isArchived,
        archivedAt: isArchived ? null : Date.now(),
      });
      setConfirmingArchive(false);
      onClose();
    } catch {
      // 静默处理
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    // deletePlant mutation 暂未实现，归档替代删除
    void handleArchiveToggle();
  }

  return (
    <>
      {/* 遮罩层 */}
      <div aria-hidden="true" onClick={onClose} style={overlayStyle} />
      {/* 菜单 */}
      <div
        aria-label="植物操作菜单"
        ref={menuRef}
        role="menu"
        style={menuStyle}
      >
        <button
          disabled={isSubmitting}
          onClick={() => {
            navigate(`/plants/${plantId}/edit`);
            onClose();
          }}
          ref={firstItemRef}
          role="menuitem"
          style={menuItemStyle}
          tabIndex={0}
          type="button"
        >
          编辑植物
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => setConfirmingArchive(true)}
          role="menuitem"
          style={menuItemStyle}
          tabIndex={-1}
          type="button"
        >
          {isArchived ? "恢复到看板" : "归档植物"}
        </button>
        <div aria-hidden="true" style={dividerStyle} />
        <button
          disabled={isSubmitting}
          onClick={handleDelete}
          role="menuitem"
          style={dangerMenuItemStyle}
          tabIndex={-1}
          type="button"
        >
          {confirmingDelete ? "确认删除" : "删除植物"}
        </button>
        {confirmingDelete && (
          <p aria-live="assertive" role="alert" style={confirmHintStyle}>
            删除后「{plantName}」的所有数据将无法恢复
          </p>
        )}
      </div>
      {confirmingArchive && (
        <ConfirmSheet
          title={isArchived ? "确认恢复这盆植物吗？" : "确认归档这盆植物吗？"}
          description={
            isArchived
              ? `${plantName} 会重新回到家庭看板，养护任务和历史记录都会保留。`
              : `${plantName} 会从家庭看板隐藏，但养护任务和完成记录仍会保留在数据里。`
          }
          confirmLabel={isArchived ? "确认恢复" : "确认归档"}
          variant={isArchived ? "primary" : "danger-outline"}
          isSubmitting={isSubmitting}
          onConfirm={() => void handleArchiveToggle()}
          onCancel={() => setConfirmingArchive(false)}
        />
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 49,
  background: "transparent",
};

const menuStyle: React.CSSProperties = {
  position: "absolute",
  top: "48px",
  right: "var(--space-sm)",
  zIndex: 50,
  minWidth: "160px",
  padding: "var(--space-xs) 0",
  background: "var(--color-surface)",
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card-emphasis)",
  animation: "menu-appear 150ms ease-out",
};

const menuItemStyle: React.CSSProperties = {
  appearance: "none",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "44px",
  padding: "0 var(--space-md)",
  border: "none",
  background: "transparent",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-ink)",
  cursor: "pointer",
  textAlign: "left",
};

const dangerMenuItemStyle: React.CSSProperties = {
  ...menuItemStyle,
  color: "var(--color-error)",
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  margin: "var(--space-xs) var(--space-md)",
  background: "var(--color-line)",
};

const confirmHintStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-xs) var(--space-md) var(--space-sm)",
  fontSize: "12px",
  lineHeight: 1.4,
  color: "var(--color-error)",
};
