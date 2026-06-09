import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

import { FormError } from "./FormError";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string | null;
  hint?: ReactNode;
  label: string;
}

export function InputField({
  errorMessage,
  hint,
  id,
  label,
  style,
  ...inputProps
}: InputFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} style={wrapStyle}>
      <span style={labelStyle}>{label}</span>
      <input
        {...inputProps}
        id={inputId}
        style={{
          ...inputStyle,
          ...(errorMessage ? inputErrorStyle : null),
          ...style,
        }}
      />
      {hint ? <span style={hintStyle}>{hint}</span> : null}
      <FormError message={errorMessage} />
    </label>
  );
}

const wrapStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const labelStyle: CSSProperties = {
  color: "#1e293b",
  fontSize: "0.95rem",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  minHeight: "50px",
  borderRadius: "16px",
  border: "1px solid #d9e2ec",
  background: "#ffffff",
  color: "#1e293b",
  padding: "0 14px",
  fontSize: "0.98rem",
};

const inputErrorStyle: CSSProperties = {
  borderColor: "#fca5a5",
  boxShadow: "0 0 0 3px rgba(197,48,48,0.12)",
};

const hintStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "0.86rem",
  lineHeight: 1.5,
};
