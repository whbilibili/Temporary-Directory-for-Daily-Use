import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { DueTaskGroup } from "./DueTaskGroup";
import type { DueTaskCardData } from "./DueTaskCard";
import { TodoGreetingCard } from "./TodoGreetingCard";
import { UndoToast } from "./UndoToast";
import type { BatchCompletionUndoPayload, CompletionUndoPayload } from "./undoComplete";

/** 浮条当前持有的撤销载荷：单条或批量。 */
type ActiveUndo = CompletionUndoPayload | BatchCompletionUndoPayload;

interface TodoQueryResult {
  overdue: DueTaskCardData[];
  today: DueTaskCardData[];
  upcoming: DueTaskCardData[];
}

/** 统计一组待办涉及的去重植物株数。 */
function countDistinctPlants(tasks: DueTaskCardData[]) {
  return new Set(tasks.map((task) => task.plantId)).size;
}

export function TodoPage() {
  const result = useQuery(api.tasks.listDueTasks, {}) as TodoQueryResult | undefined;
  const undoComplete = useMutation(api.tasks.undoCompletePlantTask);
  // 会话内 undo 缓存：仅保留最近一次（单条或批量）完成的撤销载荷（PRD §9.1）。
  const [undoPayload, setUndoPayload] = useState<ActiveUndo | null>(null);

  async function undoOne(item: CompletionUndoPayload) {
    await undoComplete({
      taskId: item.taskId,
      logId: item.logId,
      previous: item.previous,
    });
  }

  async function handleUndo(payload: ActiveUndo) {
    setUndoPayload(null);
    try {
      if ("kind" in payload) {
        // 批量撤销：逐条回滚（顺序不影响结果，各条独立）。
        await Promise.all(payload.items.map(undoOne));
      } else {
        await undoOne(payload);
      }
    } catch {
      // 撤销失败时静默：完成结果已生效，列表会自动刷新。
    }
  }

  if (result === undefined) {
    return (
      <section style={pageStyle}>
        <h1 style={titleStyle}>家庭养护任务</h1>
        <p style={loadingStyle}>正在同步已逾期、今天到期和即将到期的任务。</p>
      </section>
    );
  }

  const totalTaskCount = result.overdue.length + result.today.length + result.upcoming.length;
  const overduePlantCount = countDistinctPlants(result.overdue);
  const todayPlantCount = countDistinctPlants(result.today);

  return (
    <section style={pageStyle}>
      <h1 style={titleStyle}>家庭养护任务</h1>

      <TodoGreetingCard overduePlantCount={overduePlantCount} todayPlantCount={todayPlantCount} />

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
            onCompleted={setUndoPayload}
            onCompletedAll={setUndoPayload}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.overdue}
            title="已逾期"
          />
          <DueTaskGroup
            onCompleted={setUndoPayload}
            onCompletedAll={setUndoPayload}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.today}
            title="今天到期"
          />
          <DueTaskGroup
            onCompleted={setUndoPayload}
            onCompletedAll={setUndoPayload}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.upcoming}
            title="即将到期"
          />
        </>
      )}

      {undoPayload ? (
        <UndoToast
          onDismiss={() => setUndoPayload(null)}
          onUndo={handleUndo}
          payload={undoPayload}
        />
      ) : null}
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
