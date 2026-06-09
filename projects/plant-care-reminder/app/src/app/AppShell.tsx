import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { PageHeader } from "../components/ui/PageHeader";
import { AuthPage } from "../features/auth/AuthPage";
import { ProfileBootstrapForm } from "../features/auth/ProfileBootstrapForm";
import { CreateFamilyPage } from "../features/family/CreateFamilyPage";
import { FamilyOnboardingChoicePage } from "../features/family/FamilyOnboardingChoicePage";
import { FamilySettingsPage } from "../features/family/FamilySettingsPage";
import { JoinFamilyPage } from "../features/family/JoinFamilyPage";
import { CreatePlantPage } from "../features/plants/CreatePlantPage";
import { clearCreatePlantSuccess, hasCreatePlantSuccessFlag } from "../features/plants/createPlantSuccess";
import { EditPlantPage } from "../features/plants/EditPlantPage";
import { PlantDetailPage } from "../features/plants/PlantDetailPage";
import { PlantListPage } from "../features/plants/PlantListPage";
import { CreateTaskPage } from "../features/tasks/CreateTaskPage";
import { EditTaskPage } from "../features/tasks/EditTaskPage";
import { TodoPage } from "../features/tasks/TodoPage";
import { BottomNav } from "../components/navigation/BottomNav";
import { RouteGate } from "./RouteGate";
import { navigate } from "./router";
import type { AppPath, AppRoute, RouteContext } from "./router";

interface AppShellProps {
  pathname: AppPath;
  routeContext: RouteContext | undefined;
  routeParams?: AppRoute["params"];
}

export function AppShell({ pathname, routeContext, routeParams }: AppShellProps) {
  const hasFamily = routeContext?.familyId !== null && routeContext !== undefined;
  const displayName = routeContext?.displayName?.trim() || "Plant keeper";

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

interface OnboardingActionPlaceholderProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaPath: AppPath;
}

function OnboardingActionPlaceholder({
  title,
  description,
  ctaLabel,
  ctaPath,
}: OnboardingActionPlaceholderProps) {
  const isCreateFlow = title.startsWith("Create");
  const inputLabel = title.startsWith("Create") ? "Family name" : "Invite code";
  const inputPlaceholder = title.startsWith("Create")
    ? "Zhang family greenhouse"
    : "ABCD12";

  return (
    <section style={heroCardStyle}>
      <PageHeader
        eyebrow="Onboarding Step"
        title={title}
        description={<p style={bodyStyle}>{description}</p>}
      />
      <div style={stackStyle}>
        <InputField
          disabled
          label={inputLabel}
          placeholder={inputPlaceholder}
          hint="Shared form fields now live in the ui primitives layer and are ready for real mutations."
          errorMessage={
            title.startsWith("Join")
              ? "Invite-code validation will arrive with ACCESS-005."
              : undefined
          }
        />
      </div>
      <Button type="button" variant="secondary" onClick={() => navigate(ctaPath)}>
        {ctaLabel}
      </Button>
      {isCreateFlow ? (
        <p style={{ ...hintStyle, marginTop: "12px" }}>
          The next family module can swap this disabled field into a working create/join form
          without redefining wrappers or error states.
        </p>
      ) : null}
    </section>
  );
}

const frameStyle: React.CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.08) 0%, rgba(248,250,252,0.96) 28%, #f8fafc 100%)",
  color: "#1e293b",
  position: "relative",
  overflow: "hidden",
};

const backdropOrbStyle: React.CSSProperties = {
  position: "absolute",
  inset: "-20% auto auto 55%",
  width: "320px",
  height: "320px",
  borderRadius: "999px",
  background: "radial-gradient(circle, rgba(249,115,22,0.22), transparent 68%)",
  pointerEvents: "none",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  width: "min(100%, 520px)",
  margin: "0 auto",
  padding: "24px 18px 104px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const heroCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(37,99,235,0.08)",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const stackStyle: React.CSSProperties = {
  marginTop: "22px",
  display: "grid",
  gap: "12px",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};
