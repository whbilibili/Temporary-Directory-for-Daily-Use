import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { navigate } from "../../app/router";
import { ArchivedSection } from "./ArchivedSection";
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
      <section style={pageStyle}>
        <header style={titleBarStyle}>
          <h1 style={titleStyle}>家庭植物档案</h1>
        </header>
        <p style={loadingCopyStyle}>正在同步家庭中的植物以及最近一次养护任务。</p>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <header style={titleBarStyle}>
        <h1 style={titleStyle}>家庭植物档案</h1>
        <Button fullWidth={false} onClick={() => navigate("/plants/new")} type="button">
          添加植物
        </Button>
      </header>
      <input
        aria-label="搜索植物"
        autoComplete="off"
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="按名称或位置搜索"
        style={searchBarStyle}
        type="text"
        value={searchText}
      />
      {result.plants.length === 0 ? (
        <EmptyState
          badge="植物"
          title="你的家庭植物看板还是空的"
          description="先添加第一盆植物，后续才能继续配置养护提醒。"
          minHeight="200px"
        />
      ) : filteredPlants.length === 0 ? (
        <EmptyState
          badge="搜索"
          title="没有找到匹配的植物"
          description="试试输入植物名称，或者它所在的位置。"
          minHeight="200px"
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
      <ArchivedSection />
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};

const titleBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-md)",
  minHeight: "48px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "var(--color-ink)",
};

const searchBarStyle: React.CSSProperties = {
  height: "40px",
  width: "100%",
  boxSizing: "border-box",
  padding: "0 var(--space-md)",
  borderRadius: "var(--radius-input)",
  border: "1px solid var(--color-line)",
  background: "var(--color-mist)",
  color: "var(--color-ink)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
};

const loadingCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "14px",
  lineHeight: 1.6,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};
