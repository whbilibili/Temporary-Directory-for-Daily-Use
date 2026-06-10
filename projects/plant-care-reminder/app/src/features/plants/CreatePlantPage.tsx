import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
        await createPlant({
          ...payload,
          imageStorageId: payload.imageStorageId as Id<"_storage"> | null,
        });
        markCreatePlantSuccess();
        navigate("/plants", true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "当前无法保存这盆植物，请稍后再试。",
        );
      }
    },
  });

  return (
    <section style={pageStyle}>
      <PlantForm
        form={form}
        submitLabel="保存植物"
        title="把植物添加到家庭空间"
        description={
          <p style={bodyStyle}>
            先把植物资料保存下来，之后添加的养护提醒都会挂在当前家庭下的这条植物记录上。
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
  color: "var(--color-muted)",
  fontSize: "1rem",
  lineHeight: 1.7,
};
