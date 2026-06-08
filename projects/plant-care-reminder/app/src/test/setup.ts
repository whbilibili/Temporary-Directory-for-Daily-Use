import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

import type { RouteContext } from "../app/router";

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn(() => vi.fn());
const mockConvexClientQuery = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: unknown }) => children,
  ConvexProviderWithAuth: ({ children }: { children: unknown }) => children,
  useConvex: () => ({
    query: mockConvexClientQuery,
  }),
  useMutation: () => mockUseMutation(),
  useQuery: () => mockUseQuery(),
}));

vi.mock("@convex-dev/auth/react", () => ({
  ConvexAuthProvider: ({ children }: { children: unknown }) => children,
  useAuthActions: () => ({
    signIn: mockSignIn,
    signOut: mockSignOut,
  }),
}));

export function setMockCurrentUserContext(routeContext: RouteContext | undefined) {
  mockUseQuery.mockReturnValue(routeContext);
}

export function setMockQueryResult(result: unknown) {
  mockUseQuery.mockReturnValue(result);
}

export function setMockMutationHandler(handler: ReturnType<typeof vi.fn>) {
  mockUseMutation.mockReturnValue(handler);
}

export function setMockConvexQueryHandler(handler: ReturnType<typeof vi.fn>) {
  mockConvexClientQuery.mockImplementation(handler);
}

export function resetSessionStorage() {
  window.sessionStorage.clear();
}

function resetConvexMocks() {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseMutation.mockReturnValue(vi.fn());
  mockConvexClientQuery.mockReset();
  mockSignIn.mockReset();
  mockSignOut.mockReset();
}

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      }) as MediaQueryList);

  window.scrollTo = vi.fn();

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:plant-preview"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  resetConvexMocks();
  resetSessionStorage();
  window.history.replaceState(null, "", "/");
});
