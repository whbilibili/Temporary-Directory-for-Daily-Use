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
    return isStandaloneDisplayMode() ? "iPhone 主屏幕应用" : "iPhone 浏览器";
  }

  if (/ipad/.test(userAgent)) {
    return isStandaloneDisplayMode() ? "iPad 主屏幕应用" : "iPad 浏览器";
  }

  if (/macintosh/.test(userAgent)) {
    return "Mac 浏览器";
  }

  return "家庭设备";
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
            ? "当前设备的浏览器设置已阻止通知权限。"
            : "通知授权尚未完成，请重新允许通知权限。",
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
      setErrorMessage("当前设备通知开启失败，请稍后重试。");
    }
  }

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="通知"
        title="开启设备提醒"
        description={
          <p style={bodyStyle}>
            除了在待办页查看任务外，你也可以开启设备通知，让家庭成员在离开页面后依然能收到提醒。
          </p>
        }
      />

      {capability === "unsupported" ? (
        <p style={hintStyle}>
          当前浏览器暂不支持 Web Push，仍可通过待办页查看所有提醒任务。
        </p>
      ) : null}

      {capability === "needs_install" ? (
        <p style={hintStyle}>
          如果你使用的是 iPhone Safari，请先把应用添加到主屏幕，安装后才能开启通知权限。
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
              ? "开启中..."
              : status === "enabled"
                ? "通知已开启"
                : "开启通知"}
          </Button>
          <p style={supportCopyStyle}>
            仅在支持的浏览器中才会弹出授权窗口，并为当前家庭成员保存一条设备订阅记录。
          </p>
        </div>
      ) : null}

      {status === "enabled" ? (
        <p role="status" style={successStyle}>
          当前设备已经可以接收家庭植物提醒通知。
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
