import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { FormError } from "../../components/ui/FormError";
import { InputField } from "../../components/ui/InputField";

interface JoinFamilyFormProps {
  onSuccess: () => void;
}

export function JoinFamilyForm({ onSuccess }: JoinFamilyFormProps) {
  const joinFamilyByInviteCode = useMutation(api.families.joinFamilyByInviteCode);
  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await joinFamilyByInviteCode({ inviteCode });
      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We could not join that household.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <InputField
        autoCapitalize="characters"
        autoComplete="off"
        hint="Ask a household member for the 6-character invite code."
        label="Invite code"
        maxLength={12}
        onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
        placeholder="ABCD12"
        required
        value={inviteCode}
      />
      <FormError message={errorMessage} />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Joining household..." : "Join family"}
      </Button>
    </form>
  );
}

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};
