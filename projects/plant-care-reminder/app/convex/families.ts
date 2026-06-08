import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";

const INVITE_CODE_LENGTH = 6;
const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode() {
  let inviteCode = "";

  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    inviteCode += INVITE_CODE_ALPHABET[randomIndex];
  }

  return inviteCode;
}

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase();
}

export const createFamily = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await loadCurrentUserContext(ctx);

    if (!currentUserContext.userId) {
      throw new Error("You must be signed in to create a family.");
    }

    if (currentUserContext.familyId) {
      throw new Error("You already belong to a family.");
    }

    const name = args.name.trim();
    if (name.length === 0) {
      throw new Error("Family name is required.");
    }

    let inviteCode: string | null = null;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateInviteCode = generateInviteCode();
      const existingFamily = await ctx.db
        .query("families")
        .withIndex("by_inviteCode", (q) => q.eq("inviteCode", candidateInviteCode))
        .unique();

      if (!existingFamily) {
        inviteCode = candidateInviteCode;
        break;
      }
    }

    if (!inviteCode) {
      throw new Error("Unable to generate a unique invite code. Please try again.");
    }

    const createdAt = Date.now();

    const familyId = await ctx.db.insert("families", {
      name,
      inviteCode,
      createdAt,
      createdBy: currentUserContext.userId,
    });

    await ctx.db.insert("familyMembers", {
      familyId,
      userId: currentUserContext.userId,
      role: "admin",
      joinedAt: createdAt,
    });

    return {
      familyId,
      inviteCode,
    };
  },
});

export const joinFamilyByInviteCode = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await loadCurrentUserContext(ctx);

    if (!currentUserContext.userId) {
      throw new Error("You must be signed in to join a family.");
    }

    if (currentUserContext.familyId) {
      throw new Error("You already belong to a family.");
    }

    const inviteCode = normalizeInviteCode(args.inviteCode);
    if (inviteCode.length === 0) {
      throw new Error("Invite code is required.");
    }

    const family = await ctx.db
      .query("families")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
      .unique();

    if (!family) {
      throw new Error("That invite code does not match any household.");
    }

    const existingMembership = await ctx.db
      .query("familyMembers")
      .withIndex("by_familyId_and_userId", (q) =>
        q.eq("familyId", family._id).eq("userId", currentUserContext.userId!),
      )
      .unique();

    if (existingMembership) {
      throw new Error("You are already a member of this family.");
    }

    await ctx.db.insert("familyMembers", {
      familyId: family._id,
      userId: currentUserContext.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    return {
      familyId: family._id,
    };
  },
});
