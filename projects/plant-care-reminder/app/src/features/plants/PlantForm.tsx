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
      在这里统一维护植物基础资料，新增和编辑页面都复用同一套表单。
    </p>
  ),
  form,
  submitLabel,
  title = "植物资料编辑",
}: PlantFormProps) {
  return (
    <section style={cardStyle}>
      <PageHeader eyebrow="植物" title={title} description={description} />
      <form noValidate style={formStyle} onSubmit={form.handleSubmit}>
        <InputField
          autoComplete="off"
          errorMessage={form.errors.name}
          hint="必填。建议使用家里平时对这盆植物的叫法。"
          label="植物名称"
          onChange={(event) => form.setFieldValue("name", event.target.value)}
          placeholder="蝴蝶兰"
          required
          value={form.values.name}
        />
        <TextAreaField
          errorMessage={form.errors.description}
          hint="选填。可以写外观特征或基础养护信息。"
          label="简介"
          onChange={(event) => form.setFieldValue("description", event.target.value)}
          placeholder="喜欢散射光，放在客厅窗边。"
          rows={4}
          value={form.values.description}
        />
        <TextAreaField
          errorMessage={form.errors.note}
          hint="选填。可以记录家庭内部才会用到的提醒或习惯。"
          label="养护备注"
          onChange={(event) => form.setFieldValue("note", event.target.value)}
          placeholder="每周日转盆一次，注意窗边叶缘发干。"
          rows={4}
          value={form.values.note}
        />
        <InputField
          autoComplete="off"
          errorMessage={form.errors.location}
          hint="选填。方便家人快速找到这盆植物。"
          label="摆放位置"
          onChange={(event) => form.setFieldValue("location", event.target.value)}
          placeholder="客厅置物架"
          value={form.values.location}
        />
        <PlantImageField
          onChange={form.setImageValue}
          value={form.values.image}
        />
        <Button disabled={form.isSubmitting} type="submit">
          {form.isSubmitting ? "保存中..." : submitLabel}
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
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
  display: "grid",
  gap: "22px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
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
  color: "var(--color-ink)",
  fontSize: "0.95rem",
  fontWeight: 700,
};

const textAreaStyle: React.CSSProperties = {
  minHeight: "112px",
  borderRadius: "16px",
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  color: "var(--color-ink)",
  padding: "14px",
  fontSize: "0.98rem",
  resize: "vertical",
  fontFamily: "inherit",
};

const textAreaErrorStyle: React.CSSProperties = {
  borderColor: "var(--color-error)",
  boxShadow: "0 0 0 3px rgba(197,48,48,0.12)",
};

const hintStyle: React.CSSProperties = {
  color: "var(--color-muted)",
  fontSize: "0.86rem",
  lineHeight: 1.5,
};
