import { query, action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import type { QueryCtx } from "./_generated/server";
import moment from "moment";

// Helper to get Google access token for user (query version - read only)
async function getGoogleAccessTokenFromQuery(ctx: QueryCtx, userId: Id<"users">): Promise<string | null> {
  const account = await ctx.db
    .query("accounts")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("provider"), "google"))
    .first();

  if (!account || !account.access_token) {
    return null;
  }

  // If token is expired, we'll need to refresh it via action
  if (account.expires_at && account.expires_at < Date.now()) {
    return null; // Signal that refresh is needed
  }

  return account.access_token;
}


// Refresh Google OAuth token
async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google token");
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    refresh_token: data.refresh_token,
  };
}

// Create event in Google Calendar
export const createCalendarEvent = action({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }): Promise<string> => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const task = await ctx.runQuery(api.tasks.getTaskById, { taskId });
    if (!task || !task.userId || task.userId !== userId) {
      throw new Error("Task not found");
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, refresh it
      accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
    }
    
    // Use startDate/endDate if available, otherwise fallback to dueDate
    const startTime = task.startDate || task.dueDate;
    const endTime = task.endDate || (task.startDate ? task.startDate + 3600000 : (task.dueDate ? task.dueDate + 3600000 : null));

    if (!startTime) {
      throw new Error("Task must have a start date or due date to create calendar event");
    }

    if (!endTime) {
      throw new Error("Task must have an end date or due date to create calendar event");
    }

    const event: {
      summary: string;
      description: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    } = {
      summary: task.taskName || "Task",
      description: task.description || "",
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response: Response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create calendar event: ${error}`);
    }

    const createdEvent: { id: string } = await response.json();

    // Update task with calendar event ID
    await ctx.runMutation(api.tasks.updateTask, {
      taskId,
      googleCalendarEventId: createdEvent.id,
    });

    return createdEvent.id;
  },
});

// Create event in Google Calendar and create a task from it
export const createEventAndTask = action({
  args: {
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, { summary, description, startTime, endTime, projectId, labelId, priority }): Promise<{ eventId: string; taskId: Id<"tasks"> }> => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, refresh it
      accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
    }

    // Create event in Google Calendar
    const event: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    } = {
      summary,
      description: description || "",
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response: Response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create calendar event: ${error}`);
    }

    const createdEvent: { id: string } = await response.json();

    // Get default project and label if not provided
    let finalProjectId: Id<"projects">;
    let finalLabelId: Id<"labels">;

    if (!projectId) {
      // Get user's first project or create a default one
      const projects = await ctx.runQuery(api.project.getProjects, {});
      const userProject = projects.find((p) => p.userId === userId);
      if (!userProject) {
        throw new Error("No project found. Please create a project first.");
      }
      finalProjectId = userProject._id;
    } else {
      finalProjectId = projectId;
    }

    if (!labelId) {
      // Get user's first label or use a default
      const labels = await ctx.runQuery(api.label.getLabels, {});
      const userLabel = labels.find((l) => l.userId === userId);
      if (!userLabel) {
        throw new Error("No label found. Please create a label first.");
      }
      finalLabelId = userLabel._id;
    } else {
      finalLabelId = labelId;
    }

    // Create task from the event using createTaskAndEmbeddings
    await ctx.runAction(api.tasks.createTaskAndEmbeddings, {
      taskName: summary,
      description: description || "",
      priority: priority || 1,
      dueDate: endTime,
      startDate: startTime,
      endDate: endTime,
      projectId: finalProjectId,
      labelId: finalLabelId,
    });

    // Get all user tasks to find the created one
    const allTasks = await ctx.runQuery(api.tasks.get, {});
    const createdTask = allTasks.find(
      (t) => 
        t.taskName === summary && 
        t.startDate === startTime &&
        t.userId === userId
    );

    if (!createdTask) {
      throw new Error("Failed to find created task");
    }

    // Update task with calendar event ID
    await ctx.runMutation(api.tasks.updateTask, {
      taskId: createdTask._id,
      googleCalendarEventId: createdEvent.id,
    });

    return { eventId: createdEvent.id, taskId: createdTask._id };
  },
});

// Update event in Google Calendar
export const updateCalendarEvent = action({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const task = await ctx.runQuery(api.tasks.getTaskById, { taskId });
    if (!task || !task.userId || task.userId !== userId) {
      throw new Error("Task not found");
    }

    if (!task.googleCalendarEventId) {
      throw new Error("Task is not linked to a calendar event");
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, refresh it
      accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
    }

    // Use startDate/endDate if available, otherwise fallback to dueDate
    const startTime = task.startDate || task.dueDate;
    const endTime = task.endDate || (task.startDate ? task.startDate + 3600000 : (task.dueDate ? task.dueDate + 3600000 : null));

    if (!startTime) {
      throw new Error("Task must have a start date or due date to update calendar event");
    }

    if (!endTime) {
      throw new Error("Task must have an end date or due date to update calendar event");
    }

    const event: {
      summary: string;
      description: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    } = {
      summary: task.taskName || "Task",
      description: task.description || "",
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response: Response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.googleCalendarEventId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update calendar event: ${error}`);
    }

    return await response.json() as { id: string };
  },
});

// Delete event from Google Calendar
export const deleteCalendarEvent = action({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }): Promise<boolean> => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const task = await ctx.runQuery(api.tasks.getTaskById, { taskId });
    if (!task || !task.userId || task.userId !== userId) {
      throw new Error("Task not found");
    }

    if (!task.googleCalendarEventId) {
      return true; // Already not linked
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, refresh it
      accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
    }

    const response: Response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.googleCalendarEventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete calendar event: ${error}`);
    }

    // Remove calendar event ID from task
    await ctx.runMutation(api.tasks.updateTask, {
      taskId,
      googleCalendarEventId: undefined,
    });

    return true;
  },
});

