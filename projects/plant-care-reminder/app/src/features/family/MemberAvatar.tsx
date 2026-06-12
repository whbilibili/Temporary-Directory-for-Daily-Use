import type { CSSProperties } from "react";

/** 头像底色池：同人按 displayName hash 取模轮换，保证颜色稳定。 */
const AVATAR_COLORS = [
  "var(--color-leaf)",
  "var(--color-leaf-light)",
  "var(--color-task-misting)",
  "var(--color-task-pruning)",
  "var(--color-task-fertilizing)",
];

/** 稳定字符串 hash（djb2 变体），用于按名字取色。 */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** 取首字：中文取首字，英文取首字母大写。 */
function getInitial(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "";
  const first = Array.from(trimmed)[0];
  return /[a-z]/i.test(first) ? first.toUpperCase() : first;
}

interface MemberAvatarProps {
  /** 成员显示名；为空/空白时兜底 👤。 */
  name: string | null | undefined;
}

/**
 * 成员头像（SET2-010）：36×36 圆形首字头像。
 * 底色按 displayName hash 取模从色池轮换，保证同人颜色稳定；
 * 无名兜底 👤 + --color-muted。纯装饰，aria-hidden。
 */
export function MemberAvatar({ name }: MemberAvatarProps) {
  const trimmed = name?.trim() ?? "";
  const initial = getInitial(trimmed);

  if (initial.length === 0) {
    return (
      <span aria-hidden="true" style={{ ...avatarStyle, ...fallbackStyle }}>
        👤
      </span>
    );
  }

  const color = AVATAR_COLORS[hashString(trimmed) % AVATAR_COLORS.length];

  return (
    <span aria-hidden="true" style={{ ...avatarStyle, background: color }}>
      {initial}
    </span>
  );
}

const avatarStyle: CSSProperties = {
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "var(--radius-pill)",
  color: "var(--color-paper)",
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: 1,
  userSelect: "none",
};

const fallbackStyle: CSSProperties = {
  background: "var(--color-mist)",
  color: "var(--color-muted)",
  fontSize: "18px",
};
