import { EmailLoginForm } from "./EmailLoginForm";

/**
 * AuthPage — Botanical greenhouse login experience.
 *
 * Design principles:
 * - Full-viewport immersive page with layered organic backgrounds
 * - Floating glass-morphism card with generous whitespace
 * - Decorative SVG botanicals as ambient texture (not distracting)
 * - Gentle entry animations (respects prefers-reduced-motion via tokens.css)
 */
export function AuthPage() {
  return (
    <section style={pageStyle}>
      {/* Ambient decorative leaves — top-right and bottom-left */}
      <svg
        aria-hidden="true"
        style={decoTopRight}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M160 10 C140 50 170 90 130 130 C100 110 80 70 100 30 C120 10 150 5 160 10Z"
          fill="rgba(31,71,61,0.06)"
        />
        <path
          d="M180 40 C170 80 190 110 160 140 C140 120 130 80 150 50 C165 35 175 35 180 40Z"
          fill="rgba(31,71,61,0.04)"
        />
      </svg>
      <svg
        aria-hidden="true"
        style={decoBottomLeft}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 190 C60 150 30 110 70 70 C100 90 120 130 100 170 C80 190 50 195 40 190Z"
          fill="rgba(31,71,61,0.05)"
        />
        <path
          d="M10 160 C20 120 10 100 40 70 C55 85 65 120 50 150 C35 170 15 165 10 160Z"
          fill="rgba(31,71,61,0.03)"
        />
      </svg>

      {/* Main content */}
      <div style={contentWrapper}>
        <header style={heroStyle}>
          <div style={logoContainer}>
            <span aria-hidden="true" style={logoStyle}>
              🌿
            </span>
          </div>
          <h1 style={heroTitleStyle}>从一个共享家庭</h1>
          <h1 style={heroTitleStyleAccent}>开始养护植物</h1>
          <p style={heroSubtitleStyle}>
            输入邮箱和密码即可进入，新用户会自动完成注册
          </p>
        </header>

        <div style={cardStyle}>
          <EmailLoginForm />
          <p style={footerHintStyle}>
            下次打开时会自动恢复登录状态，无需重复输入
          </p>
        </div>

        <footer style={brandFooterStyle}>
          <span style={brandDot} />
          <span style={brandTextStyle}>Plant Care Reminder</span>
          <span style={brandDot} />
        </footer>
      </div>
    </section>
  );
}

/* ===== Styles ===== */

const pageStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingBottom: "5vh",
  background: `
    radial-gradient(ellipse at 20% 0%, rgba(181, 212, 220, 0.35), transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(241, 197, 103, 0.12), transparent 45%),
    linear-gradient(165deg, rgba(235, 246, 238, 0.97), rgba(251, 252, 247, 1))
  `,
  overflow: "hidden",
  fontFamily: "var(--font-body)",
  zIndex: 10,
};

const contentWrapper: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gap: "var(--space-xl)",
  justifyItems: "center",
  width: "100%",
  maxWidth: "380px",
  animation: "page-enter 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
};

const heroStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-xs)",
  justifyItems: "center",
  textAlign: "center",
};

const logoContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "rgba(31, 71, 61, 0.08)",
  marginBottom: "var(--space-sm)",
};

const logoStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  lineHeight: 1,
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "1.6rem",
  lineHeight: 1.2,
  fontWeight: 700,
  color: "var(--color-ink)",
  letterSpacing: "-0.01em",
};

const heroTitleStyleAccent: React.CSSProperties = {
  ...heroTitleStyle,
  color: "var(--color-leaf)",
};

const heroSubtitleStyle: React.CSSProperties = {
  margin: 0,
  marginTop: "var(--space-sm)",
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--color-muted)",
  maxWidth: "280px",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  display: "grid",
  gap: "var(--space-lg)",
  padding: "var(--space-xl) var(--space-lg)",
  borderRadius: "var(--radius-sheet)",
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
  boxShadow: `
    0 24px 48px rgba(36, 73, 63, 0.08),
    0 8px 16px rgba(36, 73, 63, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8)
  `,
  border: "1px solid rgba(216, 228, 218, 0.6)",
};

const footerHintStyle: React.CSSProperties = {
  margin: 0,
  textAlign: "center",
  color: "var(--color-muted)",
  fontSize: "0.8rem",
  lineHeight: 1.5,
  opacity: 0.8,
};

const brandFooterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-sm)",
  opacity: 0.5,
};

const brandDot: React.CSSProperties = {
  display: "block",
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "var(--color-leaf)",
};

const brandTextStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 500,
  color: "var(--color-muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

/* ===== Decorative SVGs ===== */

const decoTopRight: React.CSSProperties = {
  position: "absolute",
  top: "-20px",
  right: "-30px",
  width: "240px",
  height: "240px",
  opacity: 1,
  pointerEvents: "none",
  zIndex: 0,
};

const decoBottomLeft: React.CSSProperties = {
  position: "absolute",
  bottom: "-20px",
  left: "-30px",
  width: "200px",
  height: "200px",
  opacity: 1,
  pointerEvents: "none",
  zIndex: 0,
};