// Get access token (internal query)
export const getAccessToken = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const token = await getGoogleAccessTokenFromQuery(ctx, userId);
    if (!token) {
      // Token expired or missing - need to refresh via action
      throw new Error("Token expired - refresh needed");
    }

    return token;
  },
});

// Refresh access token (action)
export const refreshAccessToken = action({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const account = await ctx.runQuery(api.googleCalendar.getAccountForRefresh, {});
    if (!account || !account.refresh_token) {
      throw new Error("No refresh token available");
    }

    const refreshedToken = await refreshGoogleToken(account.refresh_token);
    
    await ctx.runMutation(api.googleCalendar.updateAccountToken, {
      accountId: account._id,
      access_token: refreshedToken.access_token,
      expires_at: refreshedToken.expires_at,
      refresh_token: refreshedToken.refresh_token || account.refresh_token,
    });

    return refreshedToken.access_token;
  },
});

// Get account for refresh (internal query)
export const getAccountForRefresh = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return null;
    }

    const account = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "google"))
      .first();

    return account;
  },
});

// Update account token (internal mutation)
export const updateAccountToken = mutation({
  args: {
    accountId: v.id("accounts"),
    access_token: v.string(),
    expires_at: v.number(),
    refresh_token: v.string(),
  },
  handler: async (ctx, { accountId, access_token, expires_at, refresh_token }) => {
    await ctx.db.patch(accountId, {
      access_token,
      expires_at,
      refresh_token,
    });
  },
});

// Update account scope to include calendar
export const updateAccountScope = mutation({
  args: {
    scope: v.string(),
  },
  handler: async (ctx, { scope }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const account = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "google"))
      .first();

    if (!account) {
      throw new Error("No Google account found");
    }

    await ctx.db.patch(account._id, {
      scope: scope,
    });

    return true;
  },
});

// Check if user has Google Calendar connected
// This checks both scope and tries to verify access token exists
export const isCalendarConnected = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return false;
    }

    const account = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "google"))
      .first();

    if (!account || !account.access_token) {
      return false;
    }

    // Check if scope includes calendar (check both full URL and just "calendar")
    const scope = account.scope || "";
    const hasCalendarScope = 
      scope.includes("calendar") || 
      scope.includes("https://www.googleapis.com/auth/calendar");
    
    // If we have access_token, assume it works (scope might not be saved properly by NextAuth)
    // The actual API call will fail if there's no access
    return hasCalendarScope || !!account.access_token;
  },
});

// Get events from Google Calendar for a date range
export const getCalendarEvents = action({
  args: {
    timeMin: v.optional(v.number()),
    timeMax: v.optional(v.number()),
  },
  handler: async (ctx, { timeMin, timeMax }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, try to refresh it
      try {
        accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
      } catch (refreshError: unknown) {
        const errorMessage = refreshError instanceof Error ? refreshError.message : "Unknown error";
        // Check if it's a "no refresh token" error
        if (errorMessage.includes("No refresh token")) {
          throw new Error("REAUTH_NEEDED: No refresh token available. Please sign out and sign in again to grant calendar permissions.");
        }
        throw new Error(`Failed to refresh token: ${errorMessage}. Please re-authenticate.`);
      }
    }

    // Default to current month if not provided
    const startDate = timeMin ? new Date(timeMin) : moment().startOf("month").toDate();
    const endDate = timeMax ? new Date(timeMax) : moment().endOf("month").toDate();

    const timeMinISO = startDate.toISOString();
    const timeMaxISO = endDate.toISOString();

    const response: Response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMinISO}&timeMax=${timeMaxISO}&singleEvents=true&orderBy=startTime`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch calendar events: ${error}`);
    }

    const data: {
      items: Array<{
        id: string;
        summary: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
        description?: string;
      }>;
    } = await response.json();

    return data.items.map((event) => ({
      id: event.id,
      title: event.summary || "No title",
      start: event.start.dateTime || event.start.date || "",
      end: event.end.dateTime || event.end.date || "",
      description: event.description || "",
      isAllDay: !event.start.dateTime, // If no dateTime, it's an all-day event
    }));
  },
});

// Debug: Get account info for debugging
export const getAccountInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return null;
    }

    const account = await ctx.db
      .query("accounts")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("provider"), "google"))
      .first();

    if (!account) {
      return { exists: false };
    }

    return {
      exists: true,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      scope: account.scope || "(no scope)",
      expiresAt: account.expires_at,
      isExpired: account.expires_at ? account.expires_at < Date.now() : null,
    };
  },
});

// Debug function to see all accounts and sessions for current user
export const debugUserAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return { error: "Not authenticated" };
    }

    // Get all accounts for this user
    const accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Get all sessions for this user
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return {
      userId,
      accountsCount: accounts.length,
      sessionsCount: sessions.length,
      accounts: accounts.map((acc) => ({
        _id: acc._id,
        provider: acc.provider,
        hasAccessToken: !!acc.access_token,
        hasRefreshToken: !!acc.refresh_token,
        scope: acc.scope,
        expiresAt: acc.expires_at,
        createdAt: acc._creationTime,
      })),
      sessions: sessions.map((sess) => ({
        _id: sess._id,
        expires: sess.expires,
        createdAt: sess._creationTime,
      })),
    };
  },
});

// Delete all accounts and sessions for current user (for debugging)
export const deleteAllUserAccountsAndSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Delete all accounts
    const accounts = await ctx.db
      .query("accounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    // Delete all sessions
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return {
      deletedAccounts: accounts.length,
      deletedSessions: sessions.length,
    };
  },
});
