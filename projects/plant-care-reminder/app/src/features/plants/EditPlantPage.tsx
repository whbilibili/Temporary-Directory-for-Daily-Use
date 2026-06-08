import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { FormError } from "../../components/ui/FormError";
import { navigate } from "../../app/router";
import { PlantForm } from "./PlantForm";
import { usePlantForm } from "./usePlantForm";

interface EditPlantPageProps {
  plantId: string | null;
}

export function EditPlantPage({ plantId }: EditPlantPageProps) {
  const updatePlant = useMutation(api.plants.updatePlant);
  const plant = useQuery(
    api.plants.getPlantForEdit,
    plantId
      ? {
          plantId: plantId as never,
        }
      : "skip",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = usePlantForm({
    initialValue: plant ?? null,
    onSubmit: async (payload) => {
      if (!plantId) {
        setErrorMessage("A plant id is required to edit this record.");
        return;
      }

      setErrorMessage(null);

      try {
        await updatePlant({
          plantId: plantId as never,
          ...payload,
        });
        navigate("/plants", true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "We could not update this plant right now.",
        );
      }
    },
  });

  if (!plantId) {
    return <PlantEditError message="A plant id is required to open the editor." />;
  }

  if (plant === undefined) {
    return <PlantEditLoading />;
  }

  if (plant === null) {
    return <PlantEditError message="We could not find that plant in your household." />;
  }

  return (
    <section style={pageStyle}>
      <PlantForm
        form={form}
        submitLabel="Update plant"
        title="Edit your shared plant profile"
        description={
          <p style={bodyStyle}>
            Update the plant profile without leaving the shared family space. Existing image,
            notes and location values stay in place unless you replace them.
          </p>
        }
      />
      <FormError message={errorMessage} />
    </section>
  );
}

function PlantEditLoading() {
  return (
    <section style={statusCardStyle}>
      <p style={eyebrowStyle}>Plants</p>
      <h1 style={titleStyle}>Loading plant profile</h1>
      <p style={bodyStyle}>Pulling the current household version of this plant into the editor.</p>
    </section>
  );
}

function PlantEditError({ message }: { message: string }) {
  return (
    <section style={statusCardStyle}>
      <p style={eyebrowStyle}>Plants</p>
      <h1 style={titleStyle}>Plant editor unavailable</h1>
      <p style={bodyStyle}>{message}</p>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const statusCardStyle: React.CSSProperties = {
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
