import { Auth } from "convex/server";
import { Id } from "./_generated/dataModel";

async function getViewerId(ctx: { auth: Auth }) {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    return null;
  }

  return identity.subject as Id<"users">;
}

export async function handleUserId(ctx: { auth: Auth }) {
  const viewerId = await getViewerId(ctx);
  console.log("viewerId", viewerId);
  // Note: viewerId can be null if user is not authenticated
  // This is normal during page load before session is established
  return viewerId;
}