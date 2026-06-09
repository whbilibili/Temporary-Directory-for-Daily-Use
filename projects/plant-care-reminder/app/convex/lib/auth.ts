import { getAuthUserId } from "@convex-dev/auth/server";

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export type AuthState =
  | "anonymous"
  | "authenticated_no_profile"
  | "authenticated_no_family"
  | "authenticated_in_family";

export interface CurrentUserContext {
  authState: AuthState;
  user: Doc<"users"> | null;
  membership: Doc<"familyMembers"> | null;
  userId: Id<"users"> | null;
  familyId: Id<"families"> | null;
  displayName: string | null;
}

export async function getCurrentUserRecord(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }

  return await ctx.db.get(userId);
}

export async function getCurrentUserContext(
  ctx: QueryCtx,
): Promise<CurrentUserContext> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return {
      authState: "anonymous",
      user: null,
      membership: null,
      userId: null,
      familyId: null,
      displayName: null,
    };
  }

  const user = await ctx.db.get(userId);

  if (!user) {
    return {
      authState: "authenticated_no_profile",
      user: null,
      membership: null,
      userId: null,
      familyId: null,
      displayName: null,
    };
  }

  const membership = await ctx.db
    .query("familyMembers")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();

  return {
      authState: membership ? "authenticated_in_family" : "authenticated_no_family",
      user,
      membership,
      userId: user._id,
      familyId: membership?.familyId ?? null,
      displayName: user.displayName ?? null,
    };
}
