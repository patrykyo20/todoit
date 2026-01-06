"use client";

import { FC } from "react";
import { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import moment from "moment";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { CardFooter } from "@/components/ui/Card";
import { TaskDateRangeField } from "./TaskDateRangeField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { useKeyboardShortcuts } from "@/hooks";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GET_STARTED_PROJECT_ID } from "@/utils";
import { useTaskStore } from "@/stores/taskStore";
import { useState } from "react";

const FormSchema = z.object({
  taskName: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  description: z.string(),
  dueDate: z.date({ message: "A due date is required" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  frequency: z.string().optional(),
  priority: z.string().min(1, { message: "Please select a priority" }),
  projectId: z.string().min(1, { message: "Please select a Project" }),
});

interface AddTaskInlineProps {
  setShowAddTask: Dispatch<SetStateAction<boolean>>;
  parentTask?: Doc<"tasks">;
  projectId?: Id<"projects">;
  enableKeyboardShortcuts?: boolean;
}

export const AddTaskInline: FC<AddTaskInlineProps> = ({
  setShowAddTask,
  parentTask,
  projectId: myProjectId,
  enableKeyboardShortcuts = false,
}) => {
  const projectId =
    myProjectId ||
    parentTask?.projectId ||
    (GET_STARTED_PROJECT_ID as Id<"projects">);

  const priority = parentTask?.priority?.toString() || "1";
  const parentId = parentTask?._id;

  const { toast } = useToast();
  const { projects: allProjects } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  // Filtruj duplikaty projektów na podstawie _id
  const projects = allProjects.filter(
    (project, index, self) =>
      index === self.findIndex((p) => p._id === project._id)
  );

  const createSubTaskEmbeddings = useAction(
    api.subTasks.createSubTaskAndEmbeddings
  );

  const createTaskEmbeddings = useAction(api.tasks.createTaskAndEmbeddings);

  const defaultValues: z.infer<typeof FormSchema> = {
    taskName: "",
    description: "",
    priority,
    dueDate: new Date(),
    startDate: undefined,
    endDate: undefined,
    startTime: "",
    endTime: "",
    frequency: undefined,
    projectId: projectId.toString(),
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  // Handle form submission for keyboard shortcuts
  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    isEnabled: enableKeyboardShortcuts,
    isSaving: isLoading,
    isDeleting: false, // No delete action when creating
    onSave: handleSubmit,
    onDelete: () => {}, // No delete action when creating
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      taskName,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      startTime,
      endTime,
      frequency,
      projectId,
    } = data;

    // Helper function to combine date and time into timestamp
    const combineDateAndTime = (
      date: Date | undefined,
      time: string | undefined
    ): number | undefined => {
      if (!date || !time) return undefined;
      const [hours, minutes] = time.split(":").map(Number);
      const combined = new Date(date);
      combined.setHours(hours, minutes, 0, 0);
      return combined.getTime();
    };

    const startDateTimestamp = combineDateAndTime(startDate, startTime);
    const endDateTimestamp = combineDateAndTime(endDate, endTime);

    if (projectId) {
      setIsLoading(true);
      try {
        if (parentId) {
          // Create sub-task
          await createSubTaskEmbeddings({
            parentId,
            taskName,
            description,
            priority: parseInt(priority),
            dueDate: moment(dueDate).valueOf(),
            projectId: projectId as Id<"projects">,
            labelId: "k579xwsz7e2y73rxexkrg2f5j96tzt4f" as Id<"labels">,
          });

          toast({
            title: "🦄 Created a task!",
            duration: 3000,
          });
          form.reset({ ...defaultValues });
          setShowAddTask(false);
        } else {
          // Create regular task
          await createTaskEmbeddings({
            taskName,
            description,
            priority: parseInt(priority),
            dueDate: moment(dueDate).valueOf(),
            startDate: startDateTimestamp,
            endDate: endDateTimestamp,
            frequency: frequency || undefined,
            projectId: projectId as Id<"projects">,
            labelId: "k579xwsz7e2y73rxexkrg2f5j96tzt4f" as Id<"labels">,
          });

          toast({
            title: "🦄 Created a task!",
            duration: 3000,
          });
          form.reset({ ...defaultValues });
          setShowAddTask(false);
        }
      } catch {
        toast({
          title: "❌ Error creating task",
          description: "Please try again",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 border-2 p-2 my-2 rounded-xl px-3 pt-4 border-foreground/20"
        >
          <FormField
            control={form.control}
            name="taskName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="taskName"
                    type="text"
                    placeholder="Enter your Task name"
                    required
                    className="border-0 font-semibold text-lg"
                    {...field}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.metaKey &&
                        !e.ctrlKey
                      ) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Add description, lists, images..."
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex gap-2 flex-col">
            <FormField
              control={form.control}
              name="dueDate"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <TaskDateRangeField
                      startDate={form.watch("startDate")}
                      endDate={form.watch("endDate")}
                      startTime={form.watch("startTime") || ""}
                      endTime={form.watch("endTime") || ""}
                      frequency={form.watch("frequency")}
                      onStartDateChange={(date) => {
                        form.setValue("startDate", date);
                        if (!form.watch("dueDate") && date) {
                          form.setValue("dueDate", date);
                        }
                      }}
                      onEndDateChange={(date) => form.setValue("endDate", date)}
                      onStartTimeChange={(time) =>
                        form.setValue("startTime", time)
                      }
                      onEndTimeChange={(time) => form.setValue("endTime", time)}
                      onFrequencyChange={(freq) =>
                        form.setValue("frequency", freq)
                      }
                      onSave={() => {}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={priority}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4].map((item) => (
                        <SelectItem key={item} value={item.toString()}>
                          Priority {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={projectId || field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <CardFooter className="flex flex-col lg:flex-row lg:justify-between gap-2 border-t-2 pt-3">
            <div className="w-full lg:w-1/4"></div>
            <div className="flex gap-3 self-end">
              <Button
                className="bg-gray-300/40 text-gray-950 px-6 hover:bg-gray-300 cursor-pointer transition-colors"
                variant={"outline"}
                onClick={() => setShowAddTask(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="px-6 w-full block cursor-pointer hover:bg-primary/90 transition-colors"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add task"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </div>
  );
};
