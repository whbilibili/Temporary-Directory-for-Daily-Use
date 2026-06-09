import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";
import { PageHeader } from "../../components/ui/PageHeader";

interface ProfileBootstrapFormProps {
  suggestedName?: string | null;
}

export function ProfileBootstrapForm({ suggestedName }: ProfileBootstrapFormProps) {
  const updateMyProfile = useMutation(api.users.updateMyProfile);
  const [displayName, setDisplayName] = useState(suggestedName?.trim() ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await updateMyProfile({
        displayName,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "保存称呼失败，请稍后再试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="个人资料"
        title="家人该怎么称呼你？"
        description={
          <p style={bodyStyle}>
            继续之前，先保存一个简短称呼。这个名字会出现在任务记录、家庭成员列表和养护历史中。
          </p>
        }
      />
      <form style={formStyle} onSubmit={handleSubmit}>
        <InputField
          autoComplete="nickname"
          hint="尽量简短，方便家人快速识别。"
          label="你的称呼"
          maxLength={40}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="例如：小王"
          required
          value={displayName}
        />
        <FormError message={errorMessage} />
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "保存中..." : "继续"}
        </Button>
      </form>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "20px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};
