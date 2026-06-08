import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";

async function requireCurrentFamilyMember(
  ctx: Parameters<typeof loadCurrentUserContext>[0],
) {
  const currentUserContext = await loadCurrentUserContext(ctx);

  if (!currentUserContext.userId) {
    throw new Error("You must be signed in to manage plant images.");
  }

  if (!currentUserContext.familyId) {
    throw new Error("You must belong to a family to manage plant images.");
  }

  return currentUserContext;
}

export const generatePlantImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireCurrentFamilyMember(ctx);

    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const getPlantImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireCurrentFamilyMember(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Plant image preview is no longer available.");
    }

    return {
      imageUrl,
    };
  },
});
