import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const searchTasks = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }): Promise<Doc<"tasks">[]> => {
    try {
      const userId = await handleUserId(ctx);

      if (!userId) {
        console.log("Search: No userId found");
        return [];
      }

      if (!query || query.trim() === "") {
        console.log("Search: Empty query");
        return [];
      }

      const trimmedQuery = query.trim();
      const queryLower = trimmedQuery.toLowerCase();

      console.log("Search: Starting search for:", trimmedQuery);

      // Use only text search for precise matching
      const textResults = await ctx.runQuery(api.search.searchTasksByText, {
        query: trimmedQuery,
        userId,
      });

      console.log("Search: Found", textResults.length, "text results");

      // Use text results only - no vector search
      const allResults = textResults.map((task) => ({ task, isTextResult: true }));

      // Sort by relevance - precise text matching only
      const sortedResults = allResults
        .map(({ task: doc }) => {
          const taskName = (doc.taskName || doc.text || "").trim();
          const description = (doc.description || "").trim();
          const taskNameLower = taskName.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const exactMatchInTitle = taskNameLower === queryLower;
          const exactMatchInDescription = descriptionLower === queryLower;
          const exactMatchInTitleCaseSensitive = taskName === trimmedQuery;
          const exactMatchInDescriptionCaseSensitive = description === trimmedQuery;
          const startsWithInTitle = taskNameLower.startsWith(queryLower);
          const containsInTitle = taskNameLower.includes(queryLower);
          const startsWithInDescription = descriptionLower.startsWith(queryLower);
          const containsInDescription = descriptionLower.includes(queryLower);
          
          let matchPriority = 999;
          let secondarySort = 0; // Lower is better
          
          // Priority -1: Exact match in BOTH title AND description (case-insensitive)
          if (exactMatchInTitle && exactMatchInDescription) {
            matchPriority = -2;
            secondarySort = 0;
          }
          // Priority -1: Exact match in BOTH title AND description (case-sensitive)
          else if (taskName === trimmedQuery && description === trimmedQuery) {
            matchPriority = -1;
            secondarySort = 0;
          }
          // Priority 0: Exact match in title (case-sensitive) - best single match
          else if (exactMatchInTitleCaseSensitive) {
            matchPriority = 0;
            secondarySort = taskName.length;
          }
          // Priority 1: Exact match in title (case-insensitive)
          else if (exactMatchInTitle) {
            matchPriority = 1;
            secondarySort = taskName.length;
          }
          // Priority 2: Exact match in description (case-sensitive)
          else if (exactMatchInDescriptionCaseSensitive) {
            matchPriority = 2;
            secondarySort = description.length;
          }
          // Priority 3: Exact match in description (case-insensitive)
          else if (exactMatchInDescription) {
            matchPriority = 3;
            secondarySort = description.length;
          }
          // Priority 4: Starts with query in title
          else if (startsWithInTitle) {
            matchPriority = 4;
            secondarySort = taskName.length;
          }
          // Priority 5: Contains query in title
          else if (containsInTitle) {
            matchPriority = 5;
            secondarySort = taskName.length;
          }
          // Priority 6: Starts with query in description
          else if (startsWithInDescription) {
            matchPriority = 6;
            secondarySort = description.length;
          }
          // Priority 7: Contains query in description
          else if (containsInDescription) {
            matchPriority = 7;
            secondarySort = description.length;
          }
          
          console.log(`Task: "${taskName}" | Description: "${description}" | Priority: ${matchPriority} | Secondary: ${secondarySort}`);
          
          return { doc, matchPriority, secondarySort };
        })
        .sort((a, b) => {
          // First sort by match priority (lower = better)
          if (a.matchPriority !== b.matchPriority) {
            return a.matchPriority - b.matchPriority;
          }
          // Then by secondary sort (shorter = better for same priority)
          if (a.secondarySort !== b.secondarySort) {
            return a.secondarySort - b.secondarySort;
          }
          // Finally by creation time (newer first)
          return (b.doc._creationTime || 0) - (a.doc._creationTime || 0);
        })
        .map((item) => item.doc);

      console.log("Search: Returning", sortedResults.length, "sorted results");
      return sortedResults;
    } catch (error) {
      console.error("Search error in handler:", error);
      throw error;
    }
  },
});

// New query for traditional text search
export const searchTasksByText = query({
  args: {
    query: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { query, userId }) => {
    const queryLower = query.toLowerCase().trim();
    const queryExact = query.trim();
    
    // Get all user tasks
    const allTasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    // Filter by text match in taskName or description
    const matchingTasks = allTasks.filter((task) => {
      const taskName = (task.taskName || task.text || "").trim();
      const description = (task.description || "").trim();
      const taskNameLower = taskName.toLowerCase();
      const descriptionLower = description.toLowerCase();
      
      // Check for exact or partial matches
      return (
        taskNameLower === queryLower ||
        taskName === queryExact ||
        taskNameLower.includes(queryLower) ||
        descriptionLower === queryLower ||
        description === queryExact ||
        descriptionLower.includes(queryLower)
      );
    });
    
    console.log(`Text search for "${query}": found ${matchingTasks.length} tasks`);
    matchingTasks.forEach((task) => {
      console.log(`  - "${task.taskName || task.text}" | "${task.description}"`);
    });
    
    return matchingTasks;
  },
});

export const getTasksByIds = query({
  args: {
    taskIds: v.array(v.id("tasks")),
    userId: v.id("users"),
  },
  handler: async (ctx, { taskIds, userId }) => {
    const documents: Doc<"tasks">[] = [];
    for (const taskId of taskIds) {
      const task = await ctx.db.get(taskId);
      if (task && task.userId === userId) {
        documents.push(task);
      }
    }
    return documents;
  },
});