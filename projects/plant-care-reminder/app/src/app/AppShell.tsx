import { AuthPage } from "../features/auth/AuthPage";
import { ProfileBootstrapForm } from "../features/auth/ProfileBootstrapForm";
import { CreateFamilyPage } from "../features/family/CreateFamilyPage";
import { FamilyOnboardingChoicePage } from "../features/family/FamilyOnboardingChoicePage";
import { FamilySettingsPage } from "../features/family/FamilySettingsPage";
import { JoinFamilyPage } from "../features/family/JoinFamilyPage";
import { CreatePlantPage } from "../features/plants/CreatePlantPage";
import { EditPlantPage } from "../features/plants/EditPlantPage";
import { PlantDetailPage } from "../features/plants/PlantDetailPage";
import { PlantListPage } from "../features/plants/PlantListPage";
import { CreateTaskPage } from "../features/tasks/CreateTaskPage";
import { EditTaskPage } from "../features/tasks/EditTaskPage";
import { TodoPage } from "../features/tasks/TodoPage";
import { BottomNav } from "../components/navigation/BottomNav";
import { RouteGate } from "./RouteGate";
import type { AppPath, AppRoute, RouteContext } from "./router";

interface AppShellProps {
  pathname: AppPath;
  routeContext: RouteContext | undefined;
  routeParams?: AppRoute["params"];
}

export function AppShell({ pathname, routeContext, routeParams }: AppShellProps) {
  const hasFamily = routeContext?.familyId !== null && routeContext !== undefined;
  const displayName = routeContext?.displayName?.trim() || "植物管家";

  return (
    <RouteGate pathname={pathname} routeContext={routeContext}>
      <div style={frameStyle}>
        <div style={backdropOrbStyle} />
        <main style={mainStyle}>
          {pathname === "/login" ? <AuthPage /> : null}
          {pathname === "/onboarding" ? (
            <FamilyOnboardingChoicePage displayName={displayName} />
          ) : null}
          {pathname === "/onboarding/profile" ? (
            <ProfileBootstrapForm suggestedName={routeContext?.displayName} />
          ) : null}
          {pathname === "/onboarding/create-family" ? (
            <CreateFamilyPage />
          ) : null}
          {pathname === "/onboarding/join-family" ? (
            <JoinFamilyPage />
          ) : null}
          {pathname === "/plants" ? (
            <PlantListPage />
          ) : null}
          {pathname === "/plants/detail" ? (
            <PlantDetailPage plantId={routeParams?.plantId ?? null} />
          ) : null}
          {pathname === "/plants/tasks/new" ? (
            <CreateTaskPage plantId={routeParams?.plantId ?? null} />
          ) : null}
          {pathname === "/plants/tasks/edit" ? (
            <EditTaskPage
              plantId={routeParams?.plantId ?? null}
              taskId={routeParams?.taskId ?? null}
            />
          ) : null}
          {pathname === "/plants/new" ? (
            <CreatePlantPage />
          ) : null}
          {pathname === "/plants/edit" ? (
            <EditPlantPage plantId={routeParams?.plantId ?? null} />
          ) : null}
          {pathname === "/todo" ? <TodoPage /> : null}
          {pathname === "/settings" ? (
            <FamilySettingsPage />
          ) : null}
        </main>
        {hasFamily ? <BottomNav pathname={pathname} /> : null}
      </div>
    </RouteGate>
  );
}

const frameStyle: React.CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  background: "var(--gradient-botanical)",
  color: "var(--color-ink)",
  position: "relative",
  overflow: "hidden",
};

const backdropOrbStyle: React.CSSProperties = {
  position: "absolute",
  inset: "-20% auto auto 55%",
  width: "320px",
  height: "320px",
  borderRadius: "var(--radius-pill)",
  background: "var(--gradient-accent)",
  pointerEvents: "none",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  width: "min(100%, 520px)",
  margin: "0 auto",
  padding:
    "var(--space-lg) var(--space-md) calc(96px + env(safe-area-inset-bottom, 0px))",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};
