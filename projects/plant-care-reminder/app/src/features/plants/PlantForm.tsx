import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";
import { PageHeader } from "../../components/ui/PageHeader";
import { PlantImageField } from "./PlantImageField";
import type { PlantFormController } from "./usePlantForm";

interface PlantFormProps {
  description?: React.ReactNode;
  form: PlantFormController;
  submitLabel: string;
  title?: React.ReactNode;
}

export function PlantForm({
  description = (
    <p style={bodyStyle}>
      Capture the display-ready plant basics once here so both create and edit routes can
      reuse the same contract.
    </p>
  ),
  form,
  submitLabel,
  title = "Plant editor contract",
}: PlantFormProps) {
  return (
    <section style={cardStyle}>
      <PageHeader eyebrow="Plants" title={title} description={description} />
      <form noValidate style={formStyle} onSubmit={form.handleSubmit}>
        <InputField
          autoComplete="off"
          errorMessage={form.errors.name}
          hint="Required. Use the name your household already calls this plant."
          label="Plant name"
          onChange={(event) => form.setFieldValue("name", event.target.value)}
          placeholder="Monstera deliciosa"
          required
          value={form.values.name}
        />
        <TextAreaField
          errorMessage={form.errors.description}
          hint="Optional. Add a short profile note for identification or care context."
          label="Description"
          onChange={(event) => form.setFieldValue("description", event.target.value)}
          placeholder="Large split leaves, bright indirect light, living room corner."
          rows={4}
          value={form.values.description}
        />
        <TextAreaField
          errorMessage={form.errors.note}
          hint="Optional. Keep private household notes, reminders or quirks here."
          label="Care note"
          onChange={(event) => form.setFieldValue("note", event.target.value)}
          placeholder="Rotate every Sunday and watch for dry edges near the window."
          rows={4}
          value={form.values.note}
        />
        <InputField
          autoComplete="off"
          errorMessage={form.errors.location}
          hint="Optional. Helps family members find the plant quickly."
          label="Location"
          onChange={(event) => form.setFieldValue("location", event.target.value)}
          placeholder="Dining room shelf"
          value={form.values.location}
        />
        <PlantImageField
          onChange={form.setImageValue}
          value={form.values.image}
        />
        <Button disabled={form.isSubmitting} type="submit">
          {form.isSubmitting ? "Saving plant draft..." : submitLabel}
        </Button>
      </form>
    </section>
  );
}

interface TextAreaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> {
  errorMessage?: string;
  hint?: React.ReactNode;
  label: string;
}

function TextAreaField({
  errorMessage,
  hint,
  id,
  label,
  style,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={fieldId} style={fieldWrapStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea
        {...props}
        id={fieldId}
        style={{
          ...textAreaStyle,
          ...(errorMessage ? textAreaErrorStyle : null),
          ...style,
        }}
      />
      {hint ? <span style={hintStyle}>{hint}</span> : null}
      <FormError message={errorMessage} />
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

const textAreaStyle: React.CSSProperties = {
  minHeight: "112px",
  borderRadius: "16px",
  border: "1px solid #d9e2ec",
  background: "#ffffff",
  color: "#1e293b",
  padding: "14px",
  fontSize: "0.98rem",
  resize: "vertical",
  fontFamily: "inherit",
};

const textAreaErrorStyle: React.CSSProperties = {
  borderColor: "#fca5a5",
  boxShadow: "0 0 0 3px rgba(197,48,48,0.12)",
};

const hintStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "0.86rem",
  lineHeight: 1.5,
};
