import type { CSSProperties } from "react";

interface FamilyHeroCardProps {
  familyName: string;
  memberCount: number;
}

/**
 * 家庭头图卡（SET2-007）。全页唯一的强色块情感锚点：品牌绿渐变背景 +
 * 右上角半透明 🌿 装饰 + 白底半透明 chip + 家庭名（卡内信息，非 h1）+ 副文案。
 * 副文案随人数切换：1 人引导发邀请码，≥2 人传达「一起照顾」的协作感。
 */
export function FamilyHeroCard({ familyName, memberCount }: FamilyHeroCardProps) {
  const subtext =
    memberCount <= 1
      ? "还没有家人加入，把邀请码发出去吧"
      : `${memberCount} 位家人 · 一起照顾这片植物`;

  return (
    <section style={heroStyle}>
      <span aria-hidden="true" style={leafDecorationStyle}>
        🌿
      </span>
      <span style={chipStyle}>家庭</span>
      <p style={familyNameStyle}>{familyName}</p>
      <p style={subtextStyle}>{subtext}</p>
    </section>
  );
}

const heroStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--radius-card)",
  padding: "var(--space-md)",
  background: "linear-gradient(135deg, var(--color-leaf), var(--color-leaf-light))",
  display: "grid",
  gap: "var(--space-xs)",
  boxShadow: "var(--shadow-card)",
};

const leafDecorationStyle: CSSProperties = {
  position: "absolute",
  top: "-6px",
  right: "8px",
  fontSize: "48px",
  lineHeight: 1,
  opacity: 0.18,
  pointerEvents: "none",
};

const chipStyle: CSSProperties = {
  justifySelf: "start",
  padding: "2px var(--space-sm)",
  borderRadius: "var(--radius-pill)",
  /* 纸白 18% 透明，用于品牌绿底上的半透明 chip */
  background: "color-mix(in srgb, var(--color-paper) 18%, transparent)",
  color: "var(--color-paper)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const familyNameStyle: CSSProperties = {
  margin: "var(--space-xs) 0 0",
  position: "relative",
  color: "var(--color-paper)",
  fontFamily: "var(--font-heading)",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: 1.2,
};

const subtextStyle: CSSProperties = {
  margin: 0,
  position: "relative",
  /* 纸白 85% 透明，保证与品牌绿底对比度 ≥ 4.5:1 */
  color: "color-mix(in srgb, var(--color-paper) 85%, transparent)",
  fontSize: "13px",
  lineHeight: 1.5,
};
