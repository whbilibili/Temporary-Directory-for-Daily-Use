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
  | "/todo"
  | "/settings";

export interface RouteContext {
  userId: string | null;
  familyId: string | null;
  displayName: string | null;
}

export function navigate(to: AppPath, replace = false) {
  const historyMethod = replace ? window.history.replaceState : window.history.pushState;
  historyMethod.call(window.history, null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function normalizePath(pathname: string): AppPath {
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
    return pathname;
  }

  return "/";
}

function usePathname() {
  const [pathname, setPathname] = useState<AppPath>(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const syncPathname = () => {
      setPathname(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", syncPathname);
    return () => window.removeEventListener("popstate", syncPathname);
  }, []);

  return pathname;
}

export function AppRouter() {
  const pathname = usePathname();
  const routeContext = useQuery(api.users.getCurrentUserContext, {});

  return <AppShell pathname={pathname} routeContext={routeContext} />;
}
