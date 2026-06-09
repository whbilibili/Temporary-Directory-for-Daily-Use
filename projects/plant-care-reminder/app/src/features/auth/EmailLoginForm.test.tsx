import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmailLoginForm } from "./EmailLoginForm";
import { setMockSignInHandler } from "../../test/setup";

describe("EmailLoginForm", () => {
  it("maps backend credential lookup errors to a user-facing sign-in message", async () => {
    setMockSignInHandler(
      vi.fn().mockRejectedValue(new Error("InvalidAccountId")),
    );

    render(<EmailLoginForm mode="signIn" />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/we could not sign you in with that email and password/i),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText(/invalidaccountid/i)).not.toBeInTheDocument();
  });
});
