import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ArchivePlantAction } from "./ArchivePlantAction";
import { PlantHeroCard } from "./PlantHeroCard";
import { TaskSection } from "../tasks/TaskSection";

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

export function PlantDetailPage({ plantId }: PlantDetailPageProps) {
  const result = useQuery(api.plants.getPlantDetail, plantId ? { plantId } : "skip") as
    | PlantDetailResponse
    | null
    | undefined;
  const [archivedStateOverride, setArchivedStateOverride] = useState<{
    archivedAt: number | null;
    isArchived: boolean;
  } | null>(null);

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
        <h1 style={loadingTitleStyle}>正在加载植物资料</h1>
        <p style={loadingBodyStyle}>正在同步封面图、资料字段以及已启用的提醒。</p>
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

  return (
    <section style={pageStyle}>
      <PlantHeroCard
        actionSlot={
          <ArchivePlantAction
            isArchived={plant.isArchived}
            onArchivedStateChange={setArchivedStateOverride}
            plantId={plant.id}
            plantName={plant.name}
          />
        }
        plant={plant}
      />
      <TaskSection
        onAdd={() => navigate(`/plants/${plant.id}/tasks/new`)}
        onEdit={(taskId) => navigate(`/plants/${plant.id}/tasks/${taskId}/edit`)}
        plantName={plant.name}
        tasks={result.tasks}
      />
      <div style={actionBarStyle}>
        <Button fullWidth={false} onClick={() => navigate("/plants")} type="button" variant="ghost">
          返回列表
        </Button>
        <div style={actionBarPrimaryGroupStyle}>
          <Button
            fullWidth={false}
            onClick={() => navigate(`/plants/${plant.id}/edit`)}
            type="button"
            variant="ghost"
          >
            编辑植物
          </Button>
          <Button
            fullWidth={false}
            onClick={() => navigate(`/plants/${plant.id}/tasks/new`)}
            style={addTaskButtonStyle}
            type="button"
          >
            添加任务
          </Button>
        </div>
      </div>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-lg)",
};

const loadingStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-sm)",
  padding: "var(--space-md)",
};

const loadingTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "var(--color-ink)",
};

const loadingBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "14px",
  lineHeight: 1.6,
};

const actionBarStyle: React.CSSProperties = {
  position: "sticky",
  bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + var(--space-sm))",
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-sm)",
  minHeight: "56px",
  padding: "var(--space-sm) var(--space-md)",
  boxSizing: "border-box",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  borderRadius: "var(--radius-sheet)",
  boxShadow: "var(--shadow-sheet)",
};

const actionBarPrimaryGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-sm)",
};

const addTaskButtonStyle: React.CSSProperties = {
  background: "var(--color-gold)",
  color: "var(--color-ink)",
  border: "1px solid var(--color-gold)",
};
