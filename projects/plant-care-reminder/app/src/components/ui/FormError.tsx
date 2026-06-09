import type { CSSProperties } from "react";

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" style={errorStyle}>
      {message}
    </p>
  );
}

const errorStyle: CSSProperties = {
  margin: 0,
  color: "#c53030",
  fontSize: "0.88rem",
  lineHeight: 1.5,
};
