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

  it("renders active plant cards with next-due summaries on the plant board", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/plants",
        queryResult: {
          plants: [
            {
              id: "plant_1",
              name: "Monstera deliciosa",
              description: "Bright indirect light and large split leaves.",
              location: "Dining room shelf",
              imageUrl: "https://cdn.test/monstera.jpg",
              nextDueTask: {
                taskType: "watering",
                customLabel: null,
                nextDueAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
              },
            },
          ],
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants"));
    expect(screen.getByRole("heading", { name: /shared plant registry/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /monstera deliciosa/i })).toBeInTheDocument();
    expect(screen.getByText(/dining room shelf/i)).toBeInTheDocument();
    expect(screen.getByText(/watering/i)).toBeInTheDocument();
    expect(screen.getByText(/due in 2 days|due tomorrow|due today|due /i)).toBeInTheDocument();
    expect(screen.getByAltText(/monstera deliciosa cover/i)).toHaveAttribute(
      "src",
      "https://cdn.test/monstera.jpg",
    );
    expect(screen.getByRole("button", { name: /open profile/i })).toBeInTheDocument();
  });

  it("renders the empty plant-board state when the household has no active plants", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
      />,
      {
        route: "/plants",
        queryResult: {
          plants: [],
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants"));
    expect(screen.getByText(/your shared plant board is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add plant/i })).toBeInTheDocument();
  });

  it("loads the edit-plant route with prefilled data for the current family", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants/edit"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1/edit",
        queryResult: {
          plantId: "plant_1",
          name: "Bird of Paradise",
          description: "Tall leaves by the balcony.",
          note: "Water every Saturday.",
          location: "Sunroom corner",
          imageStorageId: "storage_1",
          imagePreviewUrl: "https://cdn.test/bird-of-paradise.jpg",
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants/plant_1/edit"));
    expect(screen.getByRole("heading", { name: /edit your shared plant profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/plant name/i)).toHaveValue("Bird of Paradise");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Tall leaves by the balcony.");
    expect(screen.getByLabelText(/care note/i)).toHaveValue("Water every Saturday.");
    expect(screen.getByLabelText(/location/i)).toHaveValue("Sunroom corner");
    expect(screen.getByAltText(/selected plant cover preview/i)).toHaveAttribute(
      "src",
      "https://cdn.test/bird-of-paradise.jpg",
    );
  });

  it("renders the plant detail route with profile metadata and enabled tasks", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants/detail"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1",
        queryResult: {
          plant: {
            id: "plant_1",
            familyId: "family_1",
            name: "Monstera deliciosa",
            description: "Bright indirect light and large split leaves.",
            note: "Rotate the pot every Sunday.",
            location: "Dining room shelf",
            imageUrl: "https://cdn.test/monstera.jpg",
            createdAt: Date.UTC(2026, 0, 5),
            updatedAt: Date.UTC(2026, 5, 2),
            isArchived: false,
            archivedAt: null,
          },
          tasks: [
            {
              id: "task_1",
              taskType: "watering",
              customLabel: null,
              intervalDays: 7,
              nextDueAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
              lastCompletedAt: Date.UTC(2026, 5, 1),
            },
            {
              id: "task_2",
              taskType: "custom",
              customLabel: "Leaf wipe",
              intervalDays: 14,
              nextDueAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
              lastCompletedAt: null,
            },
          ],
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants/plant_1"));
    expect(screen.getByRole("heading", { name: /monstera deliciosa/i })).toBeInTheDocument();
    expect(screen.getByText(/rotate the pot every sunday\./i)).toBeInTheDocument();
    expect(screen.getByText(/active in household board/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /enabled routines/i })).toBeInTheDocument();
    expect(screen.getByText(/^Watering$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Leaf wipe$/i)).toBeInTheDocument();
    expect(screen.getByText(/every 7 days/i)).toBeInTheDocument();
    expect(screen.getByAltText(/monstera deliciosa cover/i)).toHaveAttribute(
      "src",
      "https://cdn.test/monstera.jpg",
    );
  });

  it("shows an unavailable state when the plant detail is outside the current family", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants/detail"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_missing",
        }}
      />,
      {
        route: "/plants/plant_missing",
        queryResult: null,
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants/plant_missing"));
    expect(screen.getByText(/this plant is not available in your household/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to plants/i })).toBeInTheDocument();
  });

  it("renders the create-task route for an active family plant", async () => {
    renderWithProviders(
      <AppShell
        pathname="/plants/tasks/new"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1/tasks/new",
        queryResult: {
          plantId: "plant_1",
          plantName: "Monstera deliciosa",
          location: "Dining room shelf",
        },
      },
    );

    await waitFor(() => expect(window.location.pathname).toBe("/plants/plant_1/tasks/new"));
    expect(
      screen.getByRole("heading", { name: /create a reminder for monstera deliciosa/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/task type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interval days/i)).toHaveValue(7);
    expect(screen.getByRole("button", { name: /plants/i })).toHaveAttribute("aria-current", "page");
  });

  it("submits a preset care-task create flow and routes back to the parent plant detail", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      taskId: "task_1",
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/tasks/new"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1/tasks/new",
        queryResult: {
          plantId: "plant_1",
          plantName: "Monstera deliciosa",
          location: "Dining room shelf",
        },
      },
    );

    fireEvent.change(screen.getByLabelText(/interval days/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/last completed on/i), {
      target: { value: "2026-06-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save care task/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        plantId: "plant_1",
        taskType: "watering",
        customTaskName: null,
        intervalDays: 5,
        baseCompletedAt: Date.UTC(2026, 5, 10, 12, 0, 0),
      }),
    );
    await waitFor(() => expect(window.location.pathname).toBe("/plants/plant_1"));
  });

  it("supports custom care-task creation and enforces a custom task name", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      taskId: "task_2",
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/tasks/new"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1/tasks/new",
        queryResult: {
          plantId: "plant_1",
          plantName: "Monstera deliciosa",
          location: "Dining room shelf",
        },
      },
    );

    fireEvent.change(screen.getByLabelText(/task type/i), {
      target: { value: "custom" },
    });
    expect(screen.getByPlaceholderText("Leaf wipe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save care task/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/enter a custom task name/i);
    expect(mutationHandler).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("Leaf wipe"), {
      target: { value: "Leaf wipe" },
    });
    fireEvent.change(screen.getByLabelText(/interval days/i), {
      target: { value: "14" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save care task/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        plantId: "plant_1",
        taskType: "custom",
        customTaskName: "Leaf wipe",
        intervalDays: 14,
        baseCompletedAt: null,
      }),
    );
  });

  it("requires explicit confirmation before archiving a plant and updates the detail status", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      ok: true,
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/detail"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1",
        queryResult: {
          plant: {
            id: "plant_1",
            familyId: "family_1",
            name: "Monstera deliciosa",
            description: "Bright indirect light and large split leaves.",
            note: "Rotate the pot every Sunday.",
            location: "Dining room shelf",
            imageUrl: "https://cdn.test/monstera.jpg",
            createdAt: Date.UTC(2026, 0, 5),
            updatedAt: Date.UTC(2026, 5, 2),
            isArchived: false,
            archivedAt: null,
          },
          tasks: [],
        },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /archive plant/i }));
    expect(mutationHandler).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /archive this plant\?/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm archive/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        plantId: "plant_1",
        isArchived: true,
      }),
    );
    expect(screen.getByText(/archived profile/i)).toBeInTheDocument();
    expect(screen.getByText(/hidden from active plant views until it is restored/i)).toBeInTheDocument();
    expect(screen.getByText(/archived on /i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restore plant/i })).toBeInTheDocument();
  });

  it("restores an archived plant from the detail page with the same mutation", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      ok: true,
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/detail"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1",
        queryResult: {
          plant: {
            id: "plant_1",
            familyId: "family_1",
            name: "Monstera deliciosa",
            description: "Bright indirect light and large split leaves.",
            note: "Rotate the pot every Sunday.",
            location: "Dining room shelf",
            imageUrl: "https://cdn.test/monstera.jpg",
            createdAt: Date.UTC(2026, 0, 5),
            updatedAt: Date.UTC(2026, 5, 2),
            isArchived: true,
            archivedAt: Date.UTC(2026, 5, 7),
          },
          tasks: [],
        },
      },
    );

    expect(screen.getByText(/archived on /i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /restore plant/i }));
    expect(screen.getByRole("heading", { name: /restore this plant\?/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm restore/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        plantId: "plant_1",
        isArchived: false,
      }),
    );
    expect(screen.getByText(/active profile/i)).toBeInTheDocument();
    expect(screen.getByText(/active in household board/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive plant/i })).toBeInTheDocument();
  });

  it("submits the edit-plant flow and keeps the existing image when unchanged", async () => {
    const mutationHandler = vi.fn().mockResolvedValue({
      ok: true,
    });
    setMockMutationHandler(mutationHandler);

    renderWithProviders(
      <AppShell
        pathname="/plants/edit"
        routeContext={{
          userId: "user_1",
          familyId: "family_1",
          displayName: "Wang",
        }}
        routeParams={{
          plantId: "plant_1",
        }}
      />,
      {
        route: "/plants/plant_1/edit",
        queryResult: {
          plantId: "plant_1",
          name: "Bird of Paradise",
          description: "Tall leaves by the balcony.",
          note: "Water every Saturday.",
          location: "Sunroom corner",
          imageStorageId: "storage_1",
          imagePreviewUrl: "https://cdn.test/bird-of-paradise.jpg",
        },
      },
    );

    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: "South window ledge" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update plant/i }));

    await waitFor(() =>
      expect(mutationHandler).toHaveBeenCalledWith({
        plantId: "plant_1",
        name: "Bird of Paradise",
        description: "Tall leaves by the balcony.",
        note: "Water every Saturday.",
        location: "South window ledge",
        imageStorageId: "storage_1",
      }),
    );
    await waitFor(() => expect(window.location.pathname).toBe("/plants"));
  });
});
