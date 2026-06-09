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
        <p style={eyebrowStyle}>植物</p>
        <h1 style={titleStyle}>正在加载家庭植物看板</h1>
        <p style={bodyStyle}>正在同步家庭中的植物以及最近一次养护任务。</p>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <PageHeader
        eyebrow="植物"
        title="家庭植物档案"
        description={
          <p style={bodyStyle}>
            家里的植物会集中显示在这里，每张卡片都会优先提示最近一次需要处理的养护任务。
          </p>
        }
        actions={
          <Button fullWidth={false} onClick={() => navigate("/plants/new")} type="button">
            添加植物
          </Button>
        }
      />
      <InputField
        autoComplete="off"
        label="搜索植物"
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="按名称或位置搜索"
        value={searchText}
      />
      {result.plants.length === 0 ? (
        <EmptyState
          badge="植物"
          title="你的家庭植物看板还是空的"
          description="先添加第一盆植物，后续才能继续配置养护提醒。"
          minHeight="220px"
        />
      ) : filteredPlants.length === 0 ? (
        <EmptyState
          badge="搜索"
          title="没有找到匹配的植物"
          description="试试输入植物名称，或者它所在的位置。"
          minHeight="220px"
        />
      ) : (
        <div style={listStyle}>
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              onEdit={(plantId) => navigate(`/plants/${plantId}/edit`)}
              onOpen={(plantId) => navigate(`/plants/${plantId}`)}
              plant={plant}
            />
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

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};
