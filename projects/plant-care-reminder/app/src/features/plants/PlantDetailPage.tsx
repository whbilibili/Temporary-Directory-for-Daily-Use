import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { DetailNavBar } from "./DetailNavBar";
import { OverflowMenu } from "./OverflowMenu";
import { PlantHeroCard } from "./PlantHeroCard";
import { ActionableTaskSection } from "../tasks/ActionableTaskSection";
import { UndoToast } from "../tasks/UndoToast";
import { TaskSection } from "../tasks/TaskSection";
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

  useEffect(() => {
    setArchivedStateOverride(null);
  }, [plantId]);

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
      <section style={loadingStyle}>
        <DetailNavBar plantName="加载中…" onMenuToggle={() => {}} />
        <p style={loadingBodyStyle}>正在加载植物信息…</p>
      </section>
    );
  }

  if (result === null) {
    return (
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
    );
  }

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
    // 找到对应任务，构建带下次时间的文案
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

  return (
    <section style={pageStyle}>
      <div style={navWrapStyle}>
        <DetailNavBar
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

      <PlantHeroCard plant={plant} tasks={result.tasks} />

      {!plant.isArchived && (
        <ActionableTaskSection
          onCompleted={handleTaskCompleted}
          tasks={result.tasks}
        />
      )}

      <TaskSection
        onAdd={() => navigate(`/plants/${plant.id}/tasks/new`)}
        onEdit={(taskId) => navigate(`/plants/${plant.id}/tasks/${taskId}/edit`)}
        plantName={plant.name}
        tasks={result.tasks}
      />

      <div style={actionBarStyle}>
        <Button
          fullWidth={false}
          onClick={() => navigate(`/plants/${plant.id}/tasks/new`)}
          style={addTaskButtonStyle}
          type="button"
        >
          添加任务
        </Button>
      </div>

      {undoPayload && (
        <UndoToast
          payload={undoPayload}
          onUndo={(p) => void handleUndo(p as CompletionUndoPayload)}
          onDismiss={() => setUndoPayload(null)}
        />
      )}
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-lg)",
};

const navWrapStyle: React.CSSProperties = {
  position: "relative",
};

const loadingStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-sm)",
};

const loadingBodyStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-md)",
  color: "var(--color-muted)",
  fontSize: "14px",
  lineHeight: 1.6,
  textAlign: "center",
};

const actionBarStyle: React.CSSProperties = {
  position: "sticky",
  bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + var(--space-sm))",
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "var(--space-sm)",
  minHeight: "56px",
  padding: "var(--space-sm) var(--space-md)",
  boxSizing: "border-box",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  borderRadius: "var(--radius-sheet)",
  boxShadow: "var(--shadow-sheet)",
};

const addTaskButtonStyle: React.CSSProperties = {
  background: "var(--color-gold)",
  color: "var(--color-ink)",
  border: "1px solid var(--color-gold)",
};
