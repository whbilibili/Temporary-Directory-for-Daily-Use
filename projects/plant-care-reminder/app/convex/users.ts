import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";

export const getCurrentUserContext = query({
  args: {},
  handler: async (ctx) => {
    const currentUserContext = await loadCurrentUserContext(ctx);

    return {
      userId: currentUserContext.userId,
      familyId: currentUserContext.familyId,
      displayName: currentUserContext.displayName,
    };
  },
});

export const updateMyProfile = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await loadCurrentUserContext(ctx);

    if (!currentUserContext.userId || !currentUserContext.user) {
      throw new Error("You must be signed in to update your profile.");
    }

    const displayName = args.displayName.trim();
    if (displayName.length === 0) {
      throw new Error("Display name is required.");
    }

    await ctx.db.patch(currentUserContext.userId, {
      displayName,
      updatedAt: Date.now(),
    });

    return { ok: true as const };
  },
});
