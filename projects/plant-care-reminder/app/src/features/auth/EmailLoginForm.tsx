import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";


function getAuthErrorMessage(error: unknown) {
  const fallbackMessage = "邮箱或密码不正确，请检查后重试。";

  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  if (
    error.message.includes("InvalidAccountId") ||
    error.message.includes("InvalidSecret") ||
    error.message.includes("Invalid credentials")
  ) {
    return fallbackMessage;
  }

  return error.message;
}

function getSubmitLabel(isSubmitting: boolean) {
  return isSubmitting ? "进入中..." : "进入植物看板";
}

export function EmailLoginForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const result = await signIn("password", {
        email: email.trim().toLowerCase(),
        password,
        flow: "signIn",
      });

      if (result.signingIn) {
        setStatusMessage("登录成功，正在进入你的家庭植物看板...");
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <InputField
        autoComplete="email"
        inputMode="email"
        label="邮箱"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
        required
        type="email"
        value={email}
      />
      <InputField
        autoComplete="current-password"
        label="密码"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="至少 6 位字符"
        required
        type="password"
        value={password}
      />

      {errorMessage ? <FormError message={errorMessage} /> : null}
      {statusMessage ? <p style={statusStyle}>{statusMessage}</p> : null}

      <button
        disabled={isSubmitting}
        style={{
          ...buttonStyle,
          opacity: isSubmitting ? 0.72 : 1,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          transform: isSubmitting ? "scale(0.98)" : "scale(1)",
        }}
        type="submit"
      >
        <span style={buttonIconStyle}>→</span>
        {getSubmitLabel(isSubmitting)}
      </button>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};

const statusStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-sm) var(--space-md)",
  borderRadius: "var(--radius-input)",
  background: "rgba(47, 133, 90, 0.08)",
  color: "var(--color-success)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
  textAlign: "center",
};

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-sm)",
  width: "100%",
  minHeight: "52px",
  marginTop: "var(--space-sm)",
  borderRadius: "var(--radius-button)",
  border: "none",
  background: "var(--color-leaf)",
  color: "#ffffff",
  fontSize: "1rem",
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  letterSpacing: "0.02em",
  boxShadow: `
    0 8px 24px rgba(31, 71, 61, 0.2),
    0 2px 6px rgba(31, 71, 61, 0.12)
  `,
  transition: "transform 200ms ease, opacity 200ms ease, box-shadow 200ms ease",
};

const buttonIconStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  opacity: 0.8,
};
