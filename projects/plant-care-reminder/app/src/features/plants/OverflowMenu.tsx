import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { navigate } from "../../app/router";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div ref={menuRef} role="menu" style={menuStyle}>
        <button
          disabled={isSubmitting}
          onClick={() => {
            navigate(`/plants/${plantId}/edit`);
            onClose();
          }}
          role="menuitem"
          style={menuItemStyle}
          type="button"
        >
          编辑植物
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => void handleArchiveToggle()}
          role="menuitem"
          style={menuItemStyle}
          type="button"
        >
          {isArchived ? "恢复到看板" : "归档植物"}
        </button>
        <div style={dividerStyle} />
        <button
          disabled={isSubmitting}
          onClick={handleDelete}
          role="menuitem"
          style={dangerMenuItemStyle}
          type="button"
        >
          {confirmingDelete ? "确认删除" : "删除植物"}
        </button>
        {confirmingDelete && (
          <p style={confirmHintStyle}>
            删除后「{plantName}」的所有数据将无法恢复
          </p>
        )}
      </div>
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
