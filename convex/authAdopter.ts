import { partial } from "convex-helpers/validators";
import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  accountSchema,
  authenticatorSchema,
  sessionSchema,
  userSchema,
  verificationTokenSchema,
} from "./schema";

const adapterQuery = customQuery(query, {
  args: { secret: v.string() },
  input: async (_ctx, { secret }) => {
    checkSecret(secret);
    return { ctx: {}, args: {} };
  },
});

const adapterMutation = customMutation(mutation, {
  args: { secret: v.string() },
  input: async (_ctx, { secret }) => {
    checkSecret(secret);
    return { ctx: {}, args: {} };
  },
});

function checkSecret(secret: string) {
  if (secret !== process.env.CONVEX_AUTH_ADAPTER_SECRET) {
    throw new Error("Adapter API called without correct secret value");
  }
}

export const createAuthenticator = adapterMutation({
  args: { authenticator: v.object(authenticatorSchema) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("authenticators", args.authenticator);
  },
});

export const createSession = adapterMutation({
  args: { session: v.object(sessionSchema) },
  handler: async (ctx, { session }) => {
    return await ctx.db.insert("sessions", session);
  },
});

export const createUser = adapterMutation({
  args: { user: v.object(userSchema) },
  handler: async (ctx, { user }) => {
    return await ctx.db.insert("users", user);
  },
});

export const createVerificationToken = adapterMutation({
  args: { verificationToken: v.object(verificationTokenSchema) },
  handler: async (ctx, { verificationToken }) => {
    return await ctx.db.insert("verificationTokens", verificationToken);
  },
});

export const deleteSession = adapterMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();
    if (session === null) {
      return null;
    }
    await ctx.db.delete(session._id);
    return session;
  },
});

export const deleteUser = adapterMutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (user === null) {
      return null;
    }
    await ctx.db.delete(id);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("userId", (q) => q.eq("userId", id))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", id))
      .collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
    return user;
  },
});

export const getAccount = adapterQuery({
  args: { provider: v.string(), providerAccountId: v.string() },
  handler: async (ctx, { provider, providerAccountId }) => {
    return await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .unique();
  },
});

export const getAuthenticator = adapterQuery({
  args: { credentialID: v.string() },
  handler: async (ctx, { credentialID }) => {
    return await ctx.db
      .query("authenticators")
      .withIndex("credentialID", (q) => q.eq("credentialID", credentialID))
      .unique();
  },
});

export const getSessionAndUser = adapterQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("sessionToken", (q) => q.eq("sessionToken", sessionToken))
      .unique();
    if (session === null) {
      return null;
    }
    const user = await ctx.db.get(session.userId);
    if (user === null) {
      return null;
    }
    return { session, user };
  },
});

export const getUser = adapterQuery({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getUserByAccount = adapterQuery({
  args: { provider: v.string(), providerAccountId: v.string() },
  handler: async (ctx, { provider, providerAccountId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .unique();
    if (account === null) {
      return null;
    }
    return await ctx.db.get(account.userId);
  },
});

export const getUserByEmail = adapterQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
  },
});

export const linkAccount = adapterMutation({
  args: { account: v.object(accountSchema) },
  handler: async (ctx, { account }) => {
    // Log what Google returned
    console.log("🔐 linkAccount called with:", {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token, 
      scope: account.scope,
      expiresAt: account.expires_at,
    });

    // Check if account already exists
    const existingAccount = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", account.provider).eq("providerAccountId", account.providerAccountId)
      )
      .unique();

    if (existingAccount) {
      console.log("📝 Updating existing account. Old refresh token:", !!existingAccount.refresh_token, "New refresh token:", !!account.refresh_token);
      // Update existing account with new tokens and scope
      await ctx.db.patch(existingAccount._id, {
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope, // Update scope to include new permissions
        id_token: account.id_token,
        session_state: account.session_state,
      });
      const updated = await ctx.db.get(existingAccount._id);
      console.log("✅ Account updated. Has refresh token now:", !!updated?.refresh_token);
      return updated;
    } else {
      console.log("🆕 Creating new account with refresh token:", !!account.refresh_token);
      // Create new account
      const id = await ctx.db.insert("accounts", account);
      return await ctx.db.get(id);
    }
  },
});

// Force update account tokens by provider and providerAccountId (for re-authentication)
export const forceUpdateAccountTokens = adapterMutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
    access_token: v.optional(v.string()),
    refresh_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    scope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { provider, providerAccountId, ...updateData } = args;
    
    console.log("🔄 forceUpdateAccountTokens called:", {
      provider,
      providerAccountId,
      hasRefreshToken: !!updateData.refresh_token,
    });

    const existingAccount = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .unique();

    if (existingAccount) {
      await ctx.db.patch(existingAccount._id, updateData);
      console.log("✅ Account tokens force-updated!");
      return await ctx.db.get(existingAccount._id);
    } else {
      console.log("❌ No account found to update");
      return null;
    }
  },
});

export const listAuthenticatorsByUserId = adapterQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("authenticators")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const unlinkAccount = adapterMutation({
  args: { provider: v.string(), providerAccountId: v.string() },
  handler: async (ctx, { provider, providerAccountId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", provider).eq("providerAccountId", providerAccountId)
      )
      .unique();
    if (account === null) {
      return null;
    }
    await ctx.db.delete(account._id);
    return account;
  },
});

export const updateAuthenticatorCounter = adapterMutation({
  args: { credentialID: v.string(), newCounter: v.number() },
  handler: async (ctx, { credentialID, newCounter }) => {
    const authenticator = await ctx.db
      .query("authenticators")
      .withIndex("credentialID", (q) => q.eq("credentialID", credentialID))
      .unique();
    if (authenticator === null) {
      throw new Error(
        `Authenticator not found for credentialID: ${credentialID}`
      );
    }
    await ctx.db.patch(authenticator._id, { counter: newCounter });
    return { ...authenticator, counter: newCounter };
  },
});

export const updateSession = adapterMutation({
  args: {
    session: v.object({
      expires: v.number(),
      sessionToken: v.string(),
    }),
  },
  handler: async (ctx, { session }) => {
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("sessionToken", (q) =>
        q.eq("sessionToken", session.sessionToken)
      )
      .unique();
    if (existingSession === null) {
      return null;
    }
    await ctx.db.patch(existingSession._id, session);
  },
});

export const updateUser = adapterMutation({
  args: {
    user: v.object({
      id: v.id("users"),
      ...partial(userSchema),
    }),
  },
  handler: async (ctx, { user: { id, ...data } }) => {
    const user = await ctx.db.get(id);
    if (user === null) {
      return;
    }
    await ctx.db.patch(user._id, data);
  },
});

export const useVerificationToken = adapterMutation({
  args: { identifier: v.string(), token: v.string() },
  handler: async (ctx, { identifier, token }) => {
    const verificationToken = await ctx.db
      .query("verificationTokens")
      .withIndex("identifierToken", (q) =>
        q.eq("identifier", identifier).eq("token", token)
      )
      .unique();
    if (verificationToken === null) {
      return null;
    }
    await ctx.db.delete(verificationToken._id);
    return verificationToken;
  },
});
