import { useState } from "react";

import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
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
import {
  type PlantMutationPayload,
} from "../features/plants/plantSchema";
import { BottomNav } from "../components/navigation/BottomNav";
import { formatDueDate, formatTaskTypeLabel } from "../lib/formatters";
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
            <PlantBoardPlaceholder />
          ) : null}
          {pathname === "/plants/new" ? (
            <CreatePlantPage />
          ) : null}
          {pathname === "/plants/edit" ? (
            <EditPlantPage plantId={routeParams?.plantId ?? null} />
          ) : null}
          {pathname === "/todo" ? (
            <ProtectedRoutePlaceholder
              eyebrow="Inbox"
              title="Due tasks queue"
              description="This route is reserved for overdue, today, and upcoming care tasks once the reminders module lands."
            />
          ) : null}
          {pathname === "/settings" ? (
            <FamilySettingsPage />
          ) : null}
        </main>
        {hasFamily ? <BottomNav pathname={pathname} /> : null}
      </div>
    </RouteGate>
  );
}

function PlantBoardPlaceholder() {
  const [lastCreatedPayload, setLastCreatedPayload] = useState<PlantMutationPayload | null>(() => {
    if (!hasCreatePlantSuccessFlag()) {
      return null;
    }

    clearCreatePlantSuccess();
    return {
      name: "Recently added plant",
      description: null,
      note: null,
      location: null,
      imageStorageId: null,
    };
  });

  return (
    <section style={protectedCardStyle}>
      <PageHeader
        eyebrow="Plants"
        title="Shared plant registry"
        description={
          <p style={bodyStyle}>
            The real list screen lands in `PLANT-005`. For now this route already owns the create
            entrypoint and preserves the family-scoped create flow.
          </p>
        }
        actions={
          <Button fullWidth={false} onClick={() => navigate("/plants/new")} type="button">
            Add plant
          </Button>
        }
      />
      <div style={placeholderPanelStyle}>
        <EmptyState
          badge={lastCreatedPayload ? "Saved" : "Placeholder"}
          title={lastCreatedPayload ? "Plant created successfully" : "Your plant board starts empty"}
          description={
            lastCreatedPayload
              ? "The new plant record is now stored for this household. The dedicated plant list card UI arrives in the next plant module."
              : "Use the create flow now, then the later list module will replace this holding state with real family-scoped plant cards."
          }
          minHeight="180px"
        />
      </div>
      {lastCreatedPayload ? (
        <div style={placeholderRowStyle}>
          <pre style={payloadPreviewStyle}>
            {JSON.stringify(lastCreatedPayload, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
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

interface ProtectedRoutePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

function ProtectedRoutePlaceholder({
  eyebrow,
  title,
  description,
}: ProtectedRoutePlaceholderProps) {
  const sampleTaskLabel = formatTaskTypeLabel("watering");
  const sampleDueDate = formatDueDate(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return (
    <section style={protectedCardStyle}>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={<p style={bodyStyle}>{description}</p>}
      />
      <div style={placeholderPanelStyle}>
        <EmptyState
          badge="Placeholder"
          title={`${sampleTaskLabel} example`}
          description={
            <>
              Module-specific UI will replace this block.
              <br />
              Shared formatters are already available for labels and due-date copy:
              {" "}
              {sampleDueDate}.
            </>
          }
          minHeight="164px"
        />
      </div>
      <div style={placeholderRowStyle}>
        <p style={hintStyle}>
          Future feature screens can import shared buttons, empty states, headers, and form
          wrappers instead of redefining them route by route.
        </p>
      </div>
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

const protectedCardStyle: React.CSSProperties = {
  ...heroCardStyle,
  minHeight: "calc(100svh - 180px)",
  display: "flex",
  flexDirection: "column",
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

const placeholderPanelStyle: React.CSSProperties = {
  marginTop: "auto",
};

const placeholderRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const payloadPreviewStyle: React.CSSProperties = {
  margin: 0,
  padding: "14px",
  borderRadius: "16px",
  background: "#e2e8f0",
  color: "#0f172a",
  fontSize: "0.85rem",
  lineHeight: 1.6,
  overflowX: "auto",
};
