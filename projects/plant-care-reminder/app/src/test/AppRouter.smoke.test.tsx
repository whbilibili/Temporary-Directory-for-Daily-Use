import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "../app/AppShell";
import { renderWithProviders } from "./renderWithProviders";
import { setMockMutationHandler } from "./setup";

describe("AppShell smoke coverage", () => {
  it("redirects anonymous visitors away from root", async () => {
    renderWithProviders(
      <AppShell
        pathname="/"
        routeContext={{
          userId: null,
          familyId: null,
          displayName: null,
        }}
      />,
      {
        route: "/",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(
      screen.getByRole("heading", { name: /preparing your plant board/i }),
    ).toBeInTheDocument();
  });

  it("renders the onboarding shell for authenticated users without a family", async () => {
    renderWithProviders(
      <AppShell
        pathname="/onboarding"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding"));
    expect(screen.getByRole("heading", { name: /welcome, wang\./i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /create a family/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /join a family/i })).toBeInTheDocument();
    expect(
      screen.getByText(/set up a new shared household, generate an invite code/i),
    ).toBeInTheDocument();
  });

  it("redirects authenticated users without a display name into the profile bootstrap route", async () => {
    renderWithProviders(
      <AppShell
        pathname="/onboarding"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: null,
        }}
      />,
      {
        route: "/onboarding",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding/profile"));
    expect(
      screen.getByRole("heading", { name: /preparing your plant board/i }),
    ).toBeInTheDocument();
  });

  it("redirects completed profiles away from the bootstrap route", async () => {
    renderWithProviders(
      <AppShell
        pathname="/onboarding/profile"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/profile",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding"));
    expect(screen.getByRole("heading", { name: /preparing your plant board/i })).toBeInTheDocument();
  });

  it("keeps family members inside protected routes and renders bottom navigation", async () => {
    renderWithProviders(
      <AppShell
        pathname="/todo"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/todo",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/todo"));
    expect(screen.getByRole("heading", { name: /due tasks queue/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /inbox/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders the create-family form for authenticated users without a family", async () => {
    renderWithProviders(
      <AppShell
        pathname="/onboarding/create-family"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/create-family",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding/create-family"));
    expect(screen.getByRole("heading", { name: /create a shared greenhouse/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
  });

  it("keeps the invite card visible on create-family after success even when family context exists", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      familyId: "family_1",
      inviteCode: "ABCD12",
    });
    setMockMutationHandler(mutationHandler);
    window.sessionStorage.setItem("plant-care-reminder:create-family-success", "1");

    renderWithProviders(
      <AppShell
        pathname="/onboarding/create-family"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/create-family",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding/create-family"));
    expect(screen.getByRole("heading", { name: /create a shared greenhouse/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
  });

  it("renders the invite card immediately after family creation succeeds", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      familyId: "family_1",
      inviteCode: "ABCD12",
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/onboarding/create-family"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/create-family",
      },
    );

    fireEvent.change(screen.getByLabelText(/family name/i), {
      target: { value: "Wang Family Greenhouse" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create family/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /your shared household is live\./i }))
        .toBeInTheDocument(),
    );
    expect(screen.getByText("ABCD12")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("plant-care-reminder:create-family-success")).toBe("1");
  });

  it("renders the join-family form for authenticated users without a family", async () => {
    renderWithProviders(
      <AppShell
        pathname="/onboarding/join-family"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/join-family",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/onboarding/join-family"));
    expect(screen.getByRole("heading", { name: /join an existing household/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument();
  });

  it("shows the join waiting state after a valid invite code succeeds", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      familyId: "family_1",
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/onboarding/join-family"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/join-family",
      },
    );

    fireEvent.change(screen.getByLabelText(/invite code/i), {
      target: { value: "ABCD12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join family/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /linking you to the household board/i }))
        .toBeInTheDocument(),
    );
  });

  it("shows an actionable error when the invite code is invalid", async () => {
    const mutationHandler = vi
      .fn()
      .mockRejectedValue(new Error("That invite code does not match any household."));
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/onboarding/join-family"
        routeContext={{
          userId: "user_1",
          familyId: null,
          displayName: "Wang",
        }}
      />,
      {
        route: "/onboarding/join-family",
      },
    );

    fireEvent.change(screen.getByLabelText(/invite code/i), {
      target: { value: "ZZZZ99" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join family/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /that invite code does not match any household\./i,
      ),
    );
  });

  it("renders the family settings summary, invite code, and members list for family members", async () => {
    renderWithProviders(
      <AppShell
        pathname="/settings"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/settings",
        queryResult: {
          familyName: "Wang Family Greenhouse",
          inviteCode: "ABCD12",
          memberCount: 2,
          members: [
            {
              id: "member_1",
              userId: "user_1",
              role: "admin",
              joinedAt: 1,
              displayName: "Wang",
              email: "wang@example.com",
              isCurrentUser: true,
            },
            {
              id: "member_2",
              userId: "user_2",
              role: "member",
              joinedAt: 2,
              displayName: "Li",
              email: "li@example.com",
              isCurrentUser: false,
            },
          ],
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/settings"));
    expect(screen.getByRole("heading", { name: /wang family greenhouse/i })).toBeInTheDocument();
    expect(screen.getByText("ABCD12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy code/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /household members/i })).toBeInTheDocument();
    expect(screen.getByText("Wang")).toBeInTheDocument();
    expect(screen.getByText("Li")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("renders the create-plant route for family members", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants/new"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/plants/new",
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants/new"));
    expect(screen.getByRole("heading", { name: /add a plant to your shared home/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/plant name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /plants/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("submits the create-plant flow and routes back to the plant board", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      plantId: "plant_1",
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/new"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/plants/new",
      },
    );

    fireEvent.change(screen.getByLabelText(/plant name/i), {
      target: { value: "Monstera deliciosa" },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: "Dining room shelf" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save plant/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        name: "Monstera deliciosa",
        description: null,
        note: null,
        location: "Dining room shelf",
        imageStorageId: null,
      }),
    );
    await waitFor(() => expect(window.location.pathname).toBe("/plants"));
    expect(window.sessionStorage.getItem("plant-care-reminder:create-plant-success")).toBe("1");
  });
});
