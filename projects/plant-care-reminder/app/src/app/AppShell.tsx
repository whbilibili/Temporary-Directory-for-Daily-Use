import { AuthPage } from "../features/auth/AuthPage";
import { ProfileBootstrapForm } from "../features/auth/ProfileBootstrapForm";
import { CreateFamilyPage } from "../features/family/CreateFamilyPage";
import { FamilyOnboardingChoicePage } from "../features/family/FamilyOnboardingChoicePage";
import { FamilySettingsPage } from "../features/family/FamilySettingsPage";
import { JoinFamilyPage } from "../features/family/JoinFamilyPage";
import { JoinLandingPage } from "../features/family/JoinLandingPage";
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
        {/* 装饰球：独立裁切容器，不影响内容层 */}
        <div style={orbClipStyle} aria-hidden="true">
          <div style={backdropOrbStyle} />
        </div>
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
          {pathname === "/join" ? (
            <JoinLandingPage
              inviteCode={routeParams?.inviteCode ?? null}
              routeContext={routeContext}
            />
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
  overflowX: "clip",
};

/** 装饰球的独立裁切容器——铺满 frame 并裁掉溢出，不影响 main 内容层。
 *  使用 overflow:clip 而非 hidden，因为 clip 不会创建可滚动区域，
 *  可彻底避免 iOS Safari 的 rubber-band 弹性滚动。 */
const orbClipStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "clip",
  pointerEvents: "none",
  zIndex: 0,
};

const backdropOrbStyle: React.CSSProperties = {
  position: "absolute",
  top: "-20%",
  left: "55%",
  width: "320px",
  height: "320px",
  borderRadius: "var(--radius-pill)",
  background: "var(--gradient-accent)",
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
  // 内容层高于装饰球
  position: "relative",
  zIndex: 1,
};
