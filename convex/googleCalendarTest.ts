import { action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { handleUserId } from "./auth";

// Get user ID (helper query)
export const getUserId = query({
  args: {},
  handler: async (ctx) => {
    return await handleUserId(ctx);
  },
});

// Test if Google Calendar API is accessible
export const testCalendarAccess = action({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.runQuery(api.googleCalendarTest.getUserId, {});
    if (!userId) {
      return { 
        connected: false, 
        message: "Not authenticated" 
      };
    }

    let accessToken: string;
    try {
      accessToken = await ctx.runQuery(api.googleCalendar.getAccessToken, {});
    } catch {
      // Token expired, refresh it
      accessToken = await ctx.runAction(api.googleCalendar.refreshAccessToken, {});
    }

    // Try to access calendar API
    const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return { 
        connected: true, 
        message: "Successfully connected to Google Calendar API" 
      };
    } else {
      const error = await response.text();
      return { 
        connected: false, 
        message: `Failed to access Calendar API: ${error}`,
        status: response.status 
      };
    }
  },
});
