import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";
import { ArchivePlantAction } from "./ArchivePlantAction";
import { PlantHeroCard } from "./PlantHeroCard";

interface PlantDetailPageProps {
  plantId: string | null;
}

const detailDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface PlantDetailResponse {
  plant: {
    archivedAt: number | null;
    createdAt: number;
    description: string | null;
    familyId: string;
    id: string;
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
        badge="Plant detail"
        title="This plant profile is missing its route id"
        description="Return to the shared board and reopen the plant from a valid card."
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            Back to plants
          </Button>
        }
      />
    );
  }

  if (result === undefined) {
    return (
      <section style={loadingCardStyle}>
        <p style={eyebrowStyle}>Plant detail</p>
        <h1 style={loadingTitleStyle}>Loading plant profile</h1>
        <p style={bodyStyle}>Pulling the cover photo, saved profile fields, and enabled routines.</p>
      </section>
    );
  }

  if (result === null) {
    return (
      <EmptyState
        badge="Unavailable"
        title="This plant is not available in your household"
        description="The profile may belong to another family or no longer exist."
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            Back to plants
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
        onBack={() => navigate("/plants")}
        onEdit={() => navigate(`/plants/${plant.id}/edit`)}
        plant={plant}
      />
      <PlantTaskSection plantName={plant.name} tasks={result.tasks} />
    </section>
  );
}

function PlantTaskSection({
  plantName,
  tasks,
}: {
  plantName: string;
  tasks: PlantDetailResponse["tasks"];
}) {
  return (
    <section style={sectionCardStyle}>
      <PageHeader
        eyebrow="Care tasks"
        title="Enabled routines"
        description={
          <p style={bodyStyle}>
            The reminders module will extend this section with create, edit, complete, and disable
            controls. This page already exposes the enabled task contract in due order for{" "}
            {plantName}.
          </p>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          badge="Care tasks"
          title="No enabled care routines yet"
          description="Add watering, fertilizing, misting, pruning, or custom routines in the upcoming reminders module."
          minHeight="200px"
        />
      ) : (
        <div style={taskListStyle}>
          {tasks.map((task) => {
            const title = formatTaskTypeLabel(task.taskType, task.customLabel);
            const dueCopy = formatDueDate(task.nextDueAt);
            const completionCopy = task.lastCompletedAt
              ? `Last completed ${detailDateFormatter.format(new Date(task.lastCompletedAt))}`
              : "No completion logged yet";

            return (
              <article key={task.id} style={taskCardStyle}>
                <div style={taskHeaderStyle}>
                  <p style={taskEyebrowStyle}>Enabled routine</p>
                  <h2 style={taskTitleStyle}>{title}</h2>
                </div>
                <div style={taskMetaGridStyle}>
                  <TaskMeta label="Next due" value={dueCopy} />
                  <TaskMeta
                    label="Cadence"
                    value={`Every ${task.intervalDays} day${task.intervalDays === 1 ? "" : "s"}`}
                  />
                  <TaskMeta label="History" value={completionCopy} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TaskMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={taskMetaTileStyle}>
      <p style={taskMetaLabelStyle}>{label}</p>
      <p style={taskMetaValueStyle}>{value}</p>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const loadingCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "12px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.75rem",
  fontWeight: 700,
};

const loadingTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(2rem, 5vw, 3rem)",
  lineHeight: 1.02,
  fontWeight: 700,
  color: "#1e293b",
  letterSpacing: "-0.05em",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const sectionCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "22px 18px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "18px",
};

const taskListStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const taskCardStyle: React.CSSProperties = {
  borderRadius: "20px",
  padding: "16px",
  background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(219,234,254,0.5))",
  border: "1px solid rgba(147,197,253,0.45)",
  display: "grid",
  gap: "12px",
};

const taskHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
};

const taskEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const taskTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.1rem",
  lineHeight: 1.2,
};

const taskMetaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const taskMetaTileStyle: React.CSSProperties = {
  borderRadius: "16px",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(191,219,254,0.86)",
  display: "grid",
  gap: "4px",
};

const taskMetaLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const taskMetaValueStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "0.94rem",
  lineHeight: 1.5,
};
