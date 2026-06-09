import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";
import { PageHeader } from "../../components/ui/PageHeader";
import { formatDueDate } from "../../lib/formatters";
import {
  careTaskTypeOptions,
  formatTaskTypeLabel,
  requiresCustomTaskName,
  type CareTaskType,
} from "./taskTypes";

export interface TaskFormValues {
  baseCompletedOn: string;
  customTaskName: string;
  intervalDays: string;
  taskType: CareTaskType;
}

export interface TaskFormErrors {
  customTaskName?: string | null;
  intervalDays?: string | null;
}

interface TaskFormProps {
  errors: TaskFormErrors;
  formError?: string | null;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onValueChange: <Field extends keyof TaskFormValues>(
    field: Field,
    value: TaskFormValues[Field],
  ) => void;
  plantName: string;
  submitLabel: string;
  values: TaskFormValues;
}

export function TaskForm({
  errors,
  formError,
  isSubmitting,
  onSubmit,
  onValueChange,
  plantName,
  submitLabel,
  values,
}: TaskFormProps) {
  const selectedTaskType = careTaskTypeOptions.find((option) => option.value === values.taskType);
  const duePreview = getDuePreview(values);

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="Care task"
        title={`Create a reminder for ${plantName}`}
        description={
          <p style={bodyStyle}>
            Add an interval-based routine to this plant. The backend stores the next due time from
            the interval and optional last-completed date.
          </p>
        }
      />
      <form noValidate onSubmit={onSubmit} style={formStyle}>
        <SelectField
          hint={selectedTaskType?.description}
          label="Task type"
          onChange={(event) => onValueChange("taskType", event.target.value as CareTaskType)}
          value={values.taskType}
        >
          {careTaskTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        {requiresCustomTaskName(values.taskType) ? (
          <InputField
            autoComplete="off"
            errorMessage={errors.customTaskName}
            hint="Required for custom reminders only."
            label="Custom task name"
            onChange={(event) => onValueChange("customTaskName", event.target.value)}
            placeholder="Leaf wipe"
            value={values.customTaskName}
          />
        ) : null}
        <InputField
          errorMessage={errors.intervalDays}
          hint="Required. Whole days between each reminder."
          inputMode="numeric"
          label="Interval days"
          min={1}
          onChange={(event) => onValueChange("intervalDays", event.target.value)}
          placeholder="7"
          type="number"
          value={values.intervalDays}
        />
        <InputField
          hint="Optional. If filled, the next due time is computed from this completion date."
          label="Last completed on"
          onChange={(event) => onValueChange("baseCompletedOn", event.target.value)}
          type="date"
          value={values.baseCompletedOn}
        />
        <div style={previewPanelStyle}>
          <p style={previewEyebrowStyle}>Next due preview</p>
          <p style={previewTitleStyle}>{formatTaskTypeLabel(values.taskType, values.customTaskName)}</p>
          <p style={previewCopyStyle}>{duePreview}</p>
        </div>
        <FormError message={formError} />
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving care task..." : submitLabel}
        </Button>
      </form>
    </section>
  );
}

export function parseDateInputToTimestamp(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day, 12, 0, 0);
}

function getDuePreview(values: TaskFormValues) {
  const interval = Number(values.intervalDays);
  if (!Number.isInteger(interval) || interval < 1) {
    return "Enter a whole-day interval to preview the next reminder.";
  }

  const baseTimestamp = values.baseCompletedOn
    ? parseDateInputToTimestamp(values.baseCompletedOn)
    : Date.now();

  if (!baseTimestamp) {
    return "Enter a valid completion date to preview the next reminder.";
  }

  return formatDueDate(baseTimestamp + interval * 24 * 60 * 60 * 1000);
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  hint?: React.ReactNode;
  label: string;
}

function SelectField({ children, hint, id, label, style, ...props }: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={fieldId} style={fieldWrapStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <select
        {...props}
        id={fieldId}
        style={{
          ...selectStyle,
          ...style,
        }}
      >
        {children}
      </select>
      {hint ? <span style={hintStyle}>{hint}</span> : null}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "22px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const fieldWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const fieldLabelStyle: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "0.95rem",
  fontWeight: 700,
};

const selectStyle: React.CSSProperties = {
  minHeight: "50px",
  borderRadius: "16px",
  border: "1px solid #d9e2ec",
  background: "#ffffff",
  color: "#1e293b",
  padding: "0 14px",
  fontSize: "0.98rem",
};

const hintStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "0.86rem",
  lineHeight: 1.5,
};

const previewPanelStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "linear-gradient(180deg, rgba(219,234,254,0.5), rgba(255,255,255,0.96))",
  border: "1px solid rgba(147,197,253,0.45)",
  display: "grid",
  gap: "6px",
};

const previewEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const previewTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.05rem",
  fontWeight: 700,
};

const previewCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.92rem",
  lineHeight: 1.5,
};
