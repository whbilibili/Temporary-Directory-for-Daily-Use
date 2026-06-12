import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { DetailNavBar } from "./DetailNavBar";
import { FloatingAddButton } from "./FloatingAddButton";
import { ImagePreviewOverlay } from "./ImagePreviewOverlay";
import { OverflowMenu } from "./OverflowMenu";
import { PlantArchiveSection } from "./PlantArchiveSection";
import { PlantHeroCard } from "./PlantHeroCard";
import { ActionableTaskSection } from "../tasks/ActionableTaskSection";
import { PlanSection } from "../tasks/PlanSection";
import { UndoToast } from "../tasks/UndoToast";
import type { CompletionUndoPayload } from "../tasks/undoComplete";
import { formatTaskTypeLabel } from "../tasks/taskTypes";
import { taskTypeEmoji } from "../tasks/TaskTypeBadge";

interface PlantDetailPageProps {
  plantId: string | null;
}

interface PlantDetailResponse {
  plant: {
    archivedAt: number | null;
    createdAt: number;
    description: string | null;
    familyId: string;
    id: string;
    imageStorageId: string | null;
    imageUrl: string | null;
    isArchived: boolean;
    location: string | null;
    name: string;
    note: string | null;
    updatedAt: number;
  };
  tasks: Array<{
    customLabel: string | null;
    id: string;
    intervalDays: number;
    lastCompletedAt: number | null;
    nextDueAt: number;
    taskType: "watering" | "fertilizing" | "misting" | "repotting" | "pruning" | "custom";
  }>;
}

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
});

