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
        error instanceof Error ? error.message : "We could not save this care task right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!plantId) {
    return (
      <EmptyState
        badge="Care task"
        title="This care-task route is missing its plant id"
        description="Return to the plant detail page and retry from a valid household plant."
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            Back to plants
          </Button>
        }
      />
    );
  }

  if (plant === undefined) {
    return (
      <section style={loadingCardStyle}>
        <p style={eyebrowStyle}>Care task</p>
        <h1 style={loadingTitleStyle}>Loading plant reminder form</h1>
        <p style={bodyStyle}>Checking the plant context before the reminder is attached.</p>
      </section>
    );
  }

  if (plant === null) {
    return (
      <EmptyState
        badge="Unavailable"
        title="This plant cannot receive new reminders"
        description="The plant may be archived, missing, or outside your current household."
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate("/plants")}>
            Back to plants
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
        submitLabel="Save care task"
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
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "12px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
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
