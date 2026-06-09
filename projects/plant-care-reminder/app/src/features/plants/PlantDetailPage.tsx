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
      <TaskSection
        onAdd={() => navigate(`/plants/${plant.id}/tasks/new`)}
        onComplete={() => navigate("/todo")}
        onEdit={(taskId) => navigate(`/plants/${plant.id}/tasks/${taskId}/edit`)}
        plantName={plant.name}
        tasks={result.tasks}
      />
    </section>
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
