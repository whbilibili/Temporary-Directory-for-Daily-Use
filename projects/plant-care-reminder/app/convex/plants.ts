import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";

interface CurrentFamilyMemberContext {
  familyId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["familyId"]>;
  userId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["userId"]>;
}

async function requireCurrentFamilyMember(
  ctx: Parameters<typeof loadCurrentUserContext>[0],
): Promise<CurrentFamilyMemberContext> {
  const currentUserContext = await loadCurrentUserContext(ctx);

  if (!currentUserContext.userId) {
    throw new Error("You must be signed in to manage plant images.");
  }

  if (!currentUserContext.familyId) {
    throw new Error("You must belong to a family to manage plant images.");
  }

  return {
    familyId: currentUserContext.familyId,
    userId: currentUserContext.userId,
  };
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

export const createPlant = mutation({
  args: {
    name: v.string(),
    description: v.union(v.string(), v.null()),
    note: v.union(v.string(), v.null()),
    location: v.union(v.string(), v.null()),
    imageStorageId: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await requireCurrentFamilyMember(ctx);
    const createdAt = Date.now();

    const plantId = await ctx.db.insert("plants", {
      familyId: currentUserContext.familyId,
      name: args.name,
      description: args.description ?? undefined,
      notes: args.note ?? undefined,
      location: args.location ?? undefined,
      imageStorageId: args.imageStorageId ?? undefined,
      createdBy: currentUserContext.userId,
      createdAt,
      updatedAt: createdAt,
      isArchived: false,
      archivedAt: undefined,
    });

    return {
      plantId,
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
