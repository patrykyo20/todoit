import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { getEmbeddingsWithAI } from "./openapi";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("subTasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();
    }
    return [];
  },
});

export const getSubTasksByParentId = query({
  args: {
    parentId: v.id("tasks"),
  },
  handler: async (ctx, { parentId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("subTasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("parentId"), parentId))
        .collect();
    }
    return [];
  },
});

export const checkSubTask = mutation({
  args: { taskId: v.id("subTasks") },
  handler: async (ctx, { taskId }) => {
    const newTaskId = await ctx.db.patch(taskId, { isCompleted: true });
    return newTaskId;
  },
});

export const uncheckSubTask = mutation({
  args: { taskId: v.id("subTasks") },
  handler: async (ctx, { taskId }) => {
    const newTaskId = await ctx.db.patch(taskId, { isCompleted: false });
    return newTaskId;
  },
});

export const createSubTask = mutation({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("tasks"),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (
    ctx,
    {
      taskName,
      description,
      priority,
      dueDate,
      projectId,
      labelId,
      parentId,
      embedding,
    }
  ) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const newTaskId = await ctx.db.insert("subTasks", {
          userId,
          parentId,
          taskName,
          description,
          priority,
          dueDate,
          projectId,
          labelId,
          isCompleted: false,
          embedding,
        });
        return newTaskId;
      }
      return null;
    } catch {
      return null;
    }
  },
});

export const createSubTaskAndEmbeddings = action({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("tasks"),
  },
  handler: async (
    ctx,
    { taskName, description, priority, dueDate, projectId, labelId, parentId }
  ) => {
    const embedding = await getEmbeddingsWithAI(taskName);
    await ctx.runMutation(api.subTasks.createSubTask, {
      taskName,
      description,
      priority,
      dueDate,
      projectId,
      labelId,
      parentId,
      embedding,
    });
  },
});

export const completedSubTasks = query({
  args: {
    parentId: v.id("tasks"),
  },
  handler: async (ctx, { parentId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const todos = await ctx.db
        .query("subTasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("parentId"), parentId))
        .filter((q) => q.eq(q.field("isCompleted"), true))
        .collect();

      return todos;
    }
    return [];
  },
});

export const incompleteSubTasks = query({
  args: {
    parentId: v.id("tasks"),
  },
  handler: async (ctx, { parentId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const tasks = await ctx.db
        .query("subTasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("parentId"), parentId))
        .filter((q) => q.eq(q.field("isCompleted"), false))
        .collect();
      return tasks;
    }
    return [];
  },
});

export const updateSubTask = mutation({
  args: {
    taskId: v.id("subTasks"),
    taskName: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
  },
  handler: async (
    ctx,
    { taskId, taskName, description, priority, dueDate, projectId, labelId }
  ) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const updateData: {
          taskName?: string;
          description?: string;
          priority?: number;
          dueDate?: number;
          projectId?: Id<"projects">;
          labelId?: Id<"labels">;
        } = {};
        if (taskName !== undefined) updateData.taskName = taskName;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (projectId !== undefined) updateData.projectId = projectId;
        if (labelId !== undefined) updateData.labelId = labelId;

        await ctx.db.patch(taskId, updateData);
        return taskId;
      }
      return null;
    } catch {
      return null;
    }
  },
});

export const deleteSubTask = mutation({
  args: {
    taskId: v.id("subTasks"),
  },
  handler: async (ctx, { taskId }) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const deletedTaskId = await ctx.db.delete(taskId);
        //query subTasks and map through them and delete

        return deletedTaskId;
      }

      return null;
    } catch {

      return null;
    }
  },
});