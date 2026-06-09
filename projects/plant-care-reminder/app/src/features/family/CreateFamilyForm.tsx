import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";

interface CreateFamilyFormProps {
  onSuccess: (result: { familyId: string; inviteCode: string }) => void;
}

export function CreateFamilyForm({ onSuccess }: CreateFamilyFormProps) {
  const createFamily = useMutation(api.families.createFamily);
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await createFamily({ name });
      onSuccess(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "创建家庭失败，请稍后再试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <InputField
        autoComplete="organization"
        hint="填写一个家人都能一眼认出的家庭名称。"
        label="家庭名称"
        maxLength={60}
        onChange={(event) => setName(event.target.value)}
        placeholder="例如：王家植物角"
        required
        value={name}
      />
      <FormError message={errorMessage} />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "创建中..." : "创建家庭"}
      </Button>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};
