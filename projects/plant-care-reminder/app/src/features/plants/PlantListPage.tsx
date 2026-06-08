import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { InputField } from "../../components/ui/InputField";
import { PageHeader } from "../../components/ui/PageHeader";
import { navigate } from "../../app/router";
import { PlantCard, type PlantListCardData } from "./PlantCard";

interface PlantListResponse {
  plants: PlantListCardData[];
}

export function PlantListPage() {
  const [searchText, setSearchText] = useState("");
  const result = useQuery(api.plants.listPlantsWithNextDue, {}) as PlantListResponse | undefined;

  const filteredPlants = useMemo(() => {
    const plants = result?.plants ?? [];
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return plants;
    }

    return plants.filter((plant) => {
      const haystack = [
        plant.name,
        plant.location ?? "",
        plant.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [result?.plants, searchText]);

  if (result === undefined) {
    return (
      <section style={stateCardStyle}>
        <p style={eyebrowStyle}>Plants</p>
        <h1 style={titleStyle}>Loading your plant board</h1>
        <p style={bodyStyle}>Pulling the active household plants and their nearest due tasks.</p>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <PageHeader
        eyebrow="Plants"
        title="Shared plant registry"
        description={
          <p style={bodyStyle}>
            Active household plants appear here first, with the nearest care action surfaced on
            each card so the next ritual is immediate.
          </p>
        }
        actions={
          <Button fullWidth={false} onClick={() => navigate("/plants/new")} type="button">
            Add plant
          </Button>
        }
      />
      <InputField
        autoComplete="off"
        label="Search plants"
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search by name or location"
        value={searchText}
      />
      {result.plants.length === 0 ? (
        <EmptyState
          badge="Plants"
          title="Your shared plant board is empty"
          description="Add the first plant to start building a household registry before care reminders are attached."
          minHeight="220px"
        />
      ) : filteredPlants.length === 0 ? (
        <EmptyState
          badge="Search"
          title="No plants match that search"
          description="Try a plant name or location from your household board."
          minHeight="220px"
        />
      ) : (
        <div style={listStyle}>
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} onEdit={(plantId) => navigate(`/plants/${plantId}/edit`)} plant={plant} />
          ))}
        </div>
      )}
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const stateCardStyle: React.CSSProperties = {
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

const titleStyle: React.CSSProperties = {
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

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};
