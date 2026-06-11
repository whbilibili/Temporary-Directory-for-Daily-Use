import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { DetailNavBar } from "./DetailNavBar";
import { OverflowMenu } from "./OverflowMenu";
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
  const result = useQuery(
    api.plants.getPlantDetail,
    plantId ? { plantId: plantId as Id<"plants"> } : "skip",
  ) as
    | PlantDetailResponse
    | null
    | undefined;
  const [archivedStateOverride, setArchivedStateOverride] = useState<{
    archivedAt: number | null;
    isArchived: boolean;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

      <PlantHeroCard plant={plant} />

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
