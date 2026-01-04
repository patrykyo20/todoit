import { Id } from "./_generated/dataModel";
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import moment from "moment";
import { getEmbeddingsWithAI } from "./openapi";
import { api } from "./_generated/api";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();
    }
    return [];
  },
});

export const getCompletedTasksByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .filter((q) => q.eq(q.field("isCompleted"), true))
        .collect();
    }
    return [];
  },
});

export const getTasksByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .collect();
    }
    return [];
  },
});

export const getIncompleteTasksByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .filter((q) => q.eq(q.field("isCompleted"), false))
        .collect();
    }
    return [];
  },
});

export const getTasksTotalByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("projectId"), projectId))
        .filter((q) => q.eq(q.field("isCompleted"), true))
        .collect();

      return tasks?.length || 0;
    }
    return 0;
  },
});

export const todayTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);

    if (userId) {
      const todayStart = moment().startOf("day");
      const todayEnd = moment().endOf("day");

      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter(
          (q) =>
            q.gte(q.field("dueDate"), todayStart.valueOf()) &&
            q.lte(todayEnd.valueOf(), q.field("dueDate"))
        )
        .collect();
    }
    return [];
  },
});

export const overdueTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);

    if (userId) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.lt(q.field("dueDate"), todayStart.getTime()))
        .collect();
    }
    return [];
  },
});

export const completedTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("isCompleted"), true))
        .collect();
    }
    return [];
  },
});

export const incompleteTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      return await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("isCompleted"), false))
        .collect();
    }
    return [];
  },
});

export const totalTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (userId) {
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.eq(q.field("isCompleted"), true))
        .collect();
      return tasks.length || 0;
    }
    return 0;
  },
});

export const checkTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return null;
    }

    await ctx.db.patch(taskId, { isCompleted: true });

    const subtasks = await ctx.db
      .query("subTasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("parentId"), taskId))
      .collect();

    await Promise.all(
      subtasks.map((subtask) =>
        ctx.db.patch(subtask._id, { isCompleted: true })
      )
    );

    return taskId;
  },
});

export const uncheckTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return null;
    }

    // Update task status
    await ctx.db.patch(taskId, { isCompleted: false });

    // Uncheck all subtasks (regardless of their current status)
    const subtasks = await ctx.db
      .query("subTasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("parentId"), taskId))
      .collect();

    // Uncheck all subtasks in parallel
    await Promise.all(
      subtasks.map((subtask) =>
        ctx.db.patch(subtask._id, { isCompleted: false })
      )
    );

    return taskId;
  },
});

export const createTask = mutation({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (
    ctx,
    {
      taskName,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      projectId,
      labelId,
      embedding,
    }
  ) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const newTaskId = await ctx.db.insert("tasks", {
          userId,
          taskName,
          description,
          priority,
          dueDate,
          startDate,
          endDate,
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

export const createTaskAndEmbeddings = action({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
  },
  handler: async (
    ctx,
    {
      taskName,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      projectId,
      labelId,
    }
  ) => {
    const embedding = await getEmbeddingsWithAI(taskName);
    await ctx.runMutation(api.tasks.createTask, {
      taskName,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      projectId,
      labelId,
      embedding,
    });
  },
});

export const groupTasksByDate = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);

    if (userId) {
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .filter((q) => q.gt(q.field("dueDate"), new Date().getTime()))
        .collect();

      const groupedtasks = tasks.reduce<Record<string, typeof tasks>>(
        (acc, task) => {
          const dueDate = new Date(task?.dueDate ?? 0).toDateString();
          acc[dueDate] = (acc[dueDate] || []).concat(task);
          return acc;
        },
        {}
      );

      return groupedtasks;
    }
    return [];
  },
});

export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) {
      return null;
    }
    const task = await ctx.db.get(taskId);
    if (!task || task.userId !== userId) {
      return null;
    }
    return task;
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    taskName: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.union(v.number(), v.null())),
    endDate: v.optional(v.union(v.number(), v.null())),
    projectId: v.optional(v.id("projects")),
    labelId: v.optional(v.id("labels")),
    googleCalendarEventId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (
    ctx,
    {
      taskId,
      taskName,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      projectId,
      labelId,
      googleCalendarEventId,
    }
  ) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const updateData: {
          taskName?: string;
          description?: string;
          priority?: number;
          dueDate?: number;
          startDate?: number;
          endDate?: number;
          projectId?: Id<"projects">;
          labelId?: Id<"labels">;
          googleCalendarEventId?: string;
        } = {};
        if (taskName !== undefined) updateData.taskName = taskName;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (startDate !== undefined)
          updateData.startDate = startDate || undefined;
        if (endDate !== undefined) updateData.endDate = endDate || undefined;
        if (projectId !== undefined) updateData.projectId = projectId;
        if (labelId !== undefined) updateData.labelId = labelId;
        if (googleCalendarEventId !== undefined)
          updateData.googleCalendarEventId = googleCalendarEventId || undefined;

        await ctx.db.patch(taskId, updateData);
        return taskId;
      }
      return null;
    } catch {
      return null;
    }
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    try {
      const userId = await handleUserId(ctx);
      if (userId) {
        const deletedTaskId = await ctx.db.delete(taskId);
        //query tasks and map through them and delete

        return deletedTaskId;
      }

      return null;
    } catch {
      return null;
    }
  },
});

export const getAllTasksData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);

    if (!userId) {
      return {
        all: [],
        completed: [],
        incomplete: [],
        total: 0,
        today: [],
        overdue: [],
        groupedByDate: {},
      };
    }

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    const todayStartTimestamp = todayStart.valueOf();
    const todayEndTimestamp = todayEnd.valueOf();
    const nowStart = new Date();
    nowStart.setHours(0, 0, 0, 0);
    const nowStartTimestamp = nowStart.getTime();

    // Filter upcoming tasks (future dates, not completed)
    const upcomingTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate > nowStartTimestamp && !t.isCompleted
    );

    // Group upcoming tasks by date
    const groupedByDate = upcomingTasks.reduce<Record<string, typeof tasks>>(
      (acc, task) => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate).toDateString();
          if (!acc[dueDate]) {
            acc[dueDate] = [];
          }
          acc[dueDate].push(task);
        }
        return acc;
      },
      {}
    );

    return {
      all: tasks,
      completed: tasks.filter((t) => t.isCompleted),
      incomplete: tasks.filter((t) => !t.isCompleted),
      total: tasks.filter((t) => t.isCompleted).length,
      today: tasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate >= todayStartTimestamp &&
          t.dueDate <= todayEndTimestamp
      ),
      overdue: tasks.filter(
        (t) => t.dueDate && t.dueDate < nowStartTimestamp && !t.isCompleted
      ),
      groupedByDate,
    };
  },
});
