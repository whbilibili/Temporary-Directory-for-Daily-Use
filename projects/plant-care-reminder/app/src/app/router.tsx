import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

import { api } from "../../convex/_generated/api";
import { AppShell } from "./AppShell";

export type AppPath =
  | "/"
  | "/login"
  | "/onboarding"
  | "/onboarding/profile"
  | "/onboarding/create-family"
  | "/onboarding/join-family"
  | "/plants"
  | "/plants/new"
  | "/plants/edit"
  | "/todo"
  | "/settings";

export interface RouteContext {
  userId: string | null;
  familyId: string | null;
  displayName: string | null;
}

export interface AppRoute {
  params: {
    plantId?: string;
  };
  pathname: AppPath;
}

export function navigate(to: AppPath | string, replace = false) {
  const historyMethod = replace ? window.history.replaceState : window.history.pushState;
  historyMethod.call(window.history, null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function normalizePath(pathname: string): AppRoute {
  const plantEditMatch = pathname.match(/^\/plants\/([^/]+)\/edit$/);
  if (plantEditMatch) {
    return {
      pathname: "/plants/edit",
      params: {
        plantId: decodeURIComponent(plantEditMatch[1]),
      },
    };
  }

  if (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/onboarding/profile" ||
    pathname === "/onboarding/create-family" ||
    pathname === "/onboarding/join-family" ||
    pathname === "/plants" ||
    pathname === "/plants/new" ||
    pathname === "/todo" ||
    pathname === "/settings"
  ) {
    return {
      pathname,
      params: {},
    };
  }

  return {
    pathname: "/",
    params: {},
  };
}

function useCurrentRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const syncRoute = () => {
      setRoute(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  return route;
}

export function AppRouter() {
  const route = useCurrentRoute();
  const routeContext = useQuery(api.users.getCurrentUserContext, {});

  return (
    <AppShell
      pathname={route.pathname}
      routeContext={routeContext}
      routeParams={route.params}
    />
  );
}
