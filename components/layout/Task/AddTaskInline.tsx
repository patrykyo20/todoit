"use client";

import { FC } from "react";
import { Dispatch, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import moment from "moment";
import { CalendarIcon, Loader2 } from "lucide-react";

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
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { useKeyboardShortcuts } from "@/hooks";
import { cn } from "@/lib/utils";
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
    const { taskName, description, priority, dueDate, projectId } = data;

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
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex gap-2 w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
