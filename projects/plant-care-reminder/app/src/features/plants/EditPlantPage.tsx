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
        setErrorMessage("编辑这条植物记录时缺少植物 ID。");
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
          error instanceof Error ? error.message : "当前无法更新这盆植物，请稍后再试。",
        );
      }
    },
  });

  if (!plantId) {
    return <PlantEditError message="打开编辑器时缺少植物 ID。" />;
  }

  if (plant === undefined) {
    return <PlantEditLoading />;
  }

  if (plant === null) {
    return <PlantEditError message="在当前家庭中没有找到这盆植物。" />;
  }

  return (
    <section style={pageStyle}>
      <PlantForm
        form={form}
        submitLabel="更新植物"
        title="编辑家庭植物资料"
        description={
          <p style={bodyStyle}>
            直接在家庭空间内更新植物资料；除非你主动修改，否则原有图片、备注和位置都会保留。
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
      <p style={eyebrowStyle}>植物</p>
      <h1 style={titleStyle}>正在加载植物资料</h1>
      <p style={bodyStyle}>正在把这盆植物当前的家庭记录载入编辑器。</p>
    </section>
  );
}

function PlantEditError({ message }: { message: string }) {
  return (
    <section style={statusCardStyle}>
      <p style={eyebrowStyle}>植物</p>
      <h1 style={titleStyle}>植物编辑不可用</h1>
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
  color: "var(--color-leaf)",
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
