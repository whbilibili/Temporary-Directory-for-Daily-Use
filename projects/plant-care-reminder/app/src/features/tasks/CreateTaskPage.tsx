import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { validateIntervalDays } from "./scheduling";
import {
  parseDateInputToTimestamp,
  TaskForm,
  type TaskFormErrors,
  type TaskFormValues,
} from "./TaskForm";
import { normalizeCustomTaskName, validateCustomTaskName } from "./taskTypes";

interface CreateTaskPageProps {
  plantId: string | null;
}

interface TaskCreationPlant {
  location: string | null;
  plantId: string;
  plantName: string;
}

const defaultValues: TaskFormValues = {
  taskType: "watering",
  customTaskName: "",
  intervalDays: "7",
  baseCompletedOn: "",
};

export function CreateTaskPage({ plantId }: CreateTaskPageProps) {
  const createPlantTask = useMutation(api.tasks.createPlantTask);
  const plant = useQuery(api.tasks.getTaskCreationPlant, plantId ? { plantId } : "skip") as
    | TaskCreationPlant
    | null
    | undefined;
  const [values, setValues] = useState<TaskFormValues>(defaultValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setValue<Field extends keyof TaskFormValues>(field: Field, value: TaskFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const intervalDays = Number(values.intervalDays);
    const nextErrors: TaskFormErrors = {
      customTaskName: validateCustomTaskName(values.taskType, values.customTaskName),
      intervalDays: validateIntervalDays(intervalDays),
    };

    setErrors(nextErrors);

    if (nextErrors.customTaskName || nextErrors.intervalDays || !plantId) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createPlantTask({
        plantId,
        taskType: values.taskType,
        customTaskName: normalizeCustomTaskName(values.customTaskName),
        intervalDays,
        baseCompletedAt: values.baseCompletedOn
          ? parseDateInputToTimestamp(values.baseCompletedOn)
          : null,
      });

      navigate(`/plants/${plantId}`, true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "当前无法保存这条养护提醒，请稍后再试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!plantId) {
    return (
      <EmptyState
        badge="养护任务"
        title="当前提醒页面缺少植物 ID"
        description="请返回植物详情页，从有效的家庭植物重新进入。"
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            返回植物列表
          </Button>
        }
      />
    );
  }

  if (plant === undefined) {
    return (
      <section style={loadingCardStyle}>
        <p style={eyebrowStyle}>养护任务</p>
        <h1 style={loadingTitleStyle}>正在加载提醒表单</h1>
        <p style={bodyStyle}>正在确认这条提醒要绑定到哪一盆植物。</p>
      </section>
    );
  }

  if (plant === null) {
    return (
      <EmptyState
        badge="不可用"
        title="这盆植物当前无法添加新提醒"
        description="它可能已经归档、被删除，或者不属于你当前的家庭。"
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            返回植物列表
          </Button>
        }
        minHeight="220px"
      />
    );
  }

  return (
    <section style={pageStyle}>
      <TaskForm
        errors={errors}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onValueChange={setValue}
        plantName={plant.plantName}
        submitLabel="保存养护提醒"
        values={values}
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
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
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
  color: "var(--color-ink)",
  letterSpacing: "-0.05em",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "1rem",
  lineHeight: 1.7,
};
