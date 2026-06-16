import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmailLoginForm } from "./EmailLoginForm";
import { setMockSignInHandler } from "../../test/setup";

describe("EmailLoginForm", () => {
  it("maps backend credential lookup errors to a user-facing message", async () => {
    setMockSignInHandler(
      vi.fn().mockRejectedValue(new Error("InvalidAccountId")),
    );

    render(<EmailLoginForm />);

    fireEvent.change(screen.getByLabelText(/邮箱/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /进入植物看板/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/邮箱或密码不正确，请检查后重试/i),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText(/invalidaccountid/i)).not.toBeInTheDocument();
  });
});
