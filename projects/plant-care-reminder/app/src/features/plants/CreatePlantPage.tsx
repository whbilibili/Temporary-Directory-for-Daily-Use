import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { FormError } from "../../components/ui/FormError";
import { navigate } from "../../app/router";
import { PlantForm } from "./PlantForm";
import { markCreatePlantSuccess } from "./createPlantSuccess";
import { usePlantForm } from "./usePlantForm";

export function CreatePlantPage() {
  const createPlant = useMutation(api.plants.createPlant);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = usePlantForm({
    onSubmit: async (payload) => {
      setErrorMessage(null);

      try {
        await createPlant(payload);
        markCreatePlantSuccess();
        navigate("/plants", true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "We could not save this plant right now.",
        );
      }
    },
  });

  return (
    <section style={pageStyle}>
      <PlantForm
        form={form}
        submitLabel="Save plant"
        title="Add a plant to your shared home"
        description={
          <p style={bodyStyle}>
            Save the plant profile once and the upcoming care-task module will attach reminders
            to this record inside the current household only.
          </p>
        }
      />
      <FormError message={errorMessage} />
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};
