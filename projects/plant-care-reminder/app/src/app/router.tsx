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
  | "/plants/detail"
  | "/plants/tasks/edit"
  | "/plants/tasks/new"
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
    taskId?: string;
  };
  pathname: AppPath;
}

export function navigate(to: AppPath | string, replace = false) {
  const historyMethod = replace ? window.history.replaceState : window.history.pushState;
  historyMethod.call(window.history, null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function normalizePath(pathname: string): AppRoute {
  const plantTaskEditMatch = pathname.match(/^\/plants\/([^/]+)\/tasks\/([^/]+)\/edit$/);
  if (plantTaskEditMatch) {
    return {
      pathname: "/plants/tasks/edit",
      params: {
        plantId: decodeURIComponent(plantTaskEditMatch[1]),
        taskId: decodeURIComponent(plantTaskEditMatch[2]),
      },
    };
  }

  const plantTaskNewMatch = pathname.match(/^\/plants\/([^/]+)\/tasks\/new$/);
  if (plantTaskNewMatch) {
    return {
      pathname: "/plants/tasks/new",
      params: {
        plantId: decodeURIComponent(plantTaskNewMatch[1]),
      },
    };
  }

  const plantEditMatch = pathname.match(/^\/plants\/([^/]+)\/edit$/);
  if (plantEditMatch) {
    return {
      pathname: "/plants/edit",
      params: {
        plantId: decodeURIComponent(plantEditMatch[1]),
      },
    };
  }

  const plantDetailMatch = pathname.match(/^\/plants\/([^/]+)$/);
  if (plantDetailMatch) {
    return {
      pathname: "/plants/detail",
      params: {
        plantId: decodeURIComponent(plantDetailMatch[1]),
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
    pathname === "/plants/detail" ||
    pathname === "/plants/tasks/edit" ||
    pathname === "/plants/tasks/new" ||
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
