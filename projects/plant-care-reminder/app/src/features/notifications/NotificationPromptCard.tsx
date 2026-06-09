import { useMutation } from "convex/react";
import { useMemo, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { normalizeSubscription } from "./normalizeSubscription";

interface PushSubscriptionLike {
  toJSON: () => {
    endpoint: string;
    keys?: {
      auth?: string | null;
      p256dh?: string | null;
    } | null;
  };
}

function isStandaloneDisplayMode() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function isIosSafariInstallCandidate() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
  const isWebkitBrowser = /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);

  return isIosDevice && isWebkitBrowser && !isStandaloneDisplayMode();
}

function deriveDeviceLabel() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone/.test(userAgent)) {
    return isStandaloneDisplayMode() ? "iPhone Home Screen" : "iPhone Browser";
  }

  if (/ipad/.test(userAgent)) {
    return isStandaloneDisplayMode() ? "iPad Home Screen" : "iPad Browser";
  }

  if (/macintosh/.test(userAgent)) {
    return "Mac Browser";
  }

  return "Household device";
}

function toApplicationServerKey(value: string) {
  const paddedValue = value.padEnd(Math.ceil(value.length / 4) * 4, "=").replace(/-/g, "+").replace(/_/g, "/");
  const decodedValue = window.atob(paddedValue);

  return Uint8Array.from(decodedValue, (character) => character.charCodeAt(0));
}

export function NotificationPromptCard() {
  const savePushSubscription = useMutation(api.notifications.savePushSubscription);
  const [status, setStatus] = useState<"idle" | "pending" | "enabled" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capability = useMemo(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window) || !("PushManager" in window)) {
      return "unsupported" as const;
    }

    if (isIosSafariInstallCandidate()) {
      return "needs_install" as const;
    }

    return "supported" as const;
  }, []);

  async function handleEnableNotifications() {
    if (capability !== "supported" || status === "pending") {
      return;
    }

    setStatus("pending");
    setErrorMessage(null);

    try {
      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("error");
        setErrorMessage(
          permission === "denied"
            ? "Notifications are blocked in browser settings for this device."
            : "Notification permission was dismissed before subscription completed.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        (await registration.pushManager.getSubscription()) as PushSubscriptionLike | null;
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

      const subscription =
        existingSubscription ??
        ((await registration.pushManager.subscribe(
          vapidPublicKey
            ? {
                userVisibleOnly: true,
                applicationServerKey: toApplicationServerKey(vapidPublicKey),
              }
            : {
                userVisibleOnly: true,
              },
        )) as PushSubscriptionLike);

      const normalizedSubscription = normalizeSubscription(subscription.toJSON());

      await savePushSubscription({
        ...normalizedSubscription,
        deviceLabel: deriveDeviceLabel(),
      });

      setStatus("enabled");
    } catch {
      setStatus("error");
      setErrorMessage("Notification setup failed on this device. Try again after reinstalling the PWA.");
    }
  }

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="Notifications"
        title="Enable device reminders"
        description={
          <p style={bodyStyle}>
            Keep due tasks visible in the inbox, then add device notifications so your household
            can receive reminder prompts away from the screen.
          </p>
        }
      />

      {capability === "unsupported" ? (
        <p style={hintStyle}>
          This browser cannot complete web-push setup yet. The due inbox remains your fallback
          reminder surface.
        </p>
      ) : null}

      {capability === "needs_install" ? (
        <p style={hintStyle}>
          On iPhone Safari, first add the app to your home screen. Notification permission becomes
          available after the standalone PWA is installed.
        </p>
      ) : null}

      {capability === "supported" ? (
        <div style={actionWrapStyle}>
          <Button
            disabled={status === "pending" || status === "enabled"}
            fullWidth={false}
            onClick={() => void handleEnableNotifications()}
            type="button"
          >
            {status === "pending"
              ? "Enabling..."
              : status === "enabled"
                ? "Notifications enabled"
                : "Enable notifications"}
          </Button>
          <p style={supportCopyStyle}>
            Permission prompts run only on supported browsers and save one subscription record for
            the current household member.
          </p>
        </div>
      ) : null}

      {status === "enabled" ? (
        <p role="status" style={successStyle}>
          This device is ready to receive reminder pushes for your household.
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" style={errorStyle}>
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "24px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "18px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const actionWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const supportCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.88rem",
  lineHeight: 1.55,
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const successStyle: React.CSSProperties = {
  margin: 0,
  color: "#166534",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};
