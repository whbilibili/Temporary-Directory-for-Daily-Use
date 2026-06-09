import { mutation } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";
import { v } from "convex/values";

interface CurrentFamilyMemberContext {
  familyId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["familyId"]>;
  userId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["userId"]>;
}

async function requireCurrentFamilyMember(
  ctx: Parameters<typeof loadCurrentUserContext>[0],
): Promise<CurrentFamilyMemberContext> {
  const currentUserContext = await loadCurrentUserContext(ctx);

  if (!currentUserContext.userId) {
    throw new Error("You must be signed in to manage notification subscriptions.");
  }

  if (!currentUserContext.familyId) {
    throw new Error("You must belong to a family to manage notification subscriptions.");
  }

  return {
    familyId: currentUserContext.familyId,
    userId: currentUserContext.userId,
  };
}

export const savePushSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    deviceLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await requireCurrentFamilyMember(ctx);
    const now = Date.now();

    const existingSubscription = (
      await ctx.db
        .query("pushSubscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", currentUserContext.userId))
        .collect()
    ).find(
      (subscription) =>
        subscription.familyId === currentUserContext.familyId && subscription.endpoint === args.endpoint,
    );

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        deviceLabel: args.deviceLabel,
        lastSeenAt: now,
      });

      return {
        ok: true as const,
      };
    }

    await ctx.db.insert("pushSubscriptions", {
      userId: currentUserContext.userId,
      familyId: currentUserContext.familyId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      deviceLabel: args.deviceLabel,
      userAgent: undefined,
      lastSeenAt: now,
      createdAt: now,
    });

    return {
      ok: true as const,
    };
  },
});
