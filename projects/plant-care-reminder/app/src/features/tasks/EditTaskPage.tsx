import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatTaskTypeLabel, normalizeCustomTaskName, validateCustomTaskName } from "./taskTypes";
import { validateIntervalDays } from "./scheduling";
import { DeleteTaskAction } from "./DeleteTaskAction";
import { TaskForm, type TaskFormErrors, type TaskFormValues } from "./TaskForm";

interface EditTaskPageProps {
  plantId: string | null;
  taskId: string | null;
}

interface TaskEditPayload {
  plantId: string;
  plantName: string;
  task: {
    customTaskName: string | null;
    enabled: boolean;
    intervalDays: number;
    lastCompletedAt: number | null;
    taskId: string;
    taskType: TaskFormValues["taskType"];
  };
}

function toDateInputValue(timestamp: number | null) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createValuesFromTask(task: TaskEditPayload["task"]): TaskFormValues {
  return {
    taskType: task.taskType,
    customTaskName: task.customTaskName ?? "",
    intervalDays: String(task.intervalDays),
    baseCompletedOn: toDateInputValue(task.lastCompletedAt),
  };
}

export function EditTaskPage({ plantId, taskId }: EditTaskPageProps) {
  const updatePlantTask = useMutation(api.tasks.updatePlantTask);
  const task = useQuery(
    api.tasks.getTaskForEdit,
    plantId && taskId ? { plantId, taskId } : "skip",
  ) as TaskEditPayload | null | undefined;
  const [values, setValues] = useState<TaskFormValues | null>(null);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (task) {
      setValues(createValuesFromTask(task.task));
      setEnabled(task.task.enabled);
      setErrors({});
      setFormError(null);
    }
  }, [task]);

  function setValue<Field extends keyof TaskFormValues>(field: Field, value: TaskFormValues[Field]) {
    setValues((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task || !values) {
      return;
    }

    const intervalDays = Number(values.intervalDays);
    const nextErrors: TaskFormErrors = {
      customTaskName: validateCustomTaskName(values.taskType, values.customTaskName),
      intervalDays: validateIntervalDays(intervalDays),
    };
    setErrors(nextErrors);

    if (nextErrors.customTaskName || nextErrors.intervalDays) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await updatePlantTask({
        taskId: task.task.taskId,
        taskType: values.taskType,
        customTaskName: normalizeCustomTaskName(values.customTaskName),
        intervalDays,
        enabled,
      });

      navigate(`/plants/${task.plantId}`, true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "当前无法更新这条养护提醒，请稍后再试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!plantId || !taskId) {
    return (
      <EmptyState
        badge="养护任务"
        title="当前提醒编辑页缺少必要 ID"
        description="请返回植物详情页，从有效的家庭植物任务重新进入。"
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            返回植物列表
          </Button>
        }
      />
    );
  }

  if (task === undefined || values === null) {
    return (
      <section style={loadingCardStyle}>
        <p style={eyebrowStyle}>养护任务</p>
        <h1 style={loadingTitleStyle}>正在加载提醒编辑器</h1>
        <p style={bodyStyle}>正在读取当前任务配置，以便保存修改。</p>
      </section>
    );
  }

  if (task === null) {
    return (
      <EmptyState
        badge="不可用"
        title="当前家庭中找不到这条养护提醒"
        description="它可能属于其他家庭，或者已经被删除。"
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate(`/plants/${plantId}`)}>
            返回植物详情
          </Button>
        }
        minHeight="220px"
      />
    );
  }

  const taskLabel = formatTaskTypeLabel(values.taskType, values.customTaskName);

  return (
    <section style={pageStyle}>
      <TaskForm
        actionsSlot={
          <section style={statusSectionStyle}>
            <div style={statusCopyStyle}>
              <p style={statusEyebrowStyle}>提醒状态</p>
              <h2 style={statusTitleStyle}>{enabled ? "当前已启用" : "当前已停用"}</h2>
              <p style={statusBodyStyle}>
                {enabled
                  ? "启用后，这条任务会继续参与待办列表和提醒推送。"
                  : "停用后，任务仍会保留在植物名下，但不会出现在待办列表里，直到重新启用。"}
              </p>
            </div>
            <Button
              fullWidth={false}
              onClick={() => setEnabled((current) => !current)}
              type="button"
              variant={enabled ? "ghost" : "secondary"}
            >
              {enabled ? "停用提醒" : "启用提醒"}
            </Button>
          </section>
        }
        description={
          <p style={bodyStyle}>
            你可以修改提醒频率、类型或自定义名称。保存后会基于当前完成基线重新计算下次提醒时间。
          </p>
        }
        errors={errors}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onValueChange={setValue}
        plantName={task.plantName}
        submitLabel="更新养护提醒"
        title={`编辑 ${task.plantName} 的${taskLabel}提醒`}
        values={values}
      />
      <DeleteTaskAction
        onDeleted={() => navigate(`/plants/${task.plantId}`, true)}
        taskId={task.task.taskId}
        taskLabel={taskLabel}
      />
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const loadingCardStyle: React.CSSProperties = {
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

const loadingTitleStyle: React.CSSProperties = {
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

const statusSectionStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(219,234,254,0.55))",
  border: "1px solid rgba(147,197,253,0.45)",
  display: "grid",
  gap: "12px",
};

const statusCopyStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const statusEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const statusTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.08rem",
  lineHeight: 1.2,
};

const statusBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};
