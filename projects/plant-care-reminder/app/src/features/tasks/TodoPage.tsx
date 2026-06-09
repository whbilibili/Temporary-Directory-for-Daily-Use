import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { DueTaskGroup } from "./DueTaskGroup";
import type { DueTaskCardData } from "./DueTaskCard";

interface TodoQueryResult {
  overdue: DueTaskCardData[];
  today: DueTaskCardData[];
  upcoming: DueTaskCardData[];
}

export function TodoPage() {
  const result = useQuery(api.tasks.listDueTasks, {}) as TodoQueryResult | undefined;

  if (result === undefined) {
    return (
      <section style={pageStyle}>
        <h1 style={titleStyle}>家庭养护任务</h1>
        <p style={loadingStyle}>正在同步已逾期、今天到期和即将到期的任务。</p>
      </section>
    );
  }

  const totalTaskCount = result.overdue.length + result.today.length + result.upcoming.length;

  return (
    <section style={pageStyle}>
      <h1 style={titleStyle}>家庭养护任务</h1>

      {totalTaskCount === 0 ? (
        <EmptyState
          actions={
            <Button fullWidth={false} onClick={() => navigate("/plants")} type="button">
              查看植物列表
            </Button>
          }
          badge="待办"
          title="未来三天没有待处理的养护任务"
          description="新的养护提醒到期时会优先出现在这里。"
          minHeight="180px"
        />
      ) : (
        <>
          <DueTaskGroup
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.overdue}
            title="已逾期"
          />
          <DueTaskGroup
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.today}
            title="今天到期"
          />
          <DueTaskGroup
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.upcoming}
            title="即将到期"
          />
        </>
      )}
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
  lineHeight: 1.2,
  fontWeight: 700,
  color: "var(--color-ink)",
};

const loadingStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};
