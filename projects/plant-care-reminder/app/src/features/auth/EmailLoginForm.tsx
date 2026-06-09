import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";

type AuthMode = "signIn" | "signUp";

interface EmailLoginFormProps {
  mode: AuthMode;
}

function getAuthErrorMessage(mode: AuthMode, error: unknown) {
  const fallbackMessage =
    mode === "signIn"
      ? "邮箱或密码不正确，暂时无法登录。"
      : "当前无法创建账号，请稍后再试。";

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

function getSubmitLabel(mode: AuthMode, isSubmitting: boolean) {
  if (isSubmitting) {
    return mode === "signIn" ? "登录中..." : "创建中...";
  }

  return mode === "signIn" ? "登录" : "创建账号";
}

export function EmailLoginForm({ mode }: EmailLoginFormProps) {
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
        flow: mode,
      });

      if (result.signingIn) {
        setStatusMessage("登录成功，正在进入你的家庭植物看板...");
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(mode, error));
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
        autoComplete={mode === "signIn" ? "current-password" : "new-password"}
        hint={mode === "signUp" ? "至少使用 8 位字符。" : undefined}
        label="密码"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="请输入密码"
        required
        type="password"
        value={password}
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      {statusMessage ? <p style={statusStyle}>{statusMessage}</p> : null}
      <Button disabled={isSubmitting} type="submit">
        {getSubmitLabel(mode, isSubmitting)}
      </Button>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const statusStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-success)",
  fontSize: "0.95rem",
  lineHeight: 1.5,
};