export function PlantDetailPage({ plantId }: PlantDetailPageProps) {
  const result = useQuery(
    api.plants.getPlantDetail,
    plantId ? { plantId: plantId as Id<"plants"> } : "skip",
  ) as
    | PlantDetailResponse
    | null
    | undefined;
  const undoComplete = useMutation(api.tasks.undoCompletePlantTask);
  const [archivedStateOverride, setArchivedStateOverride] = useState<{
    archivedAt: number | null;
    isArchived: boolean;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [undoPayload, setUndoPayload] = useState<CompletionUndoPayload | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    setArchivedStateOverride(null);
  }, [plantId]);

  // ─── 边界状态 ───────────────────────────────────────────────

  if (!plantId) {
    return (
      <EmptyState
        badge="植物详情"
        title="当前植物详情缺少路由参数"
        description="请返回植物列表，从有效的植物卡片重新进入。"
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            返回植物列表
          </Button>
        }
      />
    );
  }

  if (result === undefined) {
    return (
      <main style={loadingPageStyle}>
        <DetailNavBar plantName="…" onMenuToggle={() => {}} />
        <p role="status" style={loadingBodyStyle}>正在加载植物信息…</p>
      </main>
    );
  }

  if (result === null) {
    return (
      <main style={loadingPageStyle}>
        <DetailNavBar plantName="" onMenuToggle={() => {}} />
        <EmptyState
          badge="不可用"
          title="当前家庭中找不到这盆植物"
          description="这条植物资料可能已删除，或者属于其他家庭。"
          actions={
            <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
              返回植物列表
            </Button>
          }
          minHeight="240px"
        />
      </main>
    );
  }

  // ─── 数据准备 ───────────────────────────────────────────────

  const plant = archivedStateOverride
    ? {
        ...result.plant,
        ...archivedStateOverride,
      }
    : result.plant;

  function handleTaskCompleted(completionResult: {
    nextDueAt: number;
    taskId: string;
    undo: CompletionUndoPayload;
  }) {
    const task = result!.tasks.find((t) => t.id === completionResult.taskId);
    const emoji = task ? taskTypeEmoji(task.taskType) : "🍃";
    const label = task ? formatTaskTypeLabel(task.taskType, task.customLabel) : "任务";
    const nextDateStr = dateFormatter.format(new Date(completionResult.nextDueAt));
    const message = `${emoji} ${label}已完成，下次 ${nextDateStr}`;

    setUndoPayload({
      ...completionResult.undo,
      message,
    });
  }

  async function handleUndo(payload: CompletionUndoPayload) {
    setUndoPayload(null);
    try {
      await undoComplete({
        taskId: payload.taskId,
        logId: payload.logId,
        previous: payload.previous,
      });
    } catch {
      // 静默处理
    }
  }

  // ─── 五层信息架构渲染 ───────────────────────────────────────
  // L0: NavBar (sticky)
  // L1: Compact Hero
  // L2: Action Zone (需要处理区，归档时不渲染)
  // L3: Plan Overview (养护计划)
  // L4: Plant Archive (可折叠档案)

  return (
    <main style={pageStyle}>
      {/* L0: 导航栏 */}
      <div style={navWrapStyle}>
        <DetailNavBar
          menuOpen={menuOpen}
          plantName={plant.name}
          onMenuToggle={() => setMenuOpen((prev) => !prev)}
        />
        <OverflowMenu
          isArchived={plant.isArchived}
          isOpen={menuOpen}
          onArchivedStateChange={setArchivedStateOverride}
          onClose={() => setMenuOpen(false)}
          plantId={plant.id}
          plantName={plant.name}
        />
      </div>

      {/* L1: 紧凑 Hero */}
      <div style={heroSpacingStyle}>
        <PlantHeroCard
          plant={plant}
          tasks={result.tasks}
          onThumbnailClick={() => setShowImagePreview(true)}
        />
      </div>

      {/* L2: 需要处理区（归档时不渲染） */}
      {!plant.isArchived && (
        <div style={actionZoneSpacingStyle}>
          <ActionableTaskSection
            onCompleted={handleTaskCompleted}
            tasks={result.tasks}
          />
        </div>
      )}

      {/* L3: 养护计划 */}
      <div style={planSpacingStyle}>
        <PlanSection
          onAdd={() => navigate(`/plants/${plant.id}/tasks/new`)}
          onEdit={(taskId) => navigate(`/plants/${plant.id}/tasks/${taskId}/edit`)}
          tasks={result.tasks}
        />
      </div>

      {/* L4: 植物档案（可折叠） */}
      <div style={archiveSpacingStyle}>
        <div style={archiveDividerStyle} />
        <PlantArchiveSection plant={plant} plantId={plant.id} />
      </div>

      {/* 底部安全区占位 */}
      <div style={bottomSafeAreaStyle} />

      {/* 悬浮添加按钮（归档时隐藏） */}
      {!plant.isArchived && (
        <FloatingAddButton
          onClick={() => navigate(`/plants/${plant.id}/tasks/new`)}
        />
      )}

      {/* UndoToast */}
      {undoPayload && (
        <UndoToast
          payload={undoPayload}
          onUndo={(p) => void handleUndo(p as CompletionUndoPayload)}
          onDismiss={() => setUndoPayload(null)}
        />
      )}

      {/* 全屏图片预览 */}
      {showImagePreview && plant.imageUrl && (
        <ImagePreviewOverlay
          imageUrl={plant.imageUrl}
          onClose={() => setShowImagePreview(false)}
          plantName={plant.name}
        />
      )}
    </main>
  );
}

// ─── 样式 ─────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100%",
  background: "var(--color-paper)",
  animation: "page-enter 200ms ease-out",
};

const navWrapStyle: React.CSSProperties = {
  position: "relative",
};

const heroSpacingStyle: React.CSSProperties = {
  padding: "0 var(--space-md)",
};

const actionZoneSpacingStyle: React.CSSProperties = {
  padding: "0 var(--space-md)",
  marginTop: "var(--space-md)",
};

const planSpacingStyle: React.CSSProperties = {
  padding: "0 var(--space-md)",
  marginTop: "var(--space-lg)",
};

const archiveSpacingStyle: React.CSSProperties = {
  padding: "0 var(--space-md)",
  marginTop: "var(--space-lg)",
};

const archiveDividerStyle: React.CSSProperties = {
  height: "1px",
  background: "var(--color-line)",
  marginBottom: "var(--space-lg)",
};

const bottomSafeAreaStyle: React.CSSProperties = {
  height: "calc(56px + env(safe-area-inset-bottom, 0px) + 80px)",
  flexShrink: 0,
};

const loadingPageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100%",
  background: "var(--color-paper)",
};

const loadingBodyStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-xl) var(--space-md)",
  color: "var(--color-muted)",
  fontSize: "14px",
  lineHeight: 1.6,
  textAlign: "center",
};
