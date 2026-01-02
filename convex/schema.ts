import { defineSchema, defineTable } from "convex/server";
import { v, Validator } from "convex/values";

// The users, accounts, sessions and verificationTokens tables are modeled
// from https://authjs.dev/getting-started/adapters#models

export const userSchema = {
  email: v.string(),
  name: v.optional(v.string()),
  emailVerified: v.optional(v.number()),
  image: v.optional(v.string()),
};

export const sessionSchema = {
  userId: v.id("users"),
  expires: v.number(),
  sessionToken: v.string(),
};

export const accountSchema = {
  userId: v.id("users"),
  type: v.union(
    v.literal("email"),
    v.literal("oidc"),
    v.literal("oauth"),
    v.literal("webauthn")
  ),
  provider: v.string(),
  providerAccountId: v.string(),
  refresh_token: v.optional(v.string()),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.number()),
  token_type: v.optional(v.string() as Validator<Lowercase<string>>),
  scope: v.optional(v.string()),
  id_token: v.optional(v.string()),
  session_state: v.optional(v.string()),
};

export const verificationTokenSchema = {
  identifier: v.string(),
  token: v.string(),
  expires: v.number(),
};

export const authenticatorSchema = {
  credentialID: v.string(),
  userId: v.id("users"),
  providerAccountId: v.string(),
  credentialPublicKey: v.string(),
  counter: v.number(),
  credentialDeviceType: v.string(),
  credentialBackedUp: v.boolean(),
  transports: v.optional(v.string()),
};

const authTables = {
  users: defineTable(userSchema).index("email", ["email"]),
  sessions: defineTable(sessionSchema)
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),
  accounts: defineTable(accountSchema)
    .index("providerAndAccountId", ["provider", "providerAccountId"])
    .index("userId", ["userId"]),
  verificationTokens: defineTable(verificationTokenSchema).index(
    "identifierToken",
    ["identifier", "token"]
  ),
  authenticators: defineTable(authenticatorSchema)
    .index("userId", ["userId"])
    .index("credentialID", ["credentialID"]),
};

export default defineSchema({
  ...authTables,
  tasks: defineTable({
    // Legacy fields for backward compatibility
    text: v.optional(v.string()),
    // New schema fields
    taskName: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
    embedding: v.optional(v.array(v.float64())),
    googleCalendarEventId: v.optional(v.string()),
    timeSpent: v.optional(v.number()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["userId"],
  }),
  subTasks: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("tasks"),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["userId"],
  }),
  labels: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("system")),
  }),
  projects: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("system")),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("in_progress"),
        v.literal("on_hold"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.number()), // Start date/time of the project
    endDate: v.optional(v.number()), // End date/time of the project
    description: v.optional(v.string()), // Project description
    color: v.optional(v.string()), // Project color for UI
    archived: v.optional(v.boolean()), // Whether project is archived
  }),
});
