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
      ? "We could not sign you in with that email and password."
      : "We could not create your account right now.";

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
    return mode === "signIn" ? "Signing in..." : "Creating account...";
  }

  return mode === "signIn" ? "Sign in" : "Create account";
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
        setStatusMessage("Session confirmed. Preparing your household board...");
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
        label="Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <InputField
        autoComplete={mode === "signIn" ? "current-password" : "new-password"}
        hint={mode === "signUp" ? "Use at least 8 characters." : undefined}
        label="Password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
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
  color: "#0f766e",
  fontSize: "0.95rem",
  lineHeight: 1.5,
};
