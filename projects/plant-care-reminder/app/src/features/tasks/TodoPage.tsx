import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <section style={stateCardStyle}>
        <p style={eyebrowStyle}>待办</p>
        <h1 style={titleStyle}>正在加载养护提醒</h1>
        <p style={bodyStyle}>正在同步本家庭已逾期、今天到期和即将到期的任务。</p>
      </section>
    );
  }

  const totalTaskCount = result.overdue.length + result.today.length + result.upcoming.length;

  return (
    <section style={pageStyle}>
      <PageHeader
        eyebrow="待办"
        title="家庭养护任务"
        description={
          <p style={bodyStyle}>
            优先处理最紧急的任务。已逾期的排在最前面，今天到期和近期任务也会持续显示。
          </p>
        }
      />

      {totalTaskCount === 0 ? (
        <EmptyState
          actions={
            <Button fullWidth={false} onClick={() => navigate("/plants")} type="button">
              查看植物列表
            </Button>
          }
          badge="待办"
          title="未来三天没有待处理的养护任务"
          description="当家庭提醒进入已逾期、今天到期或即将到期状态时，会优先出现在这里。"
          minHeight="220px"
        />
      ) : (
        <>
          <DueTaskGroup
            description="这些任务已经超过原计划日期，建议优先处理。"
            eyebrow={`${result.overdue.length} 条`}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.overdue}
            title="已逾期"
          />
          <DueTaskGroup
            description="这些任务需要在今天完成，方便家人在当天内处理。"
            eyebrow={`${result.today.length} 条`}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.today}
            title="今天到期"
          />
          <DueTaskGroup
            description="接下来三天的任务会提前显示，方便你提前安排集中养护。"
            eyebrow={`${result.upcoming.length} 条`}
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
