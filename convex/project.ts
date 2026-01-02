import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { api } from "./_generated/api";

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const userProjects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      const systemProjects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("type"), "system"))
        .collect();

      // Połącz projekty i usuń duplikaty na podstawie _id
      const allProjects = [...systemProjects, ...userProjects];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p._id === project._id)
      );

      return uniqueProjects;
    }
    return [];
  },
});

export const getProjectByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const project = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("_id"), projectId))
        .collect();
      return project?.[0] || null;
    }
    return null;
  },
});

export const createAProject = mutation({
  args: {
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("in_progress"),
        v.literal("on_hold"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { name, status, startDate, endDate, description, color }) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const newProjectId = await ctx.db.insert("projects", {
          userId,
          name,
          type: "user",
          status: status || "planning",
          startDate,
          endDate,
          description,
          color,
          archived: false,
        });
        return newProjectId;
      }

      return null;
    } catch (err) {
      console.log("Error occurred during createAProject mutation", err);

      return null;
    }
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("in_progress"),
        v.literal("on_hold"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.union(v.number(), v.null())),
    endDate: v.optional(v.union(v.number(), v.null())),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, name, status, startDate, endDate, description, color, archived }) => {
    try {
      const userId = await handleUserId(ctx);
      if (!userId) return null;

      const updateData: {
        name?: string;
        status?: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
        startDate?: number;
        endDate?: number;
        description?: string;
        color?: string;
        archived?: boolean;
      } = {};

      if (name !== undefined) updateData.name = name;
      if (status !== undefined) updateData.status = status;
      if (startDate !== undefined) updateData.startDate = startDate || undefined;
      if (endDate !== undefined) updateData.endDate = endDate || undefined;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      if (archived !== undefined) updateData.archived = archived;

      await ctx.db.patch(projectId, updateData);
      return projectId;
    } catch (error) {
      console.error("Error updating project:", error);
      return null;
    }
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const taskId = await ctx.db.delete(projectId);
        //query tasks and map through them and delete

        return taskId;
      }

      return null;
    } catch {
      return null;
    }
  },
});

export const deleteProjectAndItsTasks = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    try {
      // const allTasks = await ctx.runQuery(api.tasks.getTasksByProjectId, {
      //   projectId,
      // });

      // const promises = Promise.allSettled(
      //   allTasks.map(async (task: Doc<"tasks">) =>
      //     ctx.runMutation(api.tasks.deleteATask, {
      //       taskId: task._id,
      //     })
      //   )
      // );
      // const statuses = await promises;

      await ctx.runMutation(api.project.deleteProject, {
        projectId,
      });
    } catch (err) {
      console.error("Error deleting tasks and projects", err);
    }
  },
});